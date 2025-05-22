"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Loader2, Utensils, Activity } from "lucide-react"
import { generateRecipe } from "@/lib/client-recipe-generator"
import DietaryRequirements from "@/components/dietary-requirements"
import FreeTierBanner from "@/components/free-tier-banner"
import ModelSelector from "@/components/model-selector"

export default function MacrosChef() {
  const router = useRouter()
  const [mealType, setMealType] = useState("")
  const [protein, setProtein] = useState(30)
  const [carbs, setCarbs] = useState(40)
  const [fat, setFat] = useState(30)
  const [calories, setCalories] = useState(500)
  const [preferences, setPreferences] = useState("")
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mealType.trim()) {
      setError("Please enter a meal type")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const recipe = await generateRecipe({
        mealType,
        macros: {
          protein,
          carbs,
          fat,
          calories,
        },
        preferences,
        dietaryRequirements,
        model: selectedModel,
      })

      // Store the recipe in localStorage
      localStorage.setItem("generatedRecipe", JSON.stringify(recipe))

      // Redirect to the recipe result page
      router.push("/recipe-result")
    } catch (err) {
      console.error("Error generating recipe:", err)
      setError(`Failed to generate recipe: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="generator-container">
      <div className="generator-header">
        <h1 className="generator-title">
          <Activity className="inline-block mr-2 h-8 w-8" />
          MacrosChef
        </h1>
        <p className="generator-description">
          Generate recipes that match your specific macronutrient and calorie requirements.
        </p>
      </div>

      <FreeTierBanner />

      <form onSubmit={handleSubmit} className="generator-form">
        <div className="generator-section">
          <label htmlFor="mealType" className="generator-section-title">
            What type of meal would you like?
          </label>
          <Input
            id="mealType"
            placeholder="E.g., breakfast, lunch, dinner, snack, post-workout, etc."
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="generator-input"
          />
        </div>

        <div className="generator-section">
          <label className="generator-section-title">Macronutrient Distribution</label>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span>Protein: {protein}%</span>
                <span className="text-primary">{Math.round((protein / 100) * calories)} calories</span>
              </div>
              <Slider
                value={[protein]}
                min={10}
                max={60}
                step={5}
                onValueChange={(value) => {
                  const newProtein = value[0]
                  setProtein(newProtein)
                  // Adjust carbs and fat proportionally
                  const remaining = 100 - newProtein
                  const ratio = carbs / (carbs + fat)
                  const newCarbs = Math.round(remaining * ratio)
                  setCarbs(newCarbs)
                  setFat(100 - newProtein - newCarbs)
                }}
                className="[&>span]:bg-primary"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Carbs: {carbs}%</span>
                <span className="text-primary">{Math.round((carbs / 100) * calories)} calories</span>
              </div>
              <Slider
                value={[carbs]}
                min={10}
                max={60}
                step={5}
                onValueChange={(value) => {
                  const newCarbs = value[0]
                  setCarbs(newCarbs)
                  // Adjust protein and fat proportionally
                  const remaining = 100 - newCarbs
                  const ratio = protein / (protein + fat)
                  const newProtein = Math.round(remaining * ratio)
                  setProtein(newProtein)
                  setFat(100 - newCarbs - newProtein)
                }}
                className="[&>span]:bg-primary"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Fat: {fat}%</span>
                <span className="text-primary">{Math.round((fat / 100) * calories)} calories</span>
              </div>
              <Slider
                value={[fat]}
                min={10}
                max={60}
                step={5}
                onValueChange={(value) => {
                  const newFat = value[0]
                  setFat(newFat)
                  // Adjust protein and carbs proportionally
                  const remaining = 100 - newFat
                  const ratio = protein / (protein + carbs)
                  const newProtein = Math.round(remaining * ratio)
                  setProtein(newProtein)
                  setCarbs(100 - newFat - newProtein)
                }}
                className="[&>span]:bg-primary"
              />
            </div>
          </div>
        </div>

        <div className="generator-section">
          <label className="generator-section-title">Total Calories: {calories}</label>
          <Slider
            value={[calories]}
            min={200}
            max={1000}
            step={50}
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
            placeholder="E.g., high protein, low carb, quick to prepare, etc."
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

        <Button type="submit" disabled={isGenerating || !mealType.trim()} className="generator-button">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Recipe...
            </>
          ) : (
            <>
              <Utensils className="mr-2 h-4 w-4" />
              Generate Recipe
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
