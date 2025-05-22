"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { generateRecipe } from "@/lib/client-recipe-generator"
import { ChefForm } from "@/components/chef-form"
import FormStep from "@/components/form-step"
import DietaryRequirements from "@/components/dietary-requirements"
import FreeTierBanner from "@/components/free-tier-banner"
import ModelSelector from "@/components/model-selector"

export default function PantryChef() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState("")
  const [preferences, setPreferences] = useState("")
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")

  const handleSubmit = async () => {
    if (!ingredients.trim()) {
      setError("Please enter some ingredients")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const recipe = await generateRecipe({
        ingredients,
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
      <FreeTierBanner />

      {error && <div className="generator-error mb-6">{error}</div>}

      <ChefForm
        title="PantryChef - Cook with What You Have"
        buttonText="Generate Recipe"
        onSubmit={handleSubmit}
        isLoading={isGenerating}
      >
        <FormStep number={1} title="Available Ingredients" subtitle="Tell us what ingredients you have in your pantry">
          <div className="space-y-4">
            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-primary mb-2">
                What ingredients do you have? *
              </label>
              <Textarea
                id="ingredients"
                placeholder="Enter ingredients separated by commas (e.g., chicken, rice, onions, garlic, tomatoes)"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="generator-textarea"
                rows={4}
              />
              <p className="text-xs text-foreground/60 mt-2">
                💡 Tip: Include spices, herbs, and pantry staples you have available
              </p>
            </div>
          </div>
        </FormStep>

        <FormStep
          number={2}
          title="Cooking Preferences"
          subtitle="Let us know your preferences and any special requirements"
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-primary mb-2">
                Any preferences or additional instructions? (optional)
              </label>
              <Textarea
                id="preferences"
                placeholder="E.g., quick meal (under 30 min), spicy, kid-friendly, comfort food, healthy, etc."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="generator-textarea"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-3">Dietary Requirements (optional)</label>
              <DietaryRequirements selectedRequirements={dietaryRequirements} onChange={setDietaryRequirements} />
            </div>
          </div>
        </FormStep>

        <FormStep number={3} title="AI Model Selection" subtitle="Choose the AI model that best fits your needs">
          <div className="space-y-4">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Ready to Generate!</h4>
              <p className="text-sm text-foreground/80">
                We'll create a delicious recipe using your available ingredients and preferences. Click "Generate
                Recipe" to get started!
              </p>
            </div>
          </div>
        </FormStep>
      </ChefForm>
    </div>
  )
}
