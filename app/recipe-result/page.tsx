"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Users, ChefHat, Utensils, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import PDFGenerator from "@/components/pdf-generator"
import ShoppingListGenerator from "@/components/shopping-list-generator"
import CopyRecipeLink from "@/components/copy-recipe-link"
import AskChefGPT from "@/components/ask-chef-gpt"
import MealTypeFilters from "@/components/meal-type-filters"
import { Header } from "@/components/header"

export default function RecipeResult() {
  const searchParams = useSearchParams()
  const recipeJson = searchParams.get("recipe")
  const [recipe, setRecipe] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("ingredients")

  useEffect(() => {
    if (recipeJson) {
      try {
        const parsedRecipe = JSON.parse(decodeURIComponent(recipeJson))
        setRecipe(parsedRecipe)
      } catch (error) {
        console.error("Error parsing recipe:", error)
      }
    }
  }, [recipeJson])

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading recipe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="text-gray-600 hover:text-primary flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Recipe Title Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{recipe.title}</h1>
              <p className="text-gray-600 mt-2">{recipe.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PDFGenerator recipe={recipe} />
              <ShoppingListGenerator ingredients={recipe.ingredients} title={recipe.title} />
              <CopyRecipeLink />
            </div>
          </div>

          {/* Recipe Type Badge */}
          <div className="inline-block bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-3 py-1 text-sm font-medium text-primary mb-4">
            {recipe.cuisine || "Mixed"} Cuisine
          </div>

          {/* Recipe Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Card className="border border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 flex items-center">
                <Clock className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Prep Time</p>
                  <p className="font-medium">{recipe.prepTime || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 flex items-center">
                <Utensils className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Cook Time</p>
                  <p className="font-medium">{recipe.cookTime || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 flex items-center">
                <Users className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Servings</p>
                  <p className="font-medium">{recipe.servings || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 flex items-center">
                <ChefHat className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Difficulty</p>
                  <p className="font-medium">{recipe.difficulty || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Meal Type Filters */}
        <div className="mb-6">
          <MealTypeFilters />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="ingredients" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-white border border-primary/20 rounded-lg p-1 mb-4">
                <TabsTrigger
                  value="ingredients"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all"
                >
                  Ingredients
                </TabsTrigger>
                <TabsTrigger
                  value="instructions"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all"
                >
                  Instructions
                </TabsTrigger>
                <TabsTrigger
                  value="nutrition"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all"
                >
                  Nutrition
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ingredients" className="mt-0">
                <div className="bg-white rounded-lg shadow-md p-6 border border-primary/20">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                    Ingredients
                  </h2>
                  <ul className="space-y-2">
                    {recipe.ingredients &&
                      recipe.ingredients.map((ingredient: any, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span>
                            {ingredient.amount && <span className="font-medium">{ingredient.amount}</span>}{" "}
                            {ingredient.name}
                            {ingredient.allergens && ingredient.allergens.length > 0 && (
                              <span className="text-red-500 text-sm ml-2">
                                (Contains: {ingredient.allergens.join(", ")})
                              </span>
                            )}
                            {ingredient.substitutes && (
                              <span className="text-gray-500 text-sm block mt-1">
                                Substitute: {ingredient.substitutes}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="mt-0">
                <div className="bg-white rounded-lg shadow-md p-6 border border-primary/20">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                    Instructions
                  </h2>
                  <ol className="space-y-4">
                    {recipe.instructions &&
                      recipe.instructions.map((instruction: any, index: number) => {
                        const step =
                          typeof instruction === "string"
                            ? instruction
                            : instruction.description || instruction.step || ""

                        const timingTip = instruction.timingTip
                        const safetyTip = instruction.safetyTip

                        return (
                          <li key={index} className="ml-8 relative">
                            <div className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <p>{step}</p>

                            {timingTip && <p className="text-sm text-primary mt-1 italic">Timing Tip: {timingTip}</p>}

                            {safetyTip && <p className="text-sm text-red-500 mt-1 italic">Safety Tip: {safetyTip}</p>}
                          </li>
                        )
                      })}
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-0">
                <div className="bg-white rounded-lg shadow-md p-6 border border-primary/20">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                    Nutritional Information
                  </h2>
                  {recipe.nutritionalInfo ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(recipe.nutritionalInfo).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="text-sm text-gray-500 capitalize">{key}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Nutritional information not available.</p>
                  )}

                  {recipe.allergenWarnings && recipe.allergenWarnings.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2 text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Allergen Warnings
                      </h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {recipe.allergenWarnings.map((allergen: string, index: number) => (
                          <li key={index} className="text-red-600">
                            {allergen}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recipe.dietaryClassifications && recipe.dietaryClassifications.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Dietary Classifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {recipe.dietaryClassifications.map((diet: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Equipment Needed */}
            {recipe.equipment && recipe.equipment.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-primary/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                  Equipment Needed
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.equipment.map((item: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Utensils className="h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Food Safety Tips */}
            {recipe.foodSafetyTips && recipe.foodSafetyTips.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6 border-l-4 border-red-500 border-t border-r border-b">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Food Safety Tips
                </h2>
                <ul className="space-y-2">
                  {recipe.foodSafetyTips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Generator Badge */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChefHat className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium">Generated by ChefGPT</span>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">AI Recipe</span>
              </div>
            </div>

            {/* Ask ChefGPT */}
            <AskChefGPT recipe={recipe} />

            {/* Storage & Reheating */}
            {(recipe.storage || recipe.reheating) && (
              <div className="bg-white rounded-lg shadow-md p-4 border border-primary/20">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                  Storage & Reheating
                </h3>

                {recipe.storage && (
                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Storage</h4>
                    <p className="text-sm">{recipe.storage}</p>
                  </div>
                )}

                {recipe.reheating && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Reheating</h4>
                    <p className="text-sm">{recipe.reheating}</p>
                  </div>
                )}
              </div>
            )}

            {/* Pairing Recommendations */}
            {recipe.pairingRecommendations && (
              <div className="bg-white rounded-lg shadow-md p-4 border border-primary/20">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                  Pairing Recommendations
                </h3>
                <p className="text-sm">{recipe.pairingRecommendations}</p>
              </div>
            )}

            {/* Tips */}
            {recipe.tips && recipe.tips.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 border border-primary/20">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
                  Chef's Tips
                </h3>
                <ul className="space-y-2">
                  {recipe.tips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
