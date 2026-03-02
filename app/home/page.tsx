"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Meal {
  mealName: string;
  price: number;
  establishment: string;
}

export default function HomePage() {
  const [budget, setBudget] = useState("");
  const [mealPlan, setMealPlan] = useState<Meal[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!budget) return;
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/mealplans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: parseFloat(budget),
          userId,
          allowanceType: "daily", // optional: user can select
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to generate meal plan");
        setLoading(false);
        return;
      }

      setMealPlan(data.meals || []);
      setTotalCost(data.totalCost || 0);
      setRemaining(data.remainingBudget || 0);
    } catch (err) {
      console.error(err);
      alert("Error generating meal plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Generate Your Meal Plan
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Enter your budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleGenerate}>
            {loading ? "Generating..." : "Generate Meal Plan"}
          </Button>
        </div>

        {mealPlan.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Meal Plan</h2>
            <ul>
              {mealPlan.map((meal, idx) => (
                <li
                  key={idx}
                  className="flex justify-between border p-2 rounded mb-1"
                >
                  <span>{meal.mealName} ({meal.establishment})</span>
                  <span>₱{meal.price}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-between font-semibold">
              <p>Total Cost: ₱{totalCost}</p>
              <p>Remaining: ₱{remaining}</p>
            </div>
          </div>
        )}

        {mealPlan.length === 0 && !loading && (
          <p className="text-gray-600 text-center mt-4">
            Your meal plan will appear here after generating.
          </p>
        )}
      </div>
    </div>
  );
}