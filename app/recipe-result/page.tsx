"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Clock,
  Users,
  ChefHat,
  ArrowLeft,
  Heart,
  Printer,
  Share,
  Play,
  DollarSign,
  Utensils,
  AlertTriangle,
} from "lucide-react"
import { PdfGenerator } from "@/components/pdf-generator"
import ShoppingListGenerator from "@/components/shopping-list-generator"
import CopyRecipeLink from "@/components/copy-recipe-link"
import AskChefGPT from "@/components/ask-chef-gpt"
import CookingMode from "@/components/cooking-mode"

export default function RecipeResult() {
  const router = useRouter()
  const [recipe, setRecipe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCookingMode, setShowCookingMode] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

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
        prepTime: "N/A",
        cookTime: "N/A",
        totalTime: "N/A",
        servings: "N/A",
        difficulty: "N/A",
        costEstimate: "N/A",
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

  const handleSave = () => {
    setIsSaved(!isSaved)
    // In a real app, this would save to a database
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-primary/20 rounded mb-4"></div>
          <div className="h-4 w-48 bg-primary/10 rounded mb-8"></div>
          <div className="h-32 w-full max-w-2xl bg-primary/10 rounded"></div>
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
  const extractIngredients = () => {
    if (!recipe) return []

    const ingredients = recipe.ingredients || []

    // If ingredients is a string, convert it to an array of objects
    if (typeof ingredients === "string") {
      return ingredients
        .split("\n")
        .filter(Boolean)
        .map((ing) => ({ name: ing, amount: "", checked: false }))
    }

    // If ingredients is an array of strings, convert to objects
    if (Array.isArray(ingredients)) {
      return ingredients.map((ing) => {
        if (typeof ing === "string") {
          return { name: ing, amount: "", checked: false }
        }
        return { ...ing, checked: false }
      })
    }

    return []
  }

  const ingredientsList = extractIngredients()

  // Get dietary classifications for tags
  const getDietaryTags = () => {
    const tags = []
    if (recipe.dietaryClassifications && Array.isArray(recipe.dietaryClassifications)) {
      tags.push(...recipe.dietaryClassifications)
    }
    if (recipe.allergenWarnings && Array.isArray(recipe.allergenWarnings) && recipe.allergenWarnings.length === 0) {
      // If no allergens, it might be considered safer
    }
    return tags.slice(0, 3) // Limit to 3 tags
  }

  const dietaryTags = getDietaryTags()

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/20">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`flex items-center gap-1 ${isSaved ? "text-red-500" : "text-primary"} hover:bg-primary/10`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            Save
          </Button>

          <PdfGenerator
            contentId="recipe-content"
            fileName={recipe.title?.replace(/\s+/g, "-").toLowerCase() || "recipe"}
            recipe={recipe}
          />

          <CopyRecipeLink recipe={recipe} />

          <ShoppingListGenerator ingredients={ingredientsList} recipeName={recipe.title || "Recipe"} />

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1 text-primary hover:bg-primary/10"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-1 text-primary hover:bg-primary/10"
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Recipe Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-primary mb-3">{recipe.title}</h1>
            <p className="text-lg text-foreground/80 mb-4">{recipe.description}</p>

            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => setShowCookingMode(true)}
                className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Cooking Mode
              </Button>

              {dietaryTags.length > 0 && (
                <div className="flex gap-2">
                  {dietaryTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="flex items-center gap-2 text-foreground/70">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm text-foreground/60">Prep Time</div>
            <div className="font-semibold">{recipe.prepTime || "15"}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-foreground/70">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm text-foreground/60">Cook Time</div>
            <div className="font-semibold">{recipe.cookTime || "20"}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-foreground/70">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm text-foreground/60">Total Time</div>
            <div className="font-semibold">{recipe.totalTime || "35"}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-foreground/70">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm text-foreground/60">Servings</div>
            <div className="font-semibold">{recipe.servings || "4"}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-foreground/70">
          <ChefHat className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm text-foreground/60">Difficulty</div>
            <div className="font-semibold">{recipe.difficulty || "Medium"}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-foreground/70">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm text-foreground/60">Cost</div>
            <div className="font-semibold">{recipe.costEstimate || "Moderate"}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recipe" className="mb-8">
        <TabsList className="mb-6 bg-secondary/50">
          <TabsTrigger value="recipe" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Recipe
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="tips" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Tips
          </TabsTrigger>
          <TabsTrigger value="extras" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Extras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-primary">Ingredients</h2>
              <ul className="space-y-3">
                {ingredientsList.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      {typeof ingredient === "string"
                        ? ingredient
                        : `${ingredient.amount ? `${ingredient.amount} ` : ""}${ingredient.name}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-primary">Instructions</h2>
              <ol className="space-y-4">
                {Array.isArray(recipe.instructions) ? (
                  recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                        {index + 1}
                      </div>
                      <span className="text-foreground pt-1">
                        {typeof instruction === "string" ? instruction : instruction.description}
                      </span>
                    </li>
                  ))
                ) : typeof recipe.instructions === "string" ? (
                  recipe.instructions
                    .split("\n")
                    .filter(Boolean)
                    .map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                          {index + 1}
                        </div>
                        <span className="text-foreground pt-1">{instruction}</span>
                      </li>
                    ))
                ) : (
                  <li>No instructions available</li>
                )}
              </ol>

              {/* Equipment Needed */}
              {recipe.equipment && recipe.equipment.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Equipment Needed</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {recipe.equipment.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Utensils className="h-4 w-4 text-primary" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Food Safety Tips */}
              {recipe.foodSafetyTips && recipe.foodSafetyTips.length > 0 && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Food Safety Tips
                  </h3>
                  <ul className="space-y-2">
                    {recipe.foodSafetyTips.map((tip, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
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

              {recipe.nutritionalInfo?.sodium && (
                <div className="nutrition-item">
                  <span className="nutrition-item-label">Sodium</span>
                  <span>{recipe.nutritionalInfo.sodium}</span>
                </div>
              )}
            </div>

            <div className="nutrition-footer">
              <p className="nutrition-disclaimer">* Percent Daily Values are based on a 2,000 calorie diet.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tips">
          <div className="space-y-6">
            {recipe.tips && recipe.tips.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Chef's Tips</h3>
                <ul className="space-y-3">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                      <span className="text-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.storage && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Storage Instructions</h3>
                <p className="text-foreground bg-secondary/30 p-4 rounded-lg">{recipe.storage}</p>
              </div>
            )}

            {recipe.reheating && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Reheating Instructions</h3>
                <p className="text-foreground bg-secondary/30 p-4 rounded-lg">{recipe.reheating}</p>
              </div>
            )}

            {recipe.pairingRecommendations && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Pairing Recommendations</h3>
                <p className="text-foreground bg-secondary/30 p-4 rounded-lg">{recipe.pairingRecommendations}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="extras">
          <div className="space-y-6">
            {recipe.allergenWarnings && recipe.allergenWarnings.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Allergen Information</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.allergenWarnings.map((allergen, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                    >
                      Contains {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recipe.dietaryClassifications && recipe.dietaryClassifications.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Dietary Classifications</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.dietaryClassifications.map((classification, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {classification}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recipe Scaling */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary">Recipe Scaling</h3>
              <p className="text-foreground/80 mb-4">
                This recipe serves {recipe.servings || "4"} people. Adjust quantities proportionally for different
                serving sizes.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-secondary/30 rounded-lg">
                  <div className="font-semibold">Half Recipe</div>
                  <div className="text-sm text-foreground/70">
                    {Math.ceil((Number.parseInt(recipe.servings) || 4) / 2)} servings
                  </div>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="font-semibold text-primary">Original</div>
                  <div className="text-sm text-primary/70">{recipe.servings || "4"} servings</div>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded-lg">
                  <div className="font-semibold">Double Recipe</div>
                  <div className="text-sm text-foreground/70">
                    {(Number.parseInt(recipe.servings) || 4) * 2} servings
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Ask ChefGPT Section */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <ChefHat className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-primary">Ask ChefGPT</h2>
        </div>

        <AskChefGPT recipe={recipe} />

        <div className="mt-4 text-sm text-foreground/60">
          <p className="italic">
            Example questions: "How can I make this recipe spicier?", "What can I substitute for butter?", "How do I
            know when it's properly cooked?"
          </p>
        </div>
      </div>

      {/* Cooking Mode Modal */}
      {showCookingMode && (
        <CookingMode
          title={recipe.title}
          instructions={recipe.instructions || []}
          onClose={() => setShowCookingMode(false)}
        />
      )}

      {/* Bottom Actions */}
      <div className="text-center mt-8 pt-8 border-t border-primary/20">
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => router.push("/pantryChef")}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            Create New Recipe
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            Print Recipe
          </Button>
          <Button onClick={() => router.push("/")} className="bg-primary text-white hover:bg-primary/90">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
