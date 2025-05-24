"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Heart,
  Printer,
  Share2,
  Play,
  Clock,
  Users,
  ChefHat,
  DollarSign,
  Utensils,
  AlertTriangle,
} from "lucide-react"
import { PDFGenerator } from "@/components/pdf-generator"
import { ShoppingListGenerator } from "@/components/shopping-list-generator"
import { CopyRecipeLink } from "@/components/copy-recipe-link"
import { AskChefGPT } from "@/components/ask-chef-gpt"

export default function RecipeResultPage() {
  const router = useRouter()
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const storedRecipe = localStorage.getItem("generatedRecipe")
    if (storedRecipe) {
      try {
        const parsedRecipe = JSON.parse(storedRecipe)
        setRecipe(parsedRecipe)
      } catch (e) {
        console.error("Error parsing recipe:", e)
      }
    }
    setLoading(false)
  }, [])

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title || "Recipe",
        text: recipe?.description || "Check out this recipe!",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">No Recipe Found</h1>
        <p className="mb-6">We couldn't find a recipe. Please try generating a new one.</p>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    )
  }

  const extractIngredients = () => {
    if (!recipe?.ingredients) return []

    if (typeof recipe.ingredients === "string") {
      return recipe.ingredients
        .split("\n")
        .filter(Boolean)
        .map((ing: string) => ing.trim())
    }

    if (Array.isArray(recipe.ingredients)) {
      return recipe.ingredients.map((ing: any) => {
        if (typeof ing === "string") return ing
        return `${ing.amount || ""} ${ing.name || ing.ingredient || ""}`.trim()
      })
    }

    return []
  }

  const extractInstructions = () => {
    if (!recipe?.instructions) return []

    if (typeof recipe.instructions === "string") {
      return recipe.instructions
        .split("\n")
        .filter(Boolean)
        .map((inst: string) => inst.trim())
    }

    if (Array.isArray(recipe.instructions)) {
      return recipe.instructions.map((inst: any) => {
        if (typeof inst === "string") return inst
        return inst.description || inst.step || ""
      })
    }

    return []
  }

  const ingredients = extractIngredients()
  const instructions = extractInstructions()

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`flex items-center gap-2 ${isSaved ? "text-red-500" : "text-gray-600"}`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              Save
            </Button>

            <PDFGenerator recipe={recipe} fileName={recipe.title?.replace(/\s+/g, "-").toLowerCase() || "recipe"} />

            <CopyRecipeLink recipe={recipe} />

            <ShoppingListGenerator ingredients={ingredients} recipeName={recipe.title || "Recipe"} />

            <Button variant="ghost" size="sm" onClick={handlePrint} className="flex items-center gap-2 text-gray-600">
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button variant="ghost" size="sm" onClick={handleShare} className="flex items-center gap-2 text-gray-600">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3">{recipe.title || "Delicious Recipe"}</h1>
          <p className="text-lg text-indigo-100 mb-6">
            {recipe.description || "A wonderful dish perfect for any occasion."}
          </p>

          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mb-4">
            <Play className="h-4 w-4" />
            Start Cooking Mode
          </Button>

          {recipe.dietaryClassifications && recipe.dietaryClassifications.length > 0 && (
            <div className="flex gap-2">
              {recipe.dietaryClassifications.slice(0, 3).map((diet: string, index: number) => (
                <span key={index} className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {diet}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recipe Stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Prep Time</p>
              <p className="font-semibold text-lg">{recipe.prepTime || "15"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cook Time</p>
              <p className="font-semibold text-lg">{recipe.cookTime || "20"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Time</p>
              <p className="font-semibold text-lg">{recipe.totalTime || "35"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Servings</p>
              <p className="font-semibold text-lg">{recipe.servings || "4"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <ChefHat className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Difficulty</p>
              <p className="font-semibold text-lg">{recipe.difficulty || "Medium"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <DollarSign className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost</p>
              <p className="font-semibold text-lg">{recipe.costEstimate || "Moderate"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6">
        <Tabs defaultValue="recipe" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start p-0">
            <TabsTrigger
              value="recipe"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent rounded-none px-6 py-4 font-medium"
            >
              Recipe
            </TabsTrigger>
            <TabsTrigger
              value="nutrition"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent rounded-none px-6 py-4 font-medium"
            >
              Nutrition
            </TabsTrigger>
            <TabsTrigger
              value="tips"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent rounded-none px-6 py-4 font-medium"
            >
              Tips
            </TabsTrigger>
            <TabsTrigger
              value="extras"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent rounded-none px-6 py-4 font-medium"
            >
              Extras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipe" className="py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div>
                <h2 className="text-xl font-bold text-indigo-600 mb-4">Ingredients</h2>
                <ul className="space-y-3">
                  {ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="text-xl font-bold text-indigo-600 mb-4">Instructions</h2>
                <ol className="space-y-4">
                  {instructions.map((instruction: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 pt-1">{instruction}</span>
                    </li>
                  ))}
                </ol>

                {/* Equipment Needed */}
                {recipe.equipment && recipe.equipment.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4">Equipment Needed</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {recipe.equipment.map((item: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Utensils className="h-4 w-4 text-indigo-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Safety Tips */}
                {recipe.foodSafetyTips && recipe.foodSafetyTips.length > 0 && (
                  <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-700">Food Safety Tips</h3>
                    </div>
                    <ul className="space-y-2">
                      {recipe.foodSafetyTips.map((tip: string, index: number) => (
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

          <TabsContent value="nutrition" className="py-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Nutrition Facts</h3>
              <p className="text-sm text-gray-600 mb-4">Per serving</p>

              {recipe.nutritionalInfo && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(recipe.nutritionalInfo).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-center p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">{key}</p>
                      <p className="font-bold text-lg">{value || "N/A"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="py-6">
            <div className="space-y-6">
              {recipe.tips && recipe.tips.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Chef's Tips</h3>
                  <ul className="space-y-3">
                    {recipe.tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="extras" className="py-6">
            <div className="space-y-6">
              {recipe.allergenWarnings && recipe.allergenWarnings.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Allergen Information</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.allergenWarnings.map((allergen: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Contains {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ask ChefGPT Section */}
      <div className="bg-indigo-50 mx-6 my-6 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <ChefHat className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-indigo-900">Ask ChefGPT</h2>
        </div>

        <AskChefGPT recipe={recipe} />

        <div className="mt-4 text-sm text-gray-600 italic">
          <p>
            Example questions: "How can I make this recipe spicier?", "What can I substitute for butter?", "How do I
            know when it's properly cooked?"
          </p>
        </div>
      </div>
    </div>
  )
}
