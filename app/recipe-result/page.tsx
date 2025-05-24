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
  Download,
  Link,
  ShoppingBag,
} from "lucide-react"
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
        <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90 text-white">
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
      <div className="bg-white border-b border-primary/20 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-primary hover:bg-primary/10 hover:text-primary font-medium px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isSaved
                  ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                  : "text-primary hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              Save
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-primary hover:bg-primary/10 hover:text-primary px-4 py-2 rounded-lg font-medium transition-all"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-primary hover:bg-primary/10 hover:text-primary px-4 py-2 rounded-lg font-medium transition-all"
            >
              <Link className="h-4 w-4" />
              Copy Link
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-primary hover:bg-primary/10 hover:text-primary px-4 py-2 rounded-lg font-medium transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              Shopping List
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2 text-primary hover:bg-primary/10 hover:text-primary px-4 py-2 rounded-lg font-medium transition-all"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 text-primary hover:bg-primary/10 hover:text-primary px-4 py-2 rounded-lg font-medium transition-all"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-8 shadow-lg">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3">{recipe.title || "Delicious Recipe"}</h1>
          <p className="text-lg text-white/90 mb-6">
            {recipe.description || "A wonderful dish perfect for any occasion."}
          </p>

          <Button className="bg-white text-primary hover:bg-white/90 hover:text-primary/90 px-6 py-3 rounded-lg font-medium flex items-center gap-2 mb-4 shadow-md transition-all">
            <Play className="h-4 w-4" />
            Start Cooking Mode
          </Button>

          {recipe.dietaryClassifications && recipe.dietaryClassifications.length > 0 && (
            <div className="flex gap-2">
              {recipe.dietaryClassifications.slice(0, 3).map((diet: string, index: number) => (
                <span
                  key={index}
                  className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                >
                  {diet}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recipe Stats */}
      <div className="bg-white border-b border-primary/20 px-6 py-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Prep Time</p>
              <p className="font-semibold text-lg text-foreground">{recipe.prepTime || "15"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Cook Time</p>
              <p className="font-semibold text-lg text-foreground">{recipe.cookTime || "20"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Total Time</p>
              <p className="font-semibold text-lg text-foreground">{recipe.totalTime || "35"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Servings</p>
              <p className="font-semibold text-lg text-foreground">{recipe.servings || "4"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Difficulty</p>
              <p className="font-semibold text-lg text-foreground">{recipe.difficulty || "Medium"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Cost</p>
              <p className="font-semibold text-lg text-foreground">{recipe.costEstimate || "Moderate"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6 shadow-sm">
        <Tabs defaultValue="recipe" className="w-full">
          <TabsList className="bg-transparent border-b border-primary/20 rounded-none w-full justify-start p-0">
            <TabsTrigger
              value="recipe"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none px-6 py-4 font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Recipe
            </TabsTrigger>
            <TabsTrigger
              value="nutrition"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none px-6 py-4 font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Nutrition
            </TabsTrigger>
            <TabsTrigger
              value="tips"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none px-6 py-4 font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Tips
            </TabsTrigger>
            <TabsTrigger
              value="extras"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none px-6 py-4 font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Extras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipe" className="py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div>
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Ingredients
                </h2>
                <ul className="space-y-3">
                  {ingredients.map((ingredient: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-2 hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <span className="text-foreground">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Instructions
                </h2>
                <ol className="space-y-4">
                  {instructions.map((instruction: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-2 hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0 shadow-sm">
                        {index + 1}
                      </div>
                      <span className="text-foreground pt-1">{instruction}</span>
                    </li>
                  ))}
                </ol>

                {/* Equipment Needed */}
                {recipe.equipment && recipe.equipment.length > 0 && (
                  <div className="mt-8 p-4 bg-secondary/20 rounded-lg border border-primary/10">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      Equipment Needed
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {recipe.equipment.map((item: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-foreground p-2 bg-white rounded-md shadow-sm"
                        >
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
            <div className="bg-card rounded-lg p-6 border border-primary/20 shadow-sm">
              <h3 className="text-xl font-bold text-primary mb-4">Nutrition Facts</h3>
              <p className="text-sm text-foreground/60 mb-4">Per serving</p>

              {recipe.nutritionalInfo && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(recipe.nutritionalInfo).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-center p-3 bg-secondary/30 rounded-lg border border-primary/10">
                      <p className="text-sm text-foreground/70 capitalize">{key}</p>
                      <p className="font-bold text-lg text-primary">{value || "N/A"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="py-6">
            <div className="space-y-6">
              {recipe.tips && recipe.tips.length > 0 && (
                <div className="bg-card rounded-lg p-6 border border-primary/20 shadow-sm">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Chef's Tips
                  </h3>
                  <ul className="space-y-3">
                    {recipe.tips.map((tip: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-2 hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                        <span className="text-foreground">{tip}</span>
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
                <div className="bg-card rounded-lg p-6 border border-primary/20 shadow-sm">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Allergen Information
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.allergenWarnings.map((allergen: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200 shadow-sm"
                      >
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
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 mx-6 my-6 rounded-lg p-6 border border-primary/20 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <ChefHat className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-primary">Ask ChefGPT</h2>
        </div>

        <AskChefGPT recipe={recipe} />

        <div className="mt-4 text-sm text-foreground/60 italic">
          <p>
            Example questions: "How can I make this recipe spicier?", "What can I substitute for butter?", "How do I
            know when it's properly cooked?"
          </p>
        </div>
      </div>
    </div>
  )
}
