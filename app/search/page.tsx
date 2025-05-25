"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, ChevronLeft, Star, Utensils, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import RecipeSearch from "@/components/recipe-search"
import SearchHistory from "@/components/search-history"
import MealTypeFilters from "@/components/meal-type-filters"

// TheMealDB API types
interface MealDBRecipe {
  idMeal: string
  strMeal: string
  strDrinkAlternate?: string
  strCategory: string
  strArea: string
  strInstructions: string
  strMealThumb: string
  strTags?: string
  strYoutube?: string
  [key: string]: any // For dynamic ingredient properties
}

interface MealDBResponse {
  meals: MealDBRecipe[] | null
}

// Transform MealDB recipe to our format
const transformMealDBRecipe = (meal: MealDBRecipe) => {
  // Extract ingredients
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure?.trim() || ""} ${ingredient.trim()}`.trim())
    }
  }

  // Estimate cooking time based on instructions length
  const instructionLength = meal.strInstructions?.length || 0
  let estimatedTime = "30 mins"
  if (instructionLength < 500) estimatedTime = "15 mins"
  else if (instructionLength < 1000) estimatedTime = "30 mins"
  else if (instructionLength < 1500) estimatedTime = "45 mins"
  else estimatedTime = "1 hr+"

  // Determine difficulty based on ingredient count
  let difficulty = "Easy"
  if (ingredients.length > 10) difficulty = "Medium"
  if (ingredients.length > 15) difficulty = "Hard"

  return {
    id: Number.parseInt(meal.idMeal),
    title: meal.strMeal,
    image: meal.strMealThumb,
    description: meal.strInstructions?.substring(0, 120) + "..." || "Delicious recipe from TheMealDB",
    time: estimatedTime,
    difficulty,
    rating: (4.2 + Math.random() * 0.6).toFixed(1), // Random rating between 4.2-4.8
    tags: [meal.strCategory, meal.strArea, ...(meal.strTags?.split(",").map((tag) => tag.trim()) || [])]
      .filter(Boolean)
      .slice(0, 3),
    ingredients,
    instructions: meal.strInstructions,
    youtube: meal.strYoutube,
    source: meal.strSource,
  }
}

export default function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [mealTypeFilter, setMealTypeFilter] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMealTypeFilter = (mealType: string | null) => {
    setMealTypeFilter(mealType)
    // Filter results based on meal type
    if (mealType && results.length > 0) {
      const filtered = results.filter((recipe) =>
        recipe.tags.some((tag: string) => tag.toLowerCase().includes(mealType.toLowerCase())),
      )
      setResults(filtered)
    }
  }

  const fetchRecipes = async (searchQuery: string) => {
    setLoading(true)
    setError(null)

    try {
      let recipes: any[] = []

      if (searchQuery) {
        // Search by name
        const searchResponse = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchQuery)}`,
        )
        const searchData: MealDBResponse = await searchResponse.json()

        if (searchData.meals) {
          recipes = searchData.meals.map(transformMealDBRecipe)
        }
      } else {
        // Get random recipes for initial load
        const randomPromises = Array.from({ length: 12 }, () =>
          fetch("https://www.themealdb.com/api/json/v1/1/random.php")
            .then((res) => res.json())
            .then((data: MealDBResponse) => data.meals?.[0]),
        )

        const randomMeals = await Promise.all(randomPromises)
        recipes = randomMeals.filter(Boolean).map(transformMealDBRecipe)
      }

      setResults(recipes)
    } catch (err) {
      console.error("Error fetching recipes:", err)
      setError("Failed to fetch recipes. Please try again.")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const loadMoreRandomRecipes = async () => {
    setLoading(true)
    try {
      const randomPromises = Array.from({ length: 6 }, () =>
        fetch("https://www.themealdb.com/api/json/v1/1/random.php")
          .then((res) => res.json())
          .then((data: MealDBResponse) => data.meals?.[0]),
      )

      const randomMeals = await Promise.all(randomPromises)
      const newRecipes = randomMeals.filter(Boolean).map(transformMealDBRecipe)

      setResults((prev) => [...prev, ...newRecipes])
    } catch (err) {
      console.error("Error loading more recipes:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecipes(query)
  }, [query])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {query ? `Search Results for "${query}"` : "Discover Recipes"}
        </h1>
        <p className="text-gray-600">
          {results.length} {results.length === 1 ? "recipe" : "recipes"} found
          {!query && " • Powered by TheMealDB"}
        </p>
      </div>

      <div className="mb-8">
        <RecipeSearch />
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by meal type:</h3>
          <MealTypeFilters onFilterChange={handleMealTypeFilter} />
        </div>
        <SearchHistory />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" className="mt-2" onClick={() => fetchRecipes(query)}>
            Try Again
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 hover:text-indigo-800 p-0 h-auto"
                onClick={() => fetchRecipes(query)}
              >
                Reset
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => fetchRecipes("")}>
                    Show Random Recipes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => fetchRecipes("chicken")}
                  >
                    Chicken Recipes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => fetchRecipes("pasta")}
                  >
                    Pasta Recipes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => fetchRecipes("dessert")}
                  >
                    Desserts
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Cuisines</h3>
                <div className="space-y-2">
                  {["Italian", "Chinese", "Indian", "Mexican", "Thai"].map((cuisine) => (
                    <Button
                      key={cuisine}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => fetchRecipes(cuisine)}
                    >
                      {cuisine}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results grid */}
        <div className="flex-1">
          {loading && results.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between mb-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((recipe) => (
                  <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=300&width=400&query=recipe"
                        }}
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {recipe.tags.slice(0, 2).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-500/80 text-white rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-1">{recipe.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{recipe.time}</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Utensils className="h-4 w-4 mr-1" />
                          <span>{recipe.difficulty}</span>
                        </div>
                        <div className="flex items-center text-amber-500 text-sm">
                          <Star className="h-4 w-4 mr-1 fill-amber-500" />
                          <span>{recipe.rating}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-indigo-500 hover:bg-indigo-600"
                          onClick={() => setSelectedRecipe(recipe)}
                        >
                          View Recipe
                        </Button>
                        {recipe.youtube && (
                          <Button variant="outline" size="sm" onClick={() => window.open(recipe.youtube, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {!query && (
                <div className="text-center mt-8">
                  <Button variant="outline" onClick={loadMoreRandomRecipes} disabled={loading} className="px-8">
                    {loading ? "Loading..." : "Load More Recipes"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
              <p className="text-gray-600 mb-4">
                {query
                  ? `We couldn't find any recipes matching "${query}". Try different keywords.`
                  : "Unable to load recipes at the moment."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
                <Button onClick={() => fetchRecipes("")}>Load Random Recipes</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRecipe.title}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecipe(null)}>
                  ✕
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Image
                    src={selectedRecipe.image || "/placeholder.svg"}
                    alt={selectedRecipe.title}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-lg"
                  />

                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Ingredients:</h3>
                    <ul className="space-y-1 text-sm">
                      {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{selectedRecipe.time}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Utensils className="h-4 w-4 mr-1" />
                      <span>{selectedRecipe.difficulty}</span>
                    </div>
                    <div className="flex items-center text-amber-500 text-sm">
                      <Star className="h-4 w-4 mr-1 fill-amber-500" />
                      <span>{selectedRecipe.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2">Instructions:</h3>
                  <div className="text-sm text-gray-700 leading-relaxed">{selectedRecipe.instructions}</div>

                  <div className="flex gap-2 mt-6">
                    {selectedRecipe.youtube && (
                      <Button onClick={() => window.open(selectedRecipe.youtube, "_blank")} className="flex-1">
                        Watch Video
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setSelectedRecipe(null)} className="flex-1">
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
