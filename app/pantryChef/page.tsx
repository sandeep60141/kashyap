"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefForm } from "@/components/chef-form"
import { Loader2, ChefHat, Utensils } from "lucide-react"
import { generateRecipe } from "@/lib/client-recipe-generator"
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
          PantryChef
        </h1>
        <p className="generator-description">
          Enter the ingredients you have on hand, and we'll create a delicious recipe for you.
        </p>
      </div>

      <FreeTierBanner />

      <form onSubmit={handleSubmit} className="generator-form">
        <Tabs defaultValue="simple" className="generator-tabs">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple" className="generator-tab">
              Simple
            </TabsTrigger>
            <TabsTrigger value="advanced" className="generator-tab">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="mt-6">
            <div className="generator-section">
              <label htmlFor="ingredients" className="generator-section-title">
                What ingredients do you have?
              </label>
              <Textarea
                id="ingredients"
                placeholder="Enter ingredients separated by commas (e.g., chicken, rice, onions, garlic)"
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
                placeholder="E.g., quick meal, spicy, kid-friendly, etc."
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

            <Button type="submit" disabled={isGenerating || !ingredients.trim()} className="generator-button">
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
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <ChefForm />
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
