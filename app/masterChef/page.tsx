"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { generateRecipe } from "@/lib/client-recipe-generator"
import { ChefForm } from "@/components/chef-form"
import FormStep from "@/components/form-step"
import DietaryRequirements from "@/components/dietary-requirements"
import FreeTierBanner from "@/components/free-tier-banner"
import ModelSelector from "@/components/model-selector"
import CuisineSuggestions from "@/components/cuisine-suggestions"
import RecipeSuggestions from "@/components/recipe-suggestions"
import LanguageSelector from "@/components/language-selector"

export default function MasterChef() {
  const router = useRouter()
  const [recipeName, setRecipeName] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const handleSubmit = async () => {
    if (!recipeName.trim()) {
      setError("Please enter a recipe name or description")
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
        recipeName: recipeName + languageInstruction,
        cuisine,
        difficulty,
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

  return (
    <div className="generator-container">
      <FreeTierBanner />

      {error && <div className="generator-error mb-6">{error}</div>}

      <ChefForm
        title="MasterChef - Professional Recipe Creation"
        buttonText="Generate Recipe"
        onSubmit={handleSubmit}
        isLoading={isGenerating}
      >
        <FormStep number={1} title="Recipe Description" subtitle="Describe the recipe you want to create">
          <div className="space-y-6">
            <div>
              <label htmlFor="recipeName" className="block text-sm font-medium text-primary mb-2">
                What recipe would you like to create? *
              </label>
              <Textarea
                id="recipeName"
                placeholder="Describe the recipe you want (e.g., Creamy Garlic Parmesan Pasta with Grilled Chicken)"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="generator-textarea"
                rows={3}
              />
            </div>

            <RecipeSuggestions onSuggestionClick={setRecipeName} type="general" />

            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium text-primary mb-2">
                Cuisine Type (optional)
              </label>
              <Input
                id="cuisine"
                placeholder="E.g., Italian, Mexican, Japanese, French, etc."
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="generator-input"
              />
            </div>

            <CuisineSuggestions onCuisineClick={setCuisine} selectedCuisine={cuisine} />
          </div>
        </FormStep>

        <FormStep number={2} title="Recipe Complexity" subtitle="Choose the difficulty level and dietary preferences">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-3">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { level: "beginner", desc: "Simple techniques, basic ingredients" },
                  { level: "intermediate", desc: "Moderate skills, some special techniques" },
                  { level: "advanced", desc: "Complex techniques, professional methods" },
                ].map(({ level, desc }) => (
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
                    <div className="cursor-pointer">
                      <div className="capitalize font-medium">{level}</div>
                      <div className="text-xs text-foreground/70 mt-1">{desc}</div>
                    </div>
                  </div>
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
          title="Final Settings"
          subtitle="Choose your AI model, language, and review your selections"
        >
          <div className="space-y-6">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />

            <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} />

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Recipe Summary</h4>
              <div className="text-sm text-foreground/80 space-y-1">
                <p>
                  <strong>Recipe:</strong> {recipeName || "Not specified"}
                </p>
                <p>
                  <strong>Cuisine:</strong> {cuisine || "Any"}
                </p>
                <p>
                  <strong>Difficulty:</strong> {difficulty}
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
