"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Wine } from "lucide-react"
import { generateRecipe } from "@/lib/client-recipe-generator"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Store the recipe in localStorage
      localStorage.setItem("generatedRecipe", JSON.stringify(recipe))

      // Redirect to the recipe result page
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
      <div className="generator-header">
        <h1 className="generator-title">
          <Wine className="inline-block mr-2 h-8 w-8" />
          MixologyMaestro
        </h1>
        <p className="generator-description">
          Create delicious cocktails and mocktails with the ingredients you have on hand.
        </p>
      </div>

      <FreeTierBanner />

      <form onSubmit={handleSubmit} className="generator-form">
        <div className="generator-section">
          <label htmlFor="ingredients" className="generator-section-title">
            What ingredients do you have?
          </label>
          <Textarea
            id="ingredients"
            placeholder="Enter ingredients separated by commas (e.g., vodka, lime juice, mint, sugar)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="generator-textarea"
          />
        </div>

        <div className="generator-section">
          <label htmlFor="preferences" className="generator-section-title">
            Any preferences or additional instructions? (optional)
          </label>
          <Textarea
            id="preferences"
            placeholder="E.g., sweet, sour, refreshing, strong, etc."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="generator-textarea"
          />
        </div>

        <div className="generator-section">
          <label className="generator-section-title">Drink Type</label>
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
                Alcoholic
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
                Non-Alcoholic
              </label>
            </div>
          </div>
        </div>

        <div className="generator-section">
          <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
        </div>

        {error && <div className="generator-error">{error}</div>}

        <Button type="submit" disabled={isGenerating || !ingredients.trim()} className="generator-button">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mixing Drink...
            </>
          ) : (
            <>
              <Wine className="mr-2 h-4 w-4" />
              Create Drink
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
