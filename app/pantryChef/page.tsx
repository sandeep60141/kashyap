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
import PopularIngredients from "@/components/popular-ingredients"
import LanguageSelector from "@/components/language-selector"

export default function PantryChef() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState("")
  const [preferences, setPreferences] = useState("")
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const handleIngredientClick = (ingredient: string) => {
    const currentIngredients = ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean)
    if (!currentIngredients.some((existing) => existing.toLowerCase() === ingredient.toLowerCase())) {
      const newIngredients = currentIngredients.length > 0 ? `${ingredients}, ${ingredient}` : ingredient
      setIngredients(newIngredients)
    }
  }

  const handlePreferenceClick = (preference: string) => {
    setPreferences(preference)
  }

  const handleSubmit = async () => {
    if (!ingredients.trim()) {
      setError("Please enter some ingredients")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Add language instruction to the prompt
      const languageInstruction =
        selectedLanguage !== "en"
          ? `\n\nIMPORTANT: Generate this recipe in ${getLanguageName(selectedLanguage)} language. Include ingredient names, cooking instructions, and all text in ${getLanguageName(selectedLanguage)}.`
          : ""

      const recipe = await generateRecipe({
        ingredients: ingredients + languageInstruction,
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

  const getLanguageName = (code: string) => {
    const languages = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      hi: "Hindi",
      ar: "Arabic",
      tr: "Turkish",
      nl: "Dutch",
      sv: "Swedish",
      da: "Danish",
      no: "Norwegian",
      fi: "Finnish",
      pl: "Polish",
      cs: "Czech",
    }
    return languages[code] || "English"
  }

  const preferenceOptions = [
    "Quick meal (under 30 min)",
    "Comfort food",
    "Healthy and light",
    "Spicy and bold",
    "Kid-friendly",
    "One-pot meal",
    "High protein",
    "Low carb",
  ]

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
          <div className="space-y-6">
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

            <PopularIngredients
              onIngredientClick={handleIngredientClick}
              selectedIngredients={ingredients.split(",")}
              type="pantry"
            />

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="text-sm font-medium text-primary mb-2">Quick Fill Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={() => setIngredients("Chicken breast, rice, broccoli, garlic, soy sauce, ginger")}
                  className="text-xs text-left p-2 rounded border border-primary/30 hover:bg-primary/10 text-primary"
                >
                  Asian-style ingredients
                </button>
                <button
                  onClick={() => setIngredients("Ground beef, pasta, tomatoes, onions, garlic, basil, cheese")}
                  className="text-xs text-left p-2 rounded border border-primary/30 hover:bg-primary/10 text-primary"
                >
                  Italian-style ingredients
                </button>
                <button
                  onClick={() => setIngredients("Salmon, potatoes, asparagus, lemon, olive oil, herbs")}
                  className="text-xs text-left p-2 rounded border border-primary/30 hover:bg-primary/10 text-primary"
                >
                  Healthy dinner ingredients
                </button>
                <button
                  onClick={() => setIngredients("Eggs, bread, cheese, butter, milk, bacon")}
                  className="text-xs text-left p-2 rounded border border-primary/30 hover:bg-primary/10 text-primary"
                >
                  Breakfast ingredients
                </button>
              </div>
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
              <h4 className="text-sm font-medium text-primary mb-3">Quick Preferences</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {preferenceOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handlePreferenceClick(option)}
                    className={`text-xs p-2 rounded border transition-colors ${
                      preferences === option
                        ? "bg-primary text-white border-primary"
                        : "border-primary/30 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-3">Dietary Requirements (optional)</label>
              <DietaryRequirements selectedRequirements={dietaryRequirements} onChange={setDietaryRequirements} />
            </div>
          </div>
        </FormStep>

        <FormStep
          number={3}
          title="AI Model & Language Selection"
          subtitle="Choose the AI model and language for your recipe"
        >
          <div className="space-y-6">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />

            <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} />

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Ready to Generate!</h4>
              <p className="text-sm text-foreground/80 mb-3">
                We'll create a delicious recipe using your available ingredients and preferences in{" "}
                {getLanguageName(selectedLanguage)}.
              </p>
              <div className="text-xs text-foreground/70 space-y-1">
                <p>
                  <strong>Ingredients:</strong> {ingredients || "None selected"}
                </p>
                <p>
                  <strong>Preferences:</strong> {preferences || "None"}
                </p>
                <p>
                  <strong>Dietary Requirements:</strong>{" "}
                  {dietaryRequirements.length > 0 ? dietaryRequirements.join(", ") : "None"}
                </p>
                <p>
                  <strong>Language:</strong> {getLanguageName(selectedLanguage)}
                </p>
              </div>
            </div>
          </div>
        </FormStep>
      </ChefForm>
    </div>
  )
}
