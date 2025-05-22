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

export default function MasterChef() {
  const router = useRouter()
  const [recipeName, setRecipeName] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")

  // Improve the recipe name suggestions and add more helpful tooltips

  // Add a function to handle recipe suggestion clicks with better feedback
  const handleRecipeSuggestionClick = (suggestion: string) => {
    setRecipeName(suggestion)
    // Auto-detect cuisine from the recipe name
    const cuisineMap = {
      italian: ["pasta", "risotto", "pizza", "lasagna", "carbonara", "parmesan"],
      mexican: ["taco", "burrito", "enchilada", "quesadilla", "salsa"],
      chinese: ["stir fry", "fried rice", "dumpling", "noodle"],
      japanese: ["sushi", "ramen", "teriyaki", "miso", "tempura"],
      thai: ["curry", "pad thai", "tom yum"],
      indian: ["curry", "masala", "tikka", "biryani", "tandoori"],
      french: ["coq au vin", "ratatouille", "croissant", "souffle"],
      mediterranean: ["hummus", "falafel", "pita", "greek", "olive"],
    }

    // Check if the recipe name contains any cuisine keywords
    const lowerCaseName = suggestion.toLowerCase()
    for (const [cuisine, keywords] of Object.entries(cuisineMap)) {
      if (keywords.some((keyword) => lowerCaseName.includes(keyword))) {
        setCuisine(cuisine.charAt(0).toUpperCase() + cuisine.slice(1))
        break
      }
    }
  }

  const handleSubmit = async () => {
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

            <RecipeSuggestions onSuggestionClick={handleRecipeSuggestionClick} type="general" />

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
            {/* Add tooltips for difficulty levels
            Replace the difficulty section with this enhanced version */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    level: "beginner",
                    desc: "Simple techniques, basic ingredients",
                    tooltip: "Perfect for new cooks. Minimal prep, simple cooking methods, common ingredients.",
                  },
                  {
                    level: "intermediate",
                    desc: "Moderate skills, some special techniques",
                    tooltip:
                      "For those with some cooking experience. May require more prep time and specialized techniques.",
                  },
                  {
                    level: "advanced",
                    desc: "Complex techniques, professional methods",
                    tooltip:
                      "For experienced cooks. Involves complex techniques, precise timing, and specialized equipment.",
                  },
                ].map(({ level, desc, tooltip }) => (
                  <div
                    key={level}
                    className={`generator-option ${difficulty === level ? "generator-option-active" : ""}`}
                    onClick={() => setDifficulty(level)}
                    title={tooltip}
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

        <FormStep number={3} title="Final Settings" subtitle="Choose your AI model and review your selections">
          <div className="space-y-6">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />

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
              </div>
            </div>
          </div>
        </FormStep>
      </ChefForm>
    </div>
  )
}
