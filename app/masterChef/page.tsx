"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, ChefHat, Utensils } from "lucide-react"
import { generateRecipe } from "@/lib/client-recipe-generator"
import DietaryRequirements from "@/components/dietary-requirements"
import FreeTierBanner from "@/components/free-tier-banner"
import ModelSelector from "@/components/model-selector"

export default function MasterChef() {
  const router = useRouter()
  const [recipeName, setRecipeName] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipeName.trim()) {
      setError("Please enter a recipe name or description")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const recipe = await generateRecipe({
        recipeName,
        cuisine,
        difficulty,
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
          <ChefHat className="inline-block mr-2 h-8 w-8" />
          MasterChef
        </h1>
        <p className="generator-description">
          Describe the recipe you want to create, and we'll generate a professional-quality recipe for you.
        </p>
      </div>

      <FreeTierBanner />

      <form onSubmit={handleSubmit} className="generator-form">
        <div className="generator-section">
          <label htmlFor="recipeName" className="generator-section-title">
            What recipe would you like to create?
          </label>
          <Textarea
            id="recipeName"
            placeholder="Describe the recipe you want (e.g., Creamy Garlic Parmesan Pasta with Grilled Chicken)"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="generator-textarea"
          />
        </div>

        <div className="generator-section">
          <label htmlFor="cuisine" className="generator-section-title">
            Cuisine Type (optional)
          </label>
          <Input
            id="cuisine"
            placeholder="E.g., Italian, Mexican, Japanese, etc."
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="generator-input"
          />
        </div>

        <div className="generator-section">
          <label className="generator-section-title">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-4">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <div
                key={level}
                className={`generator-option ${difficulty === level ? "generator-option-active" : ""}`}
                onClick={() => setDifficulty(level)}
              >
                <input
                  type="radio"
                  name="difficulty"
                  id={level}
                  checked={difficulty === level}
                  onChange={() => setDifficulty(level)}
                  className="generator-radio"
                />
                <label htmlFor={level} className="capitalize cursor-pointer">
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="generator-section">
          <label className="generator-section-title">Dietary Requirements (optional)</label>
          <DietaryRequirements selectedRequirements={dietaryRequirements} onChange={setDietaryRequirements} />
        </div>

        <div className="generator-section">
          <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
        </div>

        {error && <div className="generator-error">{error}</div>}

        <Button type="submit" disabled={isGenerating || !recipeName.trim()} className="generator-button">
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
