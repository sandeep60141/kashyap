"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { generateRecipe } from "@/lib/client-recipe-generator"
import { ChefForm } from "@/components/chef-form"
import { FormStep } from "@/components/form-step"
import { FreeTierBanner } from "@/components/free-tier-banner"
import { ModelSelector } from "@/components/model-selector"
import { PopularIngredients } from "@/components/popular-ingredients"
import LanguageSelector from "@/components/language-selector"

export default function MixologyMaestro() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState("")
  const [preferences, setPreferences] = useState("")
  const [alcoholic, setAlcoholic] = useState(true)
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

  const drinkStyles = [
    "Sweet and fruity",
    "Sour and tart",
    "Strong and bold",
    "Light and refreshing",
    "Tropical",
    "Classic cocktail",
    "Modern twist",
    "Creamy and smooth",
  ]

  const classicCombos = [
    { name: "Classic Mojito", ingredients: "White rum, lime juice, mint, sugar, soda water" },
    { name: "Margarita Base", ingredients: "Tequila, lime juice, triple sec, salt" },
    { name: "Old Fashioned", ingredients: "Whiskey, sugar, bitters, orange peel" },
    { name: "Gin & Tonic", ingredients: "Gin, tonic water, lime, ice" },
  ]

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
          ? `\n\nIMPORTANT: Generate this cocktail recipe in ${getLanguageName(selectedLanguage)} language. Include ingredient names, mixing instructions, and all text in ${getLanguageName(selectedLanguage)}.`
          : ""

      const recipe = await generateRecipe({
        ingredients: ingredients + languageInstruction,
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
          <div className="space-y-6">
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

            <PopularIngredients
              onIngredientClick={handleIngredientClick}
              selectedIngredients={ingredients.split(",")}
              type="cocktail"
            />

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="text-sm font-medium text-primary mb-2">Classic Combinations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {classicCombos.map((combo) => (
                  <button
                    key={combo.name}
                    onClick={() => setIngredients(combo.ingredients)}
                    className="text-xs text-left p-2 rounded border border-primary/30 hover:bg-primary/10 text-primary"
                  >
                    <div className="font-medium">{combo.name}</div>
                    <div className="text-foreground/60 mt-1">{combo.ingredients}</div>
                  </button>
                ))}
              </div>
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

            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Drink Styles</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {drinkStyles.map((style) => (
                  <Button
                    key={style}
                    variant={preferences === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreferences(style)}
                    className={`text-xs ${
                      preferences === style
                        ? "bg-primary text-white"
                        : "border-primary/30 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </FormStep>

        <FormStep
          number={3}
          title="Final Settings"
          subtitle="Choose your AI model, language, and review your drink specifications"
        >
          <div className="space-y-6">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />

            <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} />

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
