from fastapi import FastAPI
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from ortools.sat.python import cp_model

app = FastAPI()


class Meal(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    mealName: str
    foodType: str
    category: str
    price: int
    establishmentName: str
    establishmentCategory: Optional[str] = ""
    location: Optional[str] = ""
    mealTime: List[str] = []
    healthScore: Optional[int] = 5
    isFried: Optional[bool] = False
    isSoup: Optional[bool] = False
    isVegetarian: Optional[bool] = False
    tags: List[str] = []
    allergens: List[str] = []
    mealQuality: Optional[str] = "light"
    isStandalone: Optional[bool] = True


class SolveMealPlansRequest(BaseModel):
    meals: List[Meal]
    budget: int
    mealsPerDay: int
    count: int = 3
    preferenceMode: str = "balanced"
    preferredTags: List[str] = []
    dislikedTags: List[str] = []
    excludeAllergens: List[str] = []
    categoryLimit: int = 3

    # Added for simple weekly support via repeated daily solves
    usedMealIds: List[str] = []
    usedEstablishments: List[str] = []


def get_meal_slots(meals_per_day: int) -> List[str]:
    if meals_per_day <= 1:
        return ["lunch"]
    if meals_per_day == 2:
        return ["lunch", "dinner"]
    if meals_per_day == 3:
        return ["breakfast", "lunch", "dinner"]
    if meals_per_day == 4:
        return ["breakfast", "lunch", "dinner", "snack"]
    return ["breakfast", "lunch", "dinner"]


def normalize_tags(meal: Meal) -> set[str]:
    return {tag.lower() for tag in meal.tags}


def has_tag(meal: Meal, value: str) -> bool:
    return value.lower() in normalize_tags(meal)


def has_excluded_allergen(meal: Meal, exclude_allergens: List[str]) -> bool:
    if not exclude_allergens:
        return False
    meal_allergens = {a.lower() for a in meal.allergens}
    blocked = {a.lower() for a in exclude_allergens}
    return len(meal_allergens.intersection(blocked)) > 0


def is_main(meal: Meal) -> bool:
    return meal.mealQuality == "main"


def is_light(meal: Meal) -> bool:
    return meal.mealQuality == "light"


def compute_preference_score(
    meal: Meal,
    preference_mode: str,
    preferred_tags: List[str],
    disliked_tags: List[str],
    used_meal_ids: List[str],
    used_establishments: List[str],
) -> int:
    score = 0

    meal_tags = normalize_tags(meal)
    preferred = {tag.lower() for tag in preferred_tags}
    disliked = {tag.lower() for tag in disliked_tags}
    used_meal_ids_set = {value.lower() for value in used_meal_ids}
    used_establishments_set = {value.lower() for value in used_establishments}

    score += 3 * len(meal_tags.intersection(preferred))
    score -= 3 * len(meal_tags.intersection(disliked))

    if meal.isSoup:
        score += 1
    if meal.isVegetarian:
        score += 1

    if meal.mealQuality == "main":
        score += 6
    elif meal.mealQuality == "light":
        score += 2

    if preference_mode == "cheapest":
        score += max(0, 120 - meal.price)
    elif preference_mode == "variety":
        score += 5
        if not meal.isFried:
            score += 1
    else:
        score += 8
        score += meal.healthScore or 5
        if meal.isFried:
            score -= 2

    # Simple weekly anti-repeat scoring
    if meal.id.lower() in used_meal_ids_set:
        score -= 20

    if meal.establishmentName and meal.establishmentName.lower() in used_establishments_set:
        score -= 6

    return score


def label_option(index: int, preference_mode: str) -> str:
    if preference_mode == "cheapest":
        labels = ["Best budget pick", "Cheapest alternative", "More budget left"]
    elif preference_mode == "variety":
        labels = ["Most variety", "Different picks", "Another varied option"]
    else:
        labels = ["Best match", "Balanced alternative", "Suggested option"]

    if index < len(labels):
        return labels[index]
    return "Suggested option"


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/solve")
def solve_meal_plans(req: SolveMealPlansRequest):
    print("SOLVER RECEIVED mealsPerDay:", req.mealsPerDay)
    meals = [meal for meal in req.meals if meal.isStandalone is not False]
    slots = get_meal_slots(req.mealsPerDay)
    print("SOLVER SLOTS:", slots)

    if not meals:
        return {"ok": False, "message": "No meals provided."}

    solutions = []
    excluded_solution_keys: List[List[str]] = []

    for solution_index in range(req.count):
        model = cp_model.CpModel()

        x = {}
        for s_idx, slot in enumerate(slots):
            for m_idx, meal in enumerate(meals):
                x[(s_idx, m_idx)] = model.NewBoolVar(f"x_{s_idx}_{m_idx}")

        # 1) Exactly one meal per slot
        for s_idx, slot in enumerate(slots):
            exact_matches = []
            fallback_matches = []

            for m_idx, meal in enumerate(meals):
                if has_excluded_allergen(meal, req.excludeAllergens):
                    model.Add(x[(s_idx, m_idx)] == 0)
                    continue

                normalized_meal_times = (
                    [m.lower() for m in meal.mealTime] if meal.mealTime else []
                )

                if not meal.mealTime or slot.lower() in normalized_meal_times:
                    exact_matches.append(x[(s_idx, m_idx)])
                    continue

                category = (meal.category or "").lower()
                food_type = (meal.foodType or "").lower()
                tags = normalize_tags(meal)

                if slot == "breakfast":
                    if (
                        "breakfast" in category
                        or "meal" in category
                        or "rice" in category
                        or "silog" in food_type
                        or "breakfast" in food_type
                        or "filling" in tags
                        or "rice meal" in tags
                        or meal.mealQuality == "main"
                    ):
                        fallback_matches.append(x[(s_idx, m_idx)])
                        continue

                if slot == "snack":
                    if meal.mealQuality == "light":
                        fallback_matches.append(x[(s_idx, m_idx)])
                        continue

                if slot in ["lunch", "dinner"]:
                    if meal.mealQuality == "main":
                        fallback_matches.append(x[(s_idx, m_idx)])
                        continue

                model.Add(x[(s_idx, m_idx)] == 0)

            allowed_vars = exact_matches if exact_matches else fallback_matches
            blocked_vars = fallback_matches if exact_matches else []

            if not allowed_vars:
                return {
                    "ok": False,
                    "message": f"No feasible meals available for slot '{slot}'.",
                }

            # exactly one from the chosen set
            model.Add(sum(allowed_vars) == 1)

            # if exact matches exist, fallback matches must be disabled
            for var in blocked_vars:
                model.Add(var == 0)

        # 2) Budget constraint
        model.Add(
            sum(
                x[(s_idx, m_idx)] * meals[m_idx].price
                for s_idx in range(len(slots))
                for m_idx in range(len(meals))
            )
            <= req.budget
        )

        # 3) Same exact meal cannot be selected more than once
        for m_idx in range(len(meals)):
            model.Add(sum(x[(s_idx, m_idx)] for s_idx in range(len(slots))) <= 1)

        # 4) Category variety limit
        if req.categoryLimit > 0:
            categories = sorted({meal.category for meal in meals if meal.category})
            for category in categories:
                model.Add(
                    sum(
                        x[(s_idx, m_idx)]
                        for s_idx in range(len(slots))
                        for m_idx, meal in enumerate(meals)
                        if meal.category == category
                    )
                    <= req.categoryLimit
                )

        # 5) Control main vs snack balance
        main_indices = [
            m_idx for m_idx, meal in enumerate(meals) if is_main(meal)
        ]
        light_indices = [
            m_idx for m_idx, meal in enumerate(meals) if is_light(meal)
        ]

        if main_indices:
            main_count = sum(
                x[(s_idx, m_idx)]
                for s_idx in range(len(slots))
                for m_idx in main_indices
            )

            if req.mealsPerDay >= 3:
                if req.budget <= 120:
                    model.Add(main_count >= 1)
                else:
                    model.Add(main_count >= 2)
            else:
                model.Add(main_count >= 1)

        if light_indices:
            light_count = sum(
                x[(s_idx, m_idx)]
                for s_idx in range(len(slots))
                for m_idx in light_indices
            )

            if req.budget <= 120 and req.mealsPerDay >= 3:
                model.Add(light_count <= 2)
            else:
                model.Add(light_count <= 1)

        # 6) Limit highly repetitive meal families
        family_limits = {
            "siomai": 1,
            "shanghai": 1,
            "sharksfin": 1,
            "wings": 1,
            "burger": 1,
            "pasta": 1,
            "sisig": 1,
            "inasal": 1,
            "bulgogi": 1,
        }

        for family, family_limit in family_limits.items():
            family_indices = [
                m_idx for m_idx, meal in enumerate(meals) if has_tag(meal, family)
            ]

            if family_indices:
                model.Add(
                    sum(
                        x[(s_idx, m_idx)]
                        for s_idx in range(len(slots))
                        for m_idx in family_indices
                    )
                    <= family_limit
                )

        # 6.5) Limit repeated protein types
        protein_limits = {
            "chicken": 2,
            "pork": 2,
            "beef": 2,
            "fish": 2,
            "tuna": 2,
            "spam": 1,
            "sausage": 1,
            "longganisa": 1,
            "hotdog": 1,
        }

        for protein, protein_limit in protein_limits.items():
            protein_indices = [
                m_idx for m_idx, meal in enumerate(meals) if has_tag(meal, protein)
            ]

            if protein_indices:
                model.Add(
                    sum(
                        x[(s_idx, m_idx)]
                        for s_idx in range(len(slots))
                        for m_idx in protein_indices
                    )
                    <= protein_limit
                )

        # 7) Limit same establishment repetition
        establishment_names = sorted(
            {meal.establishmentName for meal in meals if meal.establishmentName}
        )

        establishment_limit = 2 if req.mealsPerDay >= 3 else req.mealsPerDay

        for establishment in establishment_names:
            establishment_indices = [
                m_idx
                for m_idx, meal in enumerate(meals)
                if meal.establishmentName == establishment
            ]

            if establishment_indices:
                model.Add(
                    sum(
                        x[(s_idx, m_idx)]
                        for s_idx in range(len(slots))
                        for m_idx in establishment_indices
                    )
                    <= establishment_limit
                )

        # 8) Exclude previous solutions by meal set, regardless of slot order
        for prev_solution in excluded_solution_keys:
            prev_indices = [
                m_idx for m_idx, meal in enumerate(meals) if meal.id in prev_solution
            ]

            if prev_indices:
                model.Add(
                    sum(
                        x[(s_idx, m_idx)]
                        for s_idx in range(len(slots))
                        for m_idx in prev_indices
                    )
                    <= len(prev_indices) - 1
                )

        # Objective
        objective_terms = []
        for s_idx in range(len(slots)):
            for m_idx, meal in enumerate(meals):
                meal_score = compute_preference_score(
                    meal,
                    req.preferenceMode,
                    req.preferredTags,
                    req.dislikedTags,
                    req.usedMealIds,
                    req.usedEstablishments,
                )
                objective_terms.append(x[(s_idx, m_idx)] * meal_score)

        model.Maximize(sum(objective_terms))

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 5.0

        status = solver.Solve(model)

        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            break

        picked_meals = []
        picked_meal_ids = []

        for s_idx in range(len(slots)):
            for m_idx, meal in enumerate(meals):
                if solver.Value(x[(s_idx, m_idx)]) == 1:
                    picked_meals.append(meal.model_dump(by_alias=True))
                    picked_meal_ids.append(meal.id)

        if not picked_meals:
            break

        total_cost = sum(meal["price"] for meal in picked_meals)
        remaining_budget = req.budget - total_cost
        score = int(solver.ObjectiveValue())

        solutions.append(
            {
                "meals": picked_meals,
                "totalCost": total_cost,
                "remainingBudget": remaining_budget,
                "score": score,
                "label": label_option(solution_index, req.preferenceMode),
            }
        )

        excluded_solution_keys.append(sorted(picked_meal_ids))

        print("SOLVER PICKED COUNT:", len(picked_meals))
        print("SOLVER PICKED MEALS:", [meal["mealName"] for meal in picked_meals])

    if not solutions:
        cheapest_prices = sorted([meal.price for meal in meals])
        min_possible = (
            sum(cheapest_prices[: len(slots)])
            if len(cheapest_prices) >= len(slots)
            else None
        )

        if min_possible and min_possible > req.budget:
            return {
                "ok": False,
                "message": f"₱{req.budget} may be too low for {req.mealsPerDay} meals. Try at least ₱{min_possible} or reduce meals per day.",
            }

        return {
            "ok": False,
            "message": "We couldn't find a meal plan with your current budget. Try increasing your budget or adjusting preferences.",
        }

    return {
        "ok": True,
        "options": solutions,
    }