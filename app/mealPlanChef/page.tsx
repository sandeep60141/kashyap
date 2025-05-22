"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Loader2, Calendar } from "lucide-react"
import { generateRecipe } from "@/lib/client-recipe-generator"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsGenerating(true)
    setError(null)

    try {
      const recipe = await generateRecipe({
        days,
        calories,
        preferences,
        dietaryRequirements,
        type: "mealPlan",
        model: selectedModel,
      })

      // Store the recipe in localStorage
      localStorage.setItem("generatedRecipe", JSON.stringify(recipe))

      // Redirect to the recipe result page
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
      <div className="generator-header">
        <h1 className="generator-title">
          <Calendar className="inline-block mr-2 h-8 w-8" />
          MealPlanChef
        </h1>
        <p className="generator-description">
          Generate a complete meal plan for multiple days based on your preferences and dietary requirements.
        </p>
      </div>

      <FreeTierBanner />

      <form onSubmit={handleSubmit} className="generator-form">
        <div className="generator-section">
          <label className="generator-section-title">Number of Days: {days}</label>
          <Slider
            value={[days]}
            min={1}
            max={7}
            step={1}
            onValueChange={(value) => setDays(value[0])}
            className="[&>span]:bg-primary"
          />
        </div>

        <div className="generator-section">
          <label className="generator-section-title">Daily Calories: {calories}</label>
          <Slider
            value={[calories]}
            min={1200}
            max={3000}
            step={100}
            onValueChange={(value) => setCalories(value[0])}
            className="[&>span]:bg-primary"
          />
        </div>

        <div className="generator-section">
          <label htmlFor="preferences" className="generator-section-title">
            Any preferences or additional instructions? (optional)
          </label>
          <Textarea
            id="preferences"
            placeholder="E.g., quick breakfast options, meal prep friendly, family-friendly dinners, etc."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="generator-textarea"
          />
        </div>

        <div className="generator-section">
          <label className="generator-section-title">Dietary Requirements (optional)</label>
          <DietaryRequirements selectedRequirements={dietaryRequirements} onChange={setDietaryRequirements} />
        </div>

        <div className="generator-section">
          <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
        </div>

        {error && <div className="generator-error">{error}</div>}

        <Button type="submit" disabled={isGenerating} className="generator-button">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Meal Plan...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Generate Meal Plan
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
