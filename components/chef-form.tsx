"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ChefHat, Clock, Users, Utensils, Loader2 } from "lucide-react"
import FormStep from "@/components/form-step"
import DietaryRequirements from "@/components/dietary-requirements"
import PopularIngredients from "@/components/popular-ingredients"
import CuisineSuggestions from "@/components/cuisine-suggestions"
import RecipeSuggestions from "@/components/recipe-suggestions"
import ModelSelector from "@/components/model-selector"

interface ChefFormProps {
  tool: string
  title: string
  description: string
}

export default function ChefForm({ tool, title, description }: ChefFormProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [ingredients, setIngredients] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [cookingTime, setCookingTime] = useState<number>(30)
  const [servings, setServings] = useState<number>(4)
  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [selectedModel, setSelectedModel] = useState({ provider: "openai", value: "gpt-4o" })

  const handleDietaryChange = (diet: string) => {
    if (dietaryRestrictions.includes(diet)) {
      setDietaryRestrictions(dietaryRestrictions.filter((d) => d !== diet))
    } else {
      setDietaryRestrictions([...dietaryRestrictions, diet])
    }
  }

  const handleAddIngredient = (ingredient: string) => {
    if (ingredients) {
      setIngredients(ingredients + ", " + ingredient)
    } else {
      setIngredients(ingredient)
    }
  }

  const handleSelectCuisine = (selectedCuisine: string) => {
    setCuisine(selectedCuisine)
  }

  const handleSelectRecipe = (recipe: string) => {
    setIngredients(recipe)
  }

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      setGenerationError("Please enter ingredients or a recipe idea")
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients,
          cuisine,
          dietaryRestrictions: dietaryRestrictions.join(", "),
          cookingTime: `${cookingTime} minutes`,
          servings,
          difficulty,
          tool,
          modelInfo: selectedModel,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Store the recipe in localStorage as a string
      if (data.recipe) {
        localStorage.setItem("generatedRecipe", data.recipe)

        // Navigate to the recipe result page
        router.push("/recipe-result")
      } else {
        throw new Error("No recipe data received")
      }
    } catch (error) {
      console.error("Error generating recipe:", error)
      setGenerationError("Failed to generate recipe. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-primary/20 shadow-md">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary mb-2 flex items-center">
            <ChefHat className="mr-2 h-6 w-6" />
            {title}
          </h2>
          <p className="text-foreground/70">{description}</p>
        </div>

        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="ingredients" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Utensils className="h-4 w-4 mr-2" />
              Ingredients
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients" className="space-y-6">
            <FormStep
              number={1}
              title="Enter Ingredients or Recipe Idea"
              description="List ingredients you have or describe a dish you want to make"
            >
              <Textarea
                placeholder="e.g., chicken, rice, bell peppers, onions, garlic, olive oil"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="min-h-[120px] bg-secondary/50 border border-primary/30 rounded-lg px-4 py-3"
              />

              <PopularIngredients onAddIngredient={handleAddIngredient} tool={tool} />
              <RecipeSuggestions onSelectRecipe={handleSelectRecipe} tool={tool} />
            </FormStep>

            <FormStep
              number={2}
              title="Select Cuisine Style (Optional)"
              description="Choose a cuisine to influence the recipe style"
            >
              <CuisineSuggestions onSelectCuisine={handleSelectCuisine} selectedCuisine={cuisine} />

              <div className="mt-4">
                <Label htmlFor="custom-cuisine">Or enter a custom cuisine:</Label>
                <Input
                  id="custom-cuisine"
                  placeholder="e.g., Mediterranean, Fusion, etc."
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="bg-secondary/50 border border-primary/30"
                />
              </div>
            </FormStep>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <FormStep
              number={3}
              title="Dietary Requirements"
              description="Select any dietary restrictions or preferences"
            >
              <DietaryRequirements selectedDiets={dietaryRestrictions} onDietaryChange={handleDietaryChange} />
            </FormStep>

            <FormStep number={4} title="Servings" description="How many people are you cooking for?">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Servings: {servings}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="h-8 w-8 p-0 border-primary/30"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{servings}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setServings(Math.min(12, servings + 1))}
                      className="h-8 w-8 p-0 border-primary/30"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </FormStep>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <FormStep number={5} title="Cooking Time" description="How much time do you have for cooking?">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cooking Time: {cookingTime} minutes</span>
                </div>
                <Slider
                  value={[cookingTime]}
                  min={5}
                  max={120}
                  step={5}
                  onValueChange={(value) => setCookingTime(value[0])}
                  className="accent-primary"
                />
                <div className="flex justify-between text-xs text-foreground/70">
                  <span>Quick (5 min)</span>
                  <span>Medium (30 min)</span>
                  <span>Slow (120 min)</span>
                </div>
              </div>
            </FormStep>

            <FormStep number={6} title="Difficulty Level" description="Select your cooking skill level">
              <div className="grid grid-cols-3 gap-4">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={difficulty === level ? "default" : "outline"}
                    onClick={() => setDifficulty(level)}
                    className={`border-2 ${
                      difficulty === level
                        ? "bg-primary text-white border-primary"
                        : "bg-transparent text-foreground border-primary/30 hover:bg-primary/10"
                    }`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </FormStep>

            <FormStep
              number={7}
              title="AI Model Selection"
              description="Choose which AI model to use for recipe generation"
            >
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
            </FormStep>
          </TabsContent>
        </Tabs>

        {generationError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {generationError}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleGenerateRecipe}
            disabled={isGenerating || !ingredients.trim()}
            className="w-full max-w-md bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Recipe...
              </>
            ) : (
              <>
                <ChefHat className="mr-2 h-5 w-5" />
                Generate Recipe
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
