"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Clock, Users, ChefHat } from "lucide-react"
import { PdfGenerator } from "@/components/pdf-generator"
import ShoppingListGenerator from "@/components/shopping-list-generator"
import MealTypeFilters from "@/components/meal-type-filters"
import CopyRecipeLink from "@/components/copy-recipe-link"
import AskChefGPT from "@/components/ask-chef-gpt"

export default function RecipeResult() {
  const router = useRouter()
  const [recipe, setRecipe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get the recipe from localStorage
    const storedRecipe = localStorage.getItem("generatedRecipe")

    if (!storedRecipe) {
      router.push("/pantryChef")
      return
    }

    try {
      // Parse the recipe if it's JSON
      const parsedRecipe = JSON.parse(storedRecipe)
      setRecipe(parsedRecipe)
    } catch (e) {
      // If it's not JSON, use it as a string
      setRecipe({
        title: "Generated Recipe",
        description: storedRecipe,
        ingredients: [],
        instructions: [],
        cookingTime: "N/A",
        servings: "N/A",
        nutritionalInfo: {
          calories: "N/A",
          protein: "N/A",
          carbs: "N/A",
          fat: "N/A",
        },
      })
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="h-32 w-full max-w-2xl bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">No Recipe Found</h1>
        <p className="mb-6">We couldn't find a recipe. Please try generating a new one.</p>
        <Button onClick={() => router.push("/pantryChef")}>Create New Recipe</Button>
      </div>
    )
  }

  // Extract ingredients from the recipe
  const ingredients = recipe.ingredients || []

  // If ingredients is a string, convert it to an array
  const ingredientsList = Array.isArray(ingredients)
    ? ingredients
    : typeof ingredients === "string"
      ? ingredients.split("\n").filter(Boolean)
      : []

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
          <p className="text-blue-50">{recipe.description}</p>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{recipe.cookingTime || "30 minutes"}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{recipe.servings || "4 servings"}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <ChefHat className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{recipe.difficulty || "Intermediate"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <PdfGenerator
              contentId="recipe-content"
              fileName={recipe.title.replace(/\s+/g, "-").toLowerCase()}
              recipe={recipe}
            />
            <ShoppingListGenerator ingredients={ingredientsList} />
            <CopyRecipeLink recipe={recipe} />
          </div>

          <Tabs defaultValue="recipe">
            <TabsList className="mb-6">
              <TabsTrigger value="recipe">Recipe</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="recipe" className="space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-4 text-blue-700">Ingredients</h2>
                <ul className="space-y-2">
                  {ingredientsList.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 text-blue-700">Instructions</h2>
                <ol className="space-y-4">
                  {Array.isArray(recipe.instructions) ? (
                    recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {index + 1}
                        </div>
                        <span>{typeof instruction === "string" ? instruction : instruction.description}</span>
                      </li>
                    ))
                  ) : typeof recipe.instructions === "string" ? (
                    recipe.instructions
                      .split("\n")
                      .filter(Boolean)
                      .map((instruction, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {index + 1}
                          </div>
                          <span>{instruction}</span>
                        </li>
                      ))
                  ) : (
                    <li>No instructions available</li>
                  )}
                </ol>
              </div>

              {recipe.tips && recipe.tips.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-blue-700">Chef's Tips</h2>
                  <ul className="space-y-2">
                    {recipe.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nutrition">
              <div className="nutrition-tab">
                <div className="nutrition-header">
                  <h3 className="nutrition-title">Nutrition Facts</h3>
                  <p className="nutrition-subtitle">Per serving</p>
                </div>

                <div className="nutrition-content">
                  <div className="nutrition-calories">
                    <span className="text-lg font-bold">Calories</span>
                    <span className="text-lg font-bold">{recipe.nutritionalInfo?.calories || "N/A"}</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-item-label">Protein</span>
                    <span>{recipe.nutritionalInfo?.protein || "N/A"}</span>
                  </div>

                  <div className="nutrition-item">
                    <span className="nutrition-item-label">Carbohydrates</span>
                    <span>{recipe.nutritionalInfo?.carbs || "N/A"}</span>
                  </div>

                  {recipe.nutritionalInfo?.fiber && (
                    <div className="nutrition-item">
                      <span className="nutrition-item-sub">Fiber</span>
                      <span>{recipe.nutritionalInfo.fiber}</span>
                    </div>
                  )}

                  {recipe.nutritionalInfo?.sugar && (
                    <div className="nutrition-item">
                      <span className="nutrition-item-sub">Sugars</span>
                      <span>{recipe.nutritionalInfo.sugar}</span>
                    </div>
                  )}

                  <div className="nutrition-item">
                    <span className="nutrition-item-label">Fat</span>
                    <span>{recipe.nutritionalInfo?.fat || "N/A"}</span>
                  </div>
                </div>

                <div className="nutrition-footer">
                  <p className="nutrition-disclaimer">* Percent Daily Values are based on a 2,000 calorie diet.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-5">
                  <h3 className="text-lg font-bold mb-3 text-blue-700">Ask ChefGPT</h3>
                  <p className="text-gray-600 mb-4">Have questions about this recipe? Ask our AI chef!</p>
                  <AskChefGPT recipe={recipe} />
                </div>

                <div className="border rounded-lg p-5">
                  <h3 className="text-lg font-bold mb-3 text-blue-700">Meal Type Filters</h3>
                  <p className="text-gray-600 mb-4">Filter recipes by meal type</p>
                  <MealTypeFilters />
                </div>

                <div className="border rounded-lg p-5">
                  <h3 className="text-lg font-bold mb-3 text-blue-700">Shopping List</h3>
                  <p className="text-gray-600 mb-4">Generate a shopping list from this recipe</p>
                  <ShoppingListGenerator ingredients={ingredientsList} />
                </div>

                <div className="border rounded-lg p-5">
                  <h3 className="text-lg font-bold mb-3 text-blue-700">Download Recipe</h3>
                  <p className="text-gray-600 mb-4">Save this recipe as a PDF for offline use</p>
                  <PdfGenerator
                    contentId="recipe-content"
                    fileName={recipe.title.replace(/\s+/g, "-").toLowerCase()}
                    recipe={recipe}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="text-center">
        <Button onClick={() => router.push("/pantryChef")} variant="outline" className="mr-4">
          Create New Recipe
        </Button>
        <Button onClick={() => window.print()}>Print Recipe</Button>
      </div>
    </div>
  )
}
