"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { parseRecipeData } from "@/lib/recipe-helpers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Clock, Users, ChefHat, AlertTriangle, ArrowLeft, DollarSign, Utensils } from "lucide-react"
import { PDFGenerator } from "@/components/pdf-generator"
import { ShoppingListGenerator } from "@/components/shopping-list-generator"
import { CopyRecipeLink } from "@/components/copy-recipe-link"
import { AskChefGPT } from "@/components/ask-chef-gpt"
import { MealTypeFilters } from "@/components/meal-type-filters"

export default function RecipeResultPage() {
  const router = useRouter()
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCookingMode, setShowCookingMode] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get the recipe from localStorage
    const storedRecipe = localStorage.getItem("generatedRecipe")

    // Use our helper function to safely parse the recipe
    const parsedRecipe = parseRecipeData(storedRecipe)

    if (parsedRecipe) {
      setRecipe(parsedRecipe)
    } else {
      // If no recipe is found, redirect to home
      router.push("/")
    }

    setLoading(false)
  }, [router])

  const handleSave = () => {
    setIsSaved(!isSaved)
    // In a real app, this would save to a database
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title || "Recipe",
        text: recipe?.description || "Check out this recipe!",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Recipe</h1>
        <p className="mb-6 text-red-600">{error}</p>
        <Button onClick={() => router.push("/pantryChef")}>Create New Recipe</Button>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No recipe found. Please try generating a new recipe.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/")} variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  // Extract ingredients from the recipe safely
  const extractIngredients = () => {
    if (!recipe || !recipe.ingredients) return []

    const ingredients = recipe.ingredients

    // If ingredients is a string, convert it to an array of objects
    if (typeof ingredients === "string") {
      return ingredients
        .split("\n")
        .filter(Boolean)
        .map((ing: string) => ({ name: ing.trim(), amount: "", checked: false }))
    }

    // If ingredients is an array of strings, convert to objects
    if (Array.isArray(ingredients)) {
      return ingredients.map((ing: any) => {
        if (typeof ing === "string") {
          return { name: ing.trim(), amount: "", checked: false }
        }
        return {
          name: ing.name || ing.ingredient || "Unknown ingredient",
          amount: ing.amount || ing.quantity || "",
          checked: false,
        }
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

  // Determine which tool generated this recipe
  const determineGenerator = () => {
    if (recipe.days && Array.isArray(recipe.days)) {
      return {
        name: "MealPlanChef",
        icon: <Clock className="h-5 w-5" />,
        color: "from-green-500 to-green-600",
      }
    } else if (recipe.pairing || recipe.pairingNotes) {
      return {
        name: "PairPerfect",
        icon: <Utensils className="h-5 w-5" />,
        color: "from-purple-500 to-purple-600",
      }
    } else if (recipe.mixingTechnique || recipe.glassware) {
      return {
        name: "MixologyMaestro",
        icon: <DollarSign className="h-5 w-5" />,
        color: "from-blue-500 to-blue-600",
      }
    } else if (recipe.macros || (recipe.nutritionalInfo && recipe.nutritionalInfo.protein)) {
      return {
        name: "MacrosChef",
        icon: <Users className="h-5 w-5" />,
        color: "from-orange-500 to-orange-600",
      }
    } else if (recipe.cuisine) {
      return {
        name: "MasterChef",
        icon: <ChefHat className="h-5 w-5" />,
        color: "from-primary to-accent",
      }
    } else {
      return {
        name: "PantryChef",
        icon: <Utensils className="h-5 w-5" />,
        color: "from-primary to-accent",
      }
    }
  }

  const generator = determineGenerator()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      {/* Food Safety Alert - Always visible */}
      {recipe.foodSafetyTips && Array.isArray(recipe.foodSafetyTips) && recipe.foodSafetyTips.length > 0 && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-700 font-bold">Food Safety Tips</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              {recipe.foodSafetyTips.map((tip: string, index: number) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 rounded-lg mb-6 shadow-md">
        <h1 className="text-3xl font-bold text-primary mb-2">{recipe.title || "Recipe"}</h1>
        <p className="text-foreground/80">{recipe.description || "A delicious recipe"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center justify-center flex-col text-center border-primary/20">
          <Clock className="h-6 w-6 text-primary mb-2" />
          <p className="text-sm text-foreground/70">Prep Time</p>
          <p className="font-bold">{recipe.prepTime || "N/A"}</p>
        </Card>
        <Card className="p-4 flex items-center justify-center flex-col text-center border-primary/20">
          <Clock className="h-6 w-6 text-primary mb-2" />
          <p className="text-sm text-foreground/70">Cook Time</p>
          <p className="font-bold">{recipe.cookTime || "N/A"}</p>
        </Card>
        <Card className="p-4 flex items-center justify-center flex-col text-center border-primary/20">
          <Users className="h-6 w-6 text-primary mb-2" />
          <p className="text-sm text-foreground/70">Servings</p>
          <p className="font-bold">{recipe.servings || "N/A"}</p>
        </Card>
        <Card className="p-4 flex items-center justify-center flex-col text-center border-primary/20">
          <ChefHat className="h-6 w-6 text-primary mb-2" />
          <p className="text-sm text-foreground/70">Difficulty</p>
          <p className="font-bold">{recipe.difficulty || "N/A"}</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <PDFGenerator recipe={recipe} />
        <ShoppingListGenerator ingredients={ingredientsList} recipeName={recipe.title || "Recipe"} />
        <CopyRecipeLink recipe={recipe} />
        <MealTypeFilters />
      </div>

      <Tabs defaultValue="ingredients" className="w-full mb-6">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="ingredients" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Ingredients
          </TabsTrigger>
          <TabsTrigger value="instructions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <ChefHat className="h-4 w-4 mr-2" />
            Instructions
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="space-y-4">
          <Card className="p-6 border-primary/20">
            <h2 className="text-xl font-bold text-primary mb-4">Ingredients</h2>
            <ul className="list-disc pl-5 space-y-2">
              {ingredientsList.length > 0 ? (
                ingredientsList.map((ingredient: any, index: number) => (
                  <li key={index} className="text-foreground/90">
                    {typeof ingredient === "string"
                      ? ingredient
                      : `${ingredient.amount ? ingredient.amount + " " : ""}${ingredient.name}`}
                  </li>
                ))
              ) : (
                <li className="text-foreground/60">No ingredients found</li>
              )}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card className="p-6 border-primary/20">
            <h2 className="text-xl font-bold text-primary mb-4">Instructions</h2>
            <ol className="list-decimal pl-5 space-y-4">
              {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
                recipe.instructions.map((instruction: string, index: number) => (
                  <li key={index} className="text-foreground/90">
                    {instruction}
                  </li>
                ))
              ) : (
                <li className="text-foreground/60">No instructions found</li>
              )}
            </ol>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card className="p-6 border-primary/20">
            <h2 className="text-xl font-bold text-primary mb-4">Equipment Needed</h2>
            <ul className="list-disc pl-5 space-y-2">
              {Array.isArray(recipe.equipment) && recipe.equipment.length > 0 ? (
                recipe.equipment.map((item: string, index: number) => (
                  <li key={index} className="text-foreground/90">
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-foreground/60">No special equipment needed</li>
              )}
            </ul>
          </Card>

          {recipe.nutritionalInfo && (
            <Card className="p-6 border-primary/20">
              <h2 className="text-xl font-bold text-primary mb-4">Nutritional Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(recipe.nutritionalInfo).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center p-2 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-foreground/70 capitalize">{key}</p>
                    <p className="font-bold">{value || "N/A"}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {recipe.tips && Array.isArray(recipe.tips) && recipe.tips.length > 0 && (
            <Card className="p-6 border-primary/20">
              <h2 className="text-xl font-bold text-primary mb-4">Chef's Tips</h2>
              <ul className="list-disc pl-5 space-y-2">
                {recipe.tips.map((tip: string, index: number) => (
                  <li key={index} className="text-foreground/90">
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {(recipe.storage || recipe.reheating) && (
            <Card className="p-6 border-primary/20">
              <h2 className="text-xl font-bold text-primary mb-4">Storage & Reheating</h2>
              <div className="space-y-4">
                {recipe.storage && (
                  <div>
                    <h3 className="font-semibold text-primary">Storage</h3>
                    <p className="text-foreground/90">{recipe.storage}</p>
                  </div>
                )}
                {recipe.reheating && (
                  <div>
                    <h3 className="font-semibold text-primary">Reheating</h3>
                    <p className="text-foreground/90">{recipe.reheating}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <AskChefGPT recipe={recipe} />
    </div>
  )
}
