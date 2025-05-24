"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { generateRecipe } from "@/lib/client-recipe-generator"
import { ChefForm } from "@/components/chef-form"
import FormStep from "@/components/form-step"
import DietaryRequirements from "@/components/dietary-requirements"
import FreeTierBanner from "@/components/free-tier-banner"
import ModelSelector from "@/components/model-selector"

export default function MealPlanChef() {
  const router = useRouter()
  const [days, setDays] = useState(3)
  const [calories, setCalories] = useState(2000)
  const [preferences, setPreferences] = useState("")
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-4")

  const handleSubmit = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const mealPlanPrompt = `Create a comprehensive ${days}-day meal plan with these exact specifications:

MEAL PLAN REQUIREMENTS:
- Duration: Exactly ${days} days (Day 1 through Day ${days})
- Daily calories: ${calories} calories per day
- Each day must include: Breakfast, Lunch, Dinner
- User preferences: ${preferences || "balanced, healthy meals"}
${dietaryRequirements.length > 0 ? `- MUST follow dietary requirements: ${dietaryRequirements.join(", ")}` : ""}

CRITICAL INSTRUCTIONS:
- This is a MEAL PLAN request, not a single recipe
- Must include ${days} complete days
- Each meal should have ingredients and instructions
- Include daily nutrition totals
- Format as a structured meal plan

Do not create a single recipe. Create a ${days}-day meal plan.`

      const recipe = await generateRecipe({
        type: "mealPlan",
        days: days,
        calories: calories,
        preferences: mealPlanPrompt,
        dietaryRequirements: dietaryRequirements,
        model: selectedModel,
      })

      localStorage.setItem("generatedRecipe", JSON.stringify(recipe))
      router.push("/recipe-result")
    } catch (err) {
      console.error("Error generating meal plan:", err)
      setError(`Failed to generate meal plan: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="generator-container">
      <FreeTierBanner />

      {error && <div className="generator-error mb-6">{error}</div>}

      <ChefForm
        title="MealPlanChef - Complete Meal Planning"
        buttonText="Generate Meal Plan"
        onSubmit={handleSubmit}
        isLoading={isGenerating}
      >
        <FormStep number={1} title="Meal Plan Duration" subtitle="How many days would you like to plan for?">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-4">Number of Days: {days}</label>
              <Slider
                value={[days]}
                min={1}
                max={7}
                step={1}
                onValueChange={(value) => setDays(value[0])}
                className="[&>span]:bg-primary"
              />
              <div className="flex justify-between text-xs text-foreground/60 mt-2">
                <span>1 day</span>
                <span>7 days</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-4">Daily Calories: {calories}</label>
              <Slider
                value={[calories]}
                min={1200}
                max={3000}
                step={100}
                onValueChange={(value) => setCalories(value[0])}
                className="[&>span]:bg-primary"
              />
              <div className="flex justify-between text-xs text-foreground/60 mt-2">
                <span>1,200 cal</span>
                <span>3,000 cal</span>
              </div>
            </div>
          </div>
        </FormStep>

        <FormStep number={2} title="Meal Preferences" subtitle="Tell us about your preferences and dietary needs">
          <div className="space-y-6">
            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-primary mb-2">
                Any preferences or additional instructions? (optional)
              </label>
              <Textarea
                id="preferences"
                placeholder="E.g., quick breakfast options, meal prep friendly, family-friendly dinners, vegetarian lunches, etc."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="generator-textarea"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-3">Dietary Requirements (optional)</label>
              <DietaryRequirements selectedRequirements={dietaryRequirements} onChange={setDietaryRequirements} />
            </div>
          </div>
        </FormStep>

        <FormStep number={3} title="Final Settings" subtitle="Choose your AI model and review your meal plan settings">
          <div className="space-y-6">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Meal Plan Summary</h4>
              <div className="text-sm text-foreground/80 space-y-1">
                <p>
                  <strong>Duration:</strong> {days} {days === 1 ? "day" : "days"}
                </p>
                <p>
                  <strong>Daily Calories:</strong> {calories}
                </p>
                <p>
                  <strong>Total Meals:</strong> {days * 3} (breakfast, lunch, dinner each day)
                </p>
                <p>
                  <strong>Dietary Requirements:</strong>{" "}
                  {dietaryRequirements.length > 0 ? dietaryRequirements.join(", ") : "None"}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Meal plans may take longer to generate due to their complexity. Please be patient
                while we create your personalized plan.
              </p>
            </div>
          </div>
        </FormStep>
      </ChefForm>
    </div>
  )
}
