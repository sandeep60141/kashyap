"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Heart,
  Download,
  Link,
  ShoppingBag,
  Printer,
  Share2,
  Play,
  Clock,
  Users,
  ChefHat,
  DollarSign,
  Utensils,
  AlertTriangle,
  Send,
} from "lucide-react"

export default function RecipeResultPage() {
  const router = useRouter()
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [askQuestion, setAskQuestion] = useState("")

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Recipe link copied to clipboard!")
  }

  const handleDownloadPDF = () => {
    // PDF download functionality
    window.print()
  }

  const handleShoppingList = () => {
    // Shopping list functionality
    alert("Shopping list feature coming soon!")
  }

  const handleAskQuestion = () => {
    if (askQuestion.trim()) {
      // Handle ask question functionality
      console.log("Question:", askQuestion)
      setAskQuestion("")
    }
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
        <Button onClick={() => router.push("/")} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Back to Home
        </Button>
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
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                isSaved ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
              Save
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Link className="h-5 w-5" />
              Copy Link
            </button>

            <button
              onClick={handleShoppingList}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Shopping List
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Printer className="h-5 w-5" />
              Print
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 text-white px-6 py-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-3">{recipe.title || "Quick Seared Beef Strips"}</h1>
          <p className="text-xl text-purple-100 mb-6">
            {recipe.description || "A fast and flavorful beef dish perfect for a quick meal."}
          </p>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mb-4 shadow-lg transition-all">
            <Play className="h-5 w-5" />
            Start Cooking Mode
          </button>

          {recipe.dietaryClassifications && recipe.dietaryClassifications.length > 0 ? (
            <div className="flex gap-2">
              {recipe.dietaryClassifications.slice(0, 3).map((diet: string, index: number) => (
                <span key={index} className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {diet}
                </span>
              ))}
            </div>
          ) : (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Gluten-Free</span>
          )}
        </div>
      </div>

      {/* Recipe Stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Prep Time</p>
              <p className="font-bold text-xl text-gray-900">{recipe.prepTime?.replace(/\D/g, "") || "5"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Cook Time</p>
              <p className="font-bold text-xl text-gray-900">{recipe.cookTime?.replace(/\D/g, "") || "5"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Time</p>
              <p className="font-bold text-xl text-gray-900">{recipe.totalTime?.replace(/\D/g, "") || "10"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Servings</p>
              <p className="font-bold text-xl text-gray-900">{recipe.servings || "2"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <ChefHat className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Difficulty</p>
              <p className="font-bold text-xl text-gray-900">{recipe.difficulty || "Expert"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <DollarSign className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Cost</p>
              <p className="font-bold text-xl text-gray-900">{recipe.costEstimate || "Moderate"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6">
        <Tabs defaultValue="recipe" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start p-0 h-auto">
            <TabsTrigger
              value="recipe"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 rounded-none px-6 py-4 font-semibold text-gray-600 hover:text-gray-900"
            >
              Recipe
            </TabsTrigger>
            <TabsTrigger
              value="nutrition"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 rounded-none px-6 py-4 font-semibold text-gray-600 hover:text-gray-900"
            >
              Nutrition
            </TabsTrigger>
            <TabsTrigger
              value="tips"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 rounded-none px-6 py-4 font-semibold text-gray-600 hover:text-gray-900"
            >
              Tips
            </TabsTrigger>
            <TabsTrigger
              value="extras"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 rounded-none px-6 py-4 font-semibold text-gray-600 hover:text-gray-900"
            >
              Extras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipe" className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Ingredients */}
              <div>
                <h2 className="text-2xl font-bold text-indigo-600 mb-6">Ingredients</h2>
                <ul className="space-y-4">
                  {ingredients.length > 0 ? (
                    ingredients.map((ingredient: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-800 text-lg leading-relaxed">{ingredient}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-800 text-lg">200 grams Beef sirloin steak</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-800 text-lg">1 tablespoon Olive oil</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-800 text-lg">1/2 teaspoon Salt</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-800 text-lg">1/4 teaspoon Black pepper</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-800 text-lg">1/4 teaspoon Garlic powder</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-800 text-lg">1 tablespoon, chopped Fresh parsley</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="text-2xl font-bold text-indigo-600 mb-6">Instructions</h2>
                <ol className="space-y-6">
                  {instructions.length > 0 ? (
                    instructions.map((instruction: string, index: number) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-gray-800 text-lg leading-relaxed pt-1">{instruction}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          1
                        </div>
                        <span className="text-gray-800 text-lg leading-relaxed pt-1">
                          Slice the beef sirloin steak into thin strips.
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          2
                        </div>
                        <span className="text-gray-800 text-lg leading-relaxed pt-1">
                          Season the beef strips with salt, black pepper, and garlic powder.
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          3
                        </div>
                        <span className="text-gray-800 text-lg leading-relaxed pt-1">
                          Heat olive oil in a cast iron skillet over high heat until shimmering.
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          4
                        </div>
                        <span className="text-gray-800 text-lg leading-relaxed pt-1">
                          Add the beef strips to the skillet in a single layer. Sear for 1-2 minutes on each side until
                          browned.
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          5
                        </div>
                        <span className="text-gray-800 text-lg leading-relaxed pt-1">
                          Remove from heat and garnish with fresh parsley before serving.
                        </span>
                      </li>
                    </>
                  )}
                </ol>

                {/* Equipment Needed */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-indigo-600 mb-4">Equipment Needed</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Utensils className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium">Sharp knife</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Utensils className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium">Cutting board</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Utensils className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium">Cast iron skillet or frying pan</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Utensils className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium">Tongs</span>
                    </div>
                  </div>
                </div>

                {/* Food Safety Tips */}
                <div className="mt-10 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <h3 className="text-xl font-bold text-red-700">Food Safety Tips</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1 font-bold">•</span>
                      <span>
                        Ensure meat is cooked to a safe internal temperature: 165°F (74°C) for chicken/poultry, 145°F
                        (63°C) for fish, 160°F (71°C) for ground meats, and 145°F (63°C) with a 3-minute rest for whole
                        cuts of beef/pork/lamb.
                      </span>
                    </li>
                    <li className="text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1 font-bold">•</span>
                      <span>Always wash hands and surfaces after handling raw meat.</span>
                    </li>
                    <li className="text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1 font-bold">•</span>
                      <span>Use separate cutting boards for raw meat and other ingredients.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="py-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">Nutrition Facts</h3>
              <p className="text-gray-600 mb-6">Per serving</p>

              {recipe.nutritionalInfo && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(recipe.nutritionalInfo).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 capitalize font-medium">{key}</p>
                      <p className="font-bold text-xl text-gray-900">{value || "N/A"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="py-8">
            <div className="space-y-6">
              {recipe.tips && recipe.tips.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">Chef's Tips</h3>
                  <ul className="space-y-4">
                    {recipe.tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-800 text-lg leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="extras" className="py-8">
            <div className="space-y-6">
              {recipe.allergenWarnings && recipe.allergenWarnings.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">Allergen Information</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.allergenWarnings.map((allergen: string, index: number) => (
                      <span key={index} className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium">
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
      <div className="bg-indigo-50 mx-6 my-8 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <ChefHat className="h-7 w-7 text-indigo-600" />
          <h2 className="text-2xl font-bold text-indigo-900">Ask ChefGPT</h2>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={askQuestion}
            onChange={(e) => setAskQuestion(e.target.value)}
            placeholder="Ask a question about this recipe..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
          />
          <button
            onClick={handleAskQuestion}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

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
