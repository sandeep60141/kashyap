"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { generateRecipe } from "@/lib/client-recipe-generator"
import { ChefForm } from "@/components/chef-form"
import FormStep from "@/components/form-step"
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

  const mealTypeOptions = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
    "Post-workout",
    "Pre-workout",
    "Brunch",
    "Light meal",
  ]

  const macroPresets = [
    { name: "High Protein", protein: 40, carbs: 30, fat: 30, calories: 600 },
    { name: "Low Carb", protein: 35, carbs: 15, fat: 50, calories: 500 },
    { name: "Balanced", protein: 30, carbs: 40, fat: 30, calories: 500 },
    { name: "Endurance", protein: 20, carbs: 60, fat: 20, calories: 700 },
  ]

  // Add a function to ensure macros always add up to 100%
  const adjustMacros = (protein: number, carbs: number, fat: number) => {
    const total = protein + carbs + fat
    if (total !== 100) {
      // Adjust values proportionally to sum to 100
      const factor = 100 / total
      return {
        protein: Math.round(protein * factor),
        carbs: Math.round(carbs * factor),
        fat: Math.round(fat * factor),
      }
    }
    return { protein, carbs, fat }
  }

  // Update the handlePresetClick function to ensure macros add up to 100%
  const handlePresetClick = (preset: (typeof macroPresets)[0]) => {
    const { protein: newProtein, carbs: newCarbs, fat: newFat } = adjustMacros(preset.protein, preset.carbs, preset.fat)

    setProtein(newProtein)
    setCarbs(newCarbs)
    setFat(newFat)
    setCalories(preset.calories)
  }

  const handleSubmit = async () => {
    if (!mealType.trim()) {
      setError("Please enter a meal type")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const recipe = await generateRecipe({
        mealType,
        macros: { protein, carbs, fat, calories },
        preferences,
        dietaryRequirements,
        model: selectedModel,
      })

      localStorage.setItem("generatedRecipe", JSON.stringify(recipe))
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
      <FreeTierBanner />

      {error && <div className="generator-error mb-6">{error}</div>}

      <ChefForm
        title="MacrosChef - Nutrition-Focused Recipes"
        buttonText="Generate Recipe"
        onSubmit={handleSubmit}
        isLoading={isGenerating}
      >
        <FormStep number={1} title="Meal Information" subtitle="Tell us about the meal you want to create">
          <div className="space-y-6">
            <div>
              <label htmlFor="mealType" className="block text-sm font-medium text-primary mb-2">
                What type of meal would you like? *
              </label>
              <Input
                id="mealType"
                placeholder="E.g., breakfast, lunch, dinner, snack, post-workout, etc."
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="generator-input"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Quick Meal Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {mealTypeOptions.map((option) => (
                  <Button
                    key={option}
                    variant={mealType === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMealType(option)}
                    className={`text-xs ${
                      mealType === option
                        ? "bg-primary text-white"
                        : "border-primary/30 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-primary mb-2">
                Any preferences or additional instructions? (optional)
              </label>
              <Textarea
                id="preferences"
                placeholder="E.g., high protein, low carb, quick to prepare, muscle building, weight loss, etc."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="generator-textarea"
                rows={3}
              />
            </div>
          </div>
        </FormStep>

        <FormStep number={2} title="Macronutrient Targets" subtitle="Set your specific macro and calorie goals">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Macro Presets</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {macroPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset)}
                    className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-4">Total Calories: {calories}</label>
              <Slider
                value={[calories]}
                min={200}
                max={1000}
                step={50}
                onValueChange={(value) => setCalories(value[0])}
                className="[&>span]:bg-primary"
              />
              <div className="flex justify-between text-xs text-foreground/60 mt-2">
                <span>200 cal</span>
                <span>1,000 cal</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-primary">Protein: {protein}%</span>
                  <span className="text-sm text-primary">{Math.round((protein / 100) * calories)} calories</span>
                </div>
                <Slider
                  value={[protein]}
                  min={10}
                  max={60}
                  step={5}
                  onValueChange={(value) => {
                    const newProtein = value[0]
                    setProtein(newProtein)
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
                  <span className="text-sm font-medium text-primary">Carbs: {carbs}%</span>
                  <span className="text-sm text-primary">{Math.round((carbs / 100) * calories)} calories</span>
                </div>
                <Slider
                  value={[carbs]}
                  min={10}
                  max={60}
                  step={5}
                  onValueChange={(value) => {
                    const newCarbs = value[0]
                    setCarbs(newCarbs)
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
                  <span className="text-sm font-medium text-primary">Fat: {fat}%</span>
                  <span className="text-sm text-primary">{Math.round((fat / 100) * calories)} calories</span>
                </div>
                <Slider
                  value={[fat]}
                  min={10}
                  max={60}
                  step={5}
                  onValueChange={(value) => {
                    const newFat = value[0]
                    setFat(newFat)
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
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="text-sm font-medium text-primary mb-3">Macro Distribution</h4>
            <div className="h-6 w-full rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 h-full flex items-center justify-center text-xs text-white"
                style={{ width: `${protein}%` }}
              >
                {protein}%
              </div>
              <div
                className="bg-green-500 h-full flex items-center justify-center text-xs text-white"
                style={{ width: `${carbs}%` }}
              >
                {carbs}%
              </div>
              <div
                className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white"
                style={{ width: `${fat}%` }}
              >
                {fat}%
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>Protein</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Carbs</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span>Fat</span>
              </div>
            </div>
          </div>
        </FormStep>

        <FormStep number={3} title="Final Settings" subtitle="Set dietary requirements and AI model">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-3">Dietary Requirements (optional)</label>
              <DietaryRequirements selectedRequirements={dietaryRequirements} onChange={setDietaryRequirements} />
            </div>

            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Nutrition Summary</h4>
              <div className="text-sm text-foreground/80 space-y-1">
                <p>
                  <strong>Meal Type:</strong> {mealType || "Not specified"}
                </p>
                <p>
                  <strong>Total Calories:</strong> {calories}
                </p>
                <p>
                  <strong>Protein:</strong> {protein}% ({Math.round((protein / 100) * calories)} cal)
                </p>
                <p>
                  <strong>Carbs:</strong> {carbs}% ({Math.round((carbs / 100) * calories)} cal)
                </p>
                <p>
                  <strong>Fat:</strong> {fat}% ({Math.round((fat / 100) * calories)} cal)
                </p>
              </div>
            </div>
          </div>
        </FormStep>
      </ChefForm>
    </div>
  )
}
