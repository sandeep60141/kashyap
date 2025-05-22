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
  Shield,
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
  const [error, setError] = useState<string | null>(null)

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

      // Ensure food safety tips exist - add defaults if missing
      if (
        !parsedRecipe.foodSafetyTips ||
        !Array.isArray(parsedRecipe.foodSafetyTips) ||
        parsedRecipe.foodSafetyTips.length === 0
      ) {
        parsedRecipe.foodSafetyTips = [
          "Always wash hands thoroughly before handling food",
          "Cook proteins to safe internal temperatures",
          "Store leftovers in refrigerator within 2 hours",
          "Use separate cutting boards for raw meat and vegetables",
          "Keep hot foods hot (above 140°F) and cold foods cold (below 40°F)",
        ]
      }

      setRecipe(parsedRecipe)
    } catch (e) {
      console.error("Error parsing recipe:", e)
      setError("There was an error loading the recipe. Please try generating a new one.")

      // If it's not JSON, use it as a string with default safety tips
      try {
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
          foodSafetyTips: [
            "Always wash hands thoroughly before handling food",
            "Cook proteins to safe internal temperatures",
            "Store leftovers in refrigerator within 2 hours",
            "Use separate cutting boards for raw meat and vegetables",
          ],
          nutritionalInfo: {
            calories: "N/A",
            protein: "N/A",
            carbs: "N/A",
            fat: "N/A",
          },
        })
      } catch (err) {
        console.error("Failed to create fallback recipe:", err)
      }
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
        .map((ing: string) => ({ name: ing, amount: "", checked: false }))
    }

    // If ingredients is an array of strings, convert to objects
    if (Array.isArray(ingredients)) {
      return ingredients.map((ing: any) => {
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
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 mb-8 border-2 border-primary/20 shadow-md relative overflow-hidden">
        {/* Generator Badge */}
        <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-bl-lg font-medium flex items-center gap-2 shadow-md">
          {generator.icon}
          <span>{generator.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-primary mb-3">{recipe.title}</h1>
            <p className="text-lg text-foreground/80 mb-4">{recipe.description}</p>

            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => setShowCookingMode(true)}
                className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2 shadow-md"
              >
                <Play className="h-4 w-4" />
                Start Cooking Mode
              </Button>

              {dietaryTags.length > 0 && (
                <div className="flex gap-2">
                  {dietaryTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200 shadow-sm"
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
        {[
          { label: "Prep Time", value: recipe.prepTime || "15", icon: <Clock className="h-5 w-5 text-primary" /> },
          { label: "Cook Time", value: recipe.cookTime || "20", icon: <Clock className="h-5 w-5 text-primary" /> },
          { label: "Total Time", value: recipe.totalTime || "35", icon: <Clock className="h-5 w-5 text-primary" /> },
          { label: "Servings", value: recipe.servings || "4", icon: <Users className="h-5 w-5 text-primary" /> },
          {
            label: "Difficulty",
            value: recipe.difficulty || "Medium",
            icon: <ChefHat className="h-5 w-5 text-primary" />,
          },
          {
            label: "Cost",
            value: recipe.costEstimate || "Moderate",
            icon: <DollarSign className="h-5 w-5 text-primary" />,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary/20 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-primary/10 rounded-full">{stat.icon}</div>
            <div>
              <div className="text-sm text-foreground/60">{stat.label}</div>
              <div className="font-semibold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Food Safety Alert - Always Visible */}
      {recipe.foodSafetyTips && Array.isArray(recipe.foodSafetyTips) && recipe.foodSafetyTips.length > 0 && (
        <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 border-t border-r border-b border-red-200 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-red-800">Important Food Safety Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipe.foodSafetyTips.map((tip: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="recipe" className="mb-8">
        <TabsList className="mb-6 bg-secondary/50 p-1 rounded-lg border border-primary/20">
          <TabsTrigger
            value="recipe"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
          >
            Recipe
          </TabsTrigger>
          <TabsTrigger
            value="nutrition"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
          >
            Nutrition
          </TabsTrigger>
          <TabsTrigger
            value="tips"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
          >
            Tips
          </TabsTrigger>
          <TabsTrigger
            value="extras"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
          >
            Extras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Ingredients
              </h2>
              <ul className="space-y-3">
                {ingredientsList.map((ingredient: any, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-2 hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      {typeof ingredient === "string"
                        ? ingredient
                        : `${ingredient.amount ? `${ingredient.amount} ` : ""}${ingredient.name}`}
                      {ingredient.allergens && ingredient.allergens.length > 0 && (
                        <span className="text-red-500 text-sm ml-2">(Contains: {ingredient.allergens.join(", ")})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Instructions
              </h2>
              <ol className="space-y-4">
                {Array.isArray(recipe.instructions) ? (
                  recipe.instructions.map((instruction: any, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-2 hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <span className="text-foreground">
                          {typeof instruction === "string"
                            ? instruction
                            : instruction.description || instruction.step || ""}
                        </span>
                        {instruction.safetyTip && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-700">{instruction.safetyTip}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))
                ) : typeof recipe.instructions === "string" ? (
                  recipe.instructions
                    .split("\n")
                    .filter(Boolean)
                    .map((instruction: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-2 hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium shadow-sm">
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
              {recipe.equipment && Array.isArray(recipe.equipment) && recipe.equipment.length > 0 && (
                <div className="mt-8 p-4 bg-secondary/20 rounded-lg border border-primary/10">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Equipment Needed</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {recipe.equipment.map((item: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-foreground/80 p-2 bg-white rounded-md shadow-sm"
                      >
                        <Utensils className="h-4 w-4 text-primary" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nutrition">
          <div className="nutrition-tab border-2 border-primary/20 shadow-md">
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
            {recipe.tips && Array.isArray(recipe.tips) && recipe.tips.length > 0 && (
              <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-md">
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
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

            {recipe.storage && (
              <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-md">
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full"></span>
                  Storage Instructions
                </h3>
                <p className="text-foreground bg-secondary/30 p-4 rounded-lg">{recipe.storage}</p>
              </div>
            )}

            {recipe.reheating && (
              <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-md">
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full"></span>
                  Reheating Instructions
                </h3>
                <p className="text-foreground bg-secondary/30 p-4 rounded-lg">{recipe.reheating}</p>
              </div>
            )}

            {recipe.pairingRecommendations && (
              <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-md">
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full"></span>
                  Pairing Recommendations
                </h3>
                <p className="text-foreground bg-secondary/30 p-4 rounded-lg">{recipe.pairingRecommendations}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="extras">
          <div className="space-y-6">
            {recipe.allergenWarnings &&
              Array.isArray(recipe.allergenWarnings) &&
              recipe.allergenWarnings.length > 0 && (
                <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
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

            {recipe.dietaryClassifications &&
              Array.isArray(recipe.dietaryClassifications) &&
              recipe.dietaryClassifications.length > 0 && (
                <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Dietary Classifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.dietaryClassifications.map((classification: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200 shadow-sm"
                      >
                        {classification}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Recipe Scaling */}
            <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                Recipe Scaling
              </h3>
              <p className="text-foreground/80 mb-4">
                This recipe serves {recipe.servings || "4"} people. Adjust quantities proportionally for different
                serving sizes.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-secondary/30 rounded-lg border border-primary/10 shadow-sm">
                  <div className="font-semibold">Half Recipe</div>
                  <div className="text-sm text-foreground/70">
                    {Math.ceil((Number.parseInt(recipe.servings) || 4) / 2)} servings
                  </div>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg border-2 border-primary/30 shadow-sm">
                  <div className="font-semibold text-primary">Original</div>
                  <div className="text-sm text-primary/70">{recipe.servings || "4"} servings</div>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded-lg border border-primary/10 shadow-sm">
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
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border-2 border-primary/20 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <ChefHat className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-primary">Ask ChefGPT</h2>
        </div>

        <AskChefGPT recipe={recipe} />
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
