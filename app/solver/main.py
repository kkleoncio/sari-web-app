from fastapi import FastAPI
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from ortools.sat.python import cp_model
import hashlib

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

    usedMealIds: List[str] = []
    usedEstablishments: List[str] = []


WEEK_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]


def build_day_budget(total_budget: int, day_index: int) -> int:
    base = total_budget // 7
    remainder = total_budget % 7
    return base + (1 if day_index < remainder else 0)


def build_weekly_label(index: int, preference_mode: str) -> str:
    if preference_mode == "cheapest":
        return "Best weekly budget pick" if index == 0 else "Another weekly option"
    if preference_mode == "variety":
        return "Most varied weekly plan" if index == 0 else "Another weekly option"
    return "Best weekly match" if index == 0 else "Another weekly option"


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


def tiny_tiebreak_bonus(meal_id: str, solution_index: int) -> int:
    raw = f"{meal_id}:{solution_index}".encode()
    digest = hashlib.md5(raw).hexdigest()
    return int(digest[:2], 16) % 3


def compute_preference_score_precomputed(
    meal: Meal,
    meal_tags: set[str],
    preference_mode: str,
    preferred: set[str],
    disliked: set[str],
    used_meal_ids_set: set[str],
    used_establishments_set: set[str],
    solution_index: int,
) -> int:
    score = 0

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

    if meal.id.lower() in used_meal_ids_set:
        score -= 55

    if meal.establishmentName and meal.establishmentName.lower() in used_establishments_set:
        score -= 18

    score += tiny_tiebreak_bonus(meal.id, solution_index)

    return score


def solve_daily_options(req: SolveMealPlansRequest) -> dict:
    meals = [meal for meal in req.meals if meal.isStandalone is not False]
    print(f"[solver] candidate meals received: {len(meals)}")
    slots = get_meal_slots(req.mealsPerDay)

    if not meals:
        return {"ok": False, "message": "No meals provided."}

    preferred_set = {tag.lower() for tag in req.preferredTags}
    disliked_set = {tag.lower() for tag in req.dislikedTags}
    blocked_allergens = {a.lower() for a in req.excludeAllergens}

    base_used_meal_ids_set = {value.lower() for value in req.usedMealIds}
    base_used_establishments_set = {value.lower() for value in req.usedEstablishments}

    normalized_tags_by_index: List[set[str]] = []
    normalized_allergens_by_index: List[set[str]] = []
    normalized_meal_times_by_index: List[set[str]] = []

    main_indices: List[int] = []
    light_indices: List[int] = []

    categories_map: dict[str, List[int]] = {}
    establishments_map: dict[str, List[int]] = {}

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

    family_indices_map: dict[str, List[int]] = {family: [] for family in family_limits}
    protein_indices_map: dict[str, List[int]] = {protein: [] for protein in protein_limits}

    for m_idx, meal in enumerate(meals):
        tags_set = {tag.lower() for tag in meal.tags}
        allergens_set = {a.lower() for a in meal.allergens}
        meal_times_set = {m.lower() for m in meal.mealTime} if meal.mealTime else set()

        normalized_tags_by_index.append(tags_set)
        normalized_allergens_by_index.append(allergens_set)
        normalized_meal_times_by_index.append(meal_times_set)

        if meal.mealQuality == "main":
            main_indices.append(m_idx)
        if meal.mealQuality == "light":
            light_indices.append(m_idx)

        if meal.category:
            categories_map.setdefault(meal.category, []).append(m_idx)

        if meal.establishmentName:
            establishments_map.setdefault(meal.establishmentName.lower(), []).append(m_idx)

        for family in family_limits:
            if family in tags_set:
                family_indices_map[family].append(m_idx)

        for protein in protein_limits:
            if protein in tags_set:
                protein_indices_map[protein].append(m_idx)

    exact_allowed_by_slot: List[List[int]] = []
    fallback_allowed_by_slot: List[List[int]] = []

    for slot in slots:
        exact_matches: List[int] = []
        fallback_matches: List[int] = []

        for m_idx, meal in enumerate(meals):
            if blocked_allergens and normalized_allergens_by_index[m_idx].intersection(blocked_allergens):
                continue

            meal_times = normalized_meal_times_by_index[m_idx]

            if not meal.mealTime or slot.lower() in meal_times:
                exact_matches.append(m_idx)
                continue

            category = (meal.category or "").lower()
            food_type = (meal.foodType or "").lower()
            tags = normalized_tags_by_index[m_idx]

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
                    fallback_matches.append(m_idx)
                    continue

            if slot == "snack":
                if meal.mealQuality == "light":
                    fallback_matches.append(m_idx)
                    continue

            if slot in ["lunch", "dinner"]:
                if meal.mealQuality == "main":
                    fallback_matches.append(m_idx)
                    continue

        exact_allowed_by_slot.append(exact_matches)
        fallback_allowed_by_slot.append(fallback_matches)

    solutions = []
    excluded_solution_keys: List[List[str]] = []

    
    for solution_index in range(req.count):
        print(f"\n[solver] --- generating option {solution_index + 1} ---")
        model = cp_model.CpModel()

        x = {}
        for s_idx, _slot in enumerate(slots):
            for m_idx, _meal in enumerate(meals):
                x[(s_idx, m_idx)] = model.NewBoolVar(f"x_{s_idx}_{m_idx}")

        for s_idx, slot in enumerate(slots):
            exact_matches = exact_allowed_by_slot[s_idx]
            fallback_matches = fallback_allowed_by_slot[s_idx]

            allowed_indices = exact_matches if exact_matches else fallback_matches
            blocked_indices = fallback_matches if exact_matches else []

            if not allowed_indices:
                return {
                    "ok": False,
                    "message": f"No feasible meals available for slot '{slot}'.",
                }

            model.Add(sum(x[(s_idx, m_idx)] for m_idx in allowed_indices) == 1)

            allowed_set = set(allowed_indices)
            blocked_set = set(blocked_indices)

            for m_idx in range(len(meals)):
                if m_idx in blocked_set:
                    model.Add(x[(s_idx, m_idx)] == 0)
                elif m_idx not in allowed_set:
                    model.Add(x[(s_idx, m_idx)] == 0)

        model.Add(
            sum(
                x[(s_idx, m_idx)] * meals[m_idx].price
                for s_idx in range(len(slots))
                for m_idx in range(len(meals))
            )
            <= req.budget
        )

        for m_idx in range(len(meals)):
            model.Add(sum(x[(s_idx, m_idx)] for s_idx in range(len(slots))) <= 1)

        if req.categoryLimit > 0:
            for _category, indices in categories_map.items():
                if indices:
                    model.Add(
                        sum(
                            x[(s_idx, m_idx)]
                            for s_idx in range(len(slots))
                            for m_idx in indices
                        )
                        <= req.categoryLimit
                    )

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

        for family, family_limit in family_limits.items():
            family_indices = family_indices_map[family]
            if family_indices:
                model.Add(
                    sum(
                        x[(s_idx, m_idx)]
                        for s_idx in range(len(slots))
                        for m_idx in family_indices
                    )
                    <= family_limit
                )

        for protein, protein_limit in protein_limits.items():
            protein_indices = protein_indices_map[protein]
            if protein_indices:
                model.Add(
                    sum(
                        x[(s_idx, m_idx)]
                        for s_idx in range(len(slots))
                        for m_idx in protein_indices
                    )
                    <= protein_limit
                )

        establishment_limit = 2 if req.mealsPerDay >= 3 else req.mealsPerDay

        for _establishment, establishment_indices in establishments_map.items():
            if establishment_indices:
                model.Add(
                    sum(
                        x[(s_idx, m_idx)]
                        for s_idx in range(len(slots))
                        for m_idx in establishment_indices
                    )
                    <= establishment_limit
                )

        # Strict diversity for daily suggestions:
        # do not allow any meal from an earlier option to appear again.
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
                    == 0
                )

        previous_solution_establishments: List[set[str]] = []
        for existing_solution in solutions:
            ests = set()
            for meal in existing_solution["meals"]:
                est = str(meal.get("establishmentName", "")).strip().lower()
                if est:
                    ests.add(est)
            if ests:
                previous_solution_establishments.append(ests)

        for prev_ests in previous_solution_establishments:
            prev_est_indices = []
            for est in prev_ests:
                prev_est_indices.extend(establishments_map.get(est, []))

            prev_est_indices = list(set(prev_est_indices))

            if prev_est_indices:
                model.Add(
                    sum(
                        x[(s_idx, m_idx)]
                        for s_idx in range(len(slots))
                        for m_idx in prev_est_indices
                    )
                    <= 1
                )

        current_used_meal_ids_set = set(base_used_meal_ids_set)
        current_used_establishments_set = set(base_used_establishments_set)

        for existing_solution in solutions:
            for meal in existing_solution["meals"]:
                meal_id = str(meal.get("_id", "")).lower()
                est = str(meal.get("establishmentName", "")).lower()

                if meal_id:
                    current_used_meal_ids_set.add(meal_id)
                if est:
                    current_used_establishments_set.add(est)

        if current_used_meal_ids_set:
            print("[solver] banning previously used meals:", sorted(current_used_meal_ids_set))

        if current_used_establishments_set:
            print(
                "[solver] penalizing previously used establishments:",
                sorted(current_used_establishments_set),
            )

        # Hard-ban meals already used by earlier returned options.
        for m_idx, meal in enumerate(meals):
            if meal.id.lower() in current_used_meal_ids_set:
                for s_idx in range(len(slots)):
                    model.Add(x[(s_idx, m_idx)] == 0)

        meal_scores_by_index: List[int] = []
        for m_idx, meal in enumerate(meals):
            meal_score = compute_preference_score_precomputed(
                meal=meal,
                meal_tags=normalized_tags_by_index[m_idx],
                preference_mode=req.preferenceMode,
                preferred=preferred_set,
                disliked=disliked_set,
                used_meal_ids_set=current_used_meal_ids_set,
                used_establishments_set=current_used_establishments_set,
                solution_index=solution_index,
            )
            meal_scores_by_index.append(meal_score)

        model.Maximize(
            sum(
                x[(s_idx, m_idx)] * meal_scores_by_index[m_idx]
                for s_idx in range(len(slots))
                for m_idx in range(len(meals))
            )
        )

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 1.2

        status = solver.Solve(model)

        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            break

        picked_meals = []
        picked_meal_ids = []

        print(
            "[solver] picked meals:",
            [
                f"{meal['mealName']} ({meal['establishmentName']}) ₱{meal['price']}"
                for meal in picked_meals
            ],
        )

        for s_idx in range(len(slots)):
            for m_idx, meal in enumerate(meals):
                if solver.Value(x[(s_idx, m_idx)]) == 1:
                    picked_meals.append(meal.model_dump(by_alias=True))
                    picked_meal_ids.append(meal.id)

        print(
            "[solver] picked meals:",
            [
                f"{meal['mealName']} ({meal['establishmentName']}) ₱{meal['price']}"
                for meal in picked_meals
            ],
        )

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


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/solve")
def solve_meal_plans(req: SolveMealPlansRequest):
    return solve_daily_options(req)


@app.post("/solve-weekly")
def solve_weekly_meal_plans(req: SolveMealPlansRequest):
    weekly_options = []

    for option_index in range(req.count):
        days = []
        used_meal_ids = []
        used_establishments = []

        weekly_total_cost = 0
        weekly_remaining_budget = req.budget
        failed_day = None
        failure_message = ""

        for day_index in range(7):
            day_budget = build_day_budget(int(req.budget), day_index)

            day_req = SolveMealPlansRequest(
                meals=req.meals,
                budget=day_budget,
                mealsPerDay=req.mealsPerDay,
                count=1,
                preferenceMode=req.preferenceMode,
                preferredTags=req.preferredTags,
                dislikedTags=req.dislikedTags,
                excludeAllergens=req.excludeAllergens,
                categoryLimit=req.categoryLimit,
                usedMealIds=used_meal_ids,
                usedEstablishments=used_establishments,
            )

            day_result = solve_daily_options(day_req)

            if (
                not day_result.get("ok")
                or not isinstance(day_result.get("options"), list)
                or not day_result["options"]
            ):
                failed_day = WEEK_DAYS[day_index]
                failure_message = day_result.get(
                    "message",
                    f"No meal plan fits ₱{day_budget} for {failed_day}.",
                )
                break

            picked = day_result["options"][0]
            meals_for_day_raw = picked.get("meals", [])

            if len(meals_for_day_raw) != req.mealsPerDay:
                failed_day = WEEK_DAYS[day_index]
                failure_message = (
                    f"Invalid result for {failedDay}: expected "
                    f"{req.mealsPerDay} meals, got {len(meals_for_day_raw)}."
                )
                break

            meals_for_day = meals_for_day_raw[: req.mealsPerDay]

            total_cost = sum(int(meal.get("price", 0)) for meal in meals_for_day)
            remaining_budget = max(0, day_budget - total_cost)

            days.append(
                {
                    "day": day_index + 1,
                    "label": WEEK_DAYS[day_index],
                    "budget": day_budget,
                    "meals": meals_for_day,
                    "totalCost": total_cost,
                    "remainingBudget": remaining_budget,
                }
            )

            weekly_total_cost += total_cost
            weekly_remaining_budget -= total_cost

            for meal in meals_for_day:
                if meal.get("_id"):
                    used_meal_ids = (used_meal_ids + [str(meal["_id"])])[-10:]
                if meal.get("establishmentName"):
                    used_establishments = (used_establishments + [str(meal["establishmentName"])])[-10:]

        if failed_day:
            if option_index == 0:
                return {
                    "ok": False,
                    "message": (
                        f"{failure_message} Weekly plans work best when the "
                        f"per-day budget is realistic. Try increasing the weekly "
                        f"budget or lowering meals per day."
                    ),
                }
            break

        total_weekly_meals = sum(len(day["meals"]) for day in days)

        if len(days) != 7 or total_weekly_meals != 7 * req.mealsPerDay:
            if option_index == 0:
                return {
                    "ok": False,
                    "message": (
                        f"Weekly plan validation failed. Expected "
                        f"{7 * req.mealsPerDay} meals across 7 days, "
                        f"got {total_weekly_meals}."
                    ),
                }
            break

        weekly_options.append(
            {
                "allowanceType": "weekly",
                "label": build_weekly_label(option_index, req.preferenceMode),
                "days": days,
                "totalCost": weekly_total_cost,
                "remainingBudget": max(0, weekly_remaining_budget),
            }
        )

    if not weekly_options:
        estimated_per_day = req.budget // 7
        return {
            "ok": False,
            "message": (
                f"No weekly meal plan fits ₱{req.budget} right now. "
                f"Your estimated daily budget is about ₱{estimated_per_day}. "
                f"Try increasing your budget or reducing meals per day."
            ),
        }

    return {
        "ok": True,
        "allowanceType": "weekly",
        "options": weekly_options,
    }