"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { generateRecipe } from "@/lib/client-recipe-generator"
import { ChefForm } from "@/components/chef-form"
import FormStep from "@/components/form-step"
import FreeTierBanner from "@/components/free-tier-banner"
import ModelSelector from "@/components/model-selector"

export default function MixologyMaestro() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState("")
  const [preferences, setPreferences] = useState("")
  const [alcoholic, setAlcoholic] = useState(true)
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
        alcoholic,
        type: "cocktail",
        model: selectedModel,
      })

      localStorage.setItem("generatedRecipe", JSON.stringify(recipe))
      router.push("/recipe-result")
    } catch (err) {
      console.error("Error generating cocktail recipe:", err)
      setError(`Failed to generate cocktail recipe: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="generator-container">
      <FreeTierBanner />

      {error && <div className="generator-error mb-6">{error}</div>}

      <ChefForm
        title="MixologyMaestro - Craft Perfect Drinks"
        buttonText="Create Drink"
        onSubmit={handleSubmit}
        isLoading={isGenerating}
      >
        <FormStep number={1} title="Available Ingredients" subtitle="What ingredients do you have for your drink?">
          <div className="space-y-4">
            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-primary mb-2">
                What ingredients do you have? *
              </label>
              <Textarea
                id="ingredients"
                placeholder="Enter ingredients separated by commas (e.g., vodka, lime juice, mint, sugar, cranberry juice)"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="generator-textarea"
                rows={4}
              />
              <p className="text-xs text-foreground/60 mt-2">
                💡 Include spirits, mixers, fruits, herbs, and any garnishes you have
              </p>
            </div>
          </div>
        </FormStep>

        <FormStep number={2} title="Drink Preferences" subtitle="Tell us about your taste preferences and drink type">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-3">Drink Type</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`generator-option ${alcoholic ? "generator-option-active" : ""}`}
                  onClick={() => setAlcoholic(true)}
                >
                  <input
                    type="radio"
                    name="drinkType"
                    id="alcoholic"
                    checked={alcoholic}
                    onChange={() => setAlcoholic(true)}
                    className="generator-radio"
                  />
                  <label htmlFor="alcoholic" className="cursor-pointer">
                    Alcoholic Cocktail
                  </label>
                </div>
                <div
                  className={`generator-option ${!alcoholic ? "generator-option-active" : ""}`}
                  onClick={() => setAlcoholic(false)}
                >
                  <input
                    type="radio"
                    name="drinkType"
                    id="nonAlcoholic"
                    checked={!alcoholic}
                    onChange={() => setAlcoholic(false)}
                    className="generator-radio"
                  />
                  <label htmlFor="nonAlcoholic" className="cursor-pointer">
                    Non-Alcoholic Mocktail
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-primary mb-2">
                Any preferences or additional instructions? (optional)
              </label>
              <Textarea
                id="preferences"
                placeholder="E.g., sweet, sour, refreshing, strong, fruity, tropical, classic style, etc."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="generator-textarea"
                rows={3}
              />
            </div>
          </div>
        </FormStep>

        <FormStep
          number={3}
          title="Final Settings"
          subtitle="Choose your AI model and review your drink specifications"
        >
          <div className="space-y-6">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Drink Summary</h4>
              <div className="text-sm text-foreground/80 space-y-1">
                <p>
                  <strong>Type:</strong> {alcoholic ? "Alcoholic Cocktail" : "Non-Alcoholic Mocktail"}
                </p>
                <p>
                  <strong>Ingredients:</strong> {ingredients || "Not specified"}
                </p>
                <p>
                  <strong>Style:</strong> {preferences || "Any"}
                </p>
              </div>
            </div>
          </div>
        </FormStep>
      </ChefForm>
    </div>
  )
}
