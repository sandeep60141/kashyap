"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, ChevronLeft, Star, Utensils, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import RecipeSearch from "@/components/recipe-search"
import SearchHistory from "@/components/search-history"
import MealTypeFilters from "@/components/meal-type-filters"

// Mock data for search results
const MOCK_RECIPES = [
  {
    id: 1,
    title: "Creamy Garlic Parmesan Pasta",
    image: "/creamy-garlic-parmesan-pasta.png",
    description: "A rich and creamy pasta dish with garlic and parmesan cheese.",
    time: "25 mins",
    difficulty: "Easy",
    rating: 4.7,
    tags: ["Pasta", "Italian", "Vegetarian"],
  },
  {
    id: 2,
    title: "Spicy Thai Basil Chicken",
    image: "/spicy-thai-basil-chicken.png",
    description: "A flavorful Thai dish with chicken, basil, and chili peppers.",
    time: "30 mins",
    difficulty: "Medium",
    rating: 4.8,
    tags: ["Thai", "Chicken", "Spicy"],
  },
  {
    id: 3,
    title: "Classic Beef Lasagna",
    image: "/beef-lasagna.png",
    description: "Layers of pasta, beef, tomato sauce, and cheese baked to perfection.",
    time: "1 hr 15 mins",
    difficulty: "Medium",
    rating: 4.9,
    tags: ["Italian", "Beef", "Pasta"],
  },
  {
    id: 4,
    title: "Vegetable Stir Fry with Tofu",
    image: "/placeholder-oo2pl.png",
    description: "A quick and healthy stir fry with colorful vegetables and tofu.",
    time: "20 mins",
    difficulty: "Easy",
    rating: 4.5,
    tags: ["Vegetarian", "Asian", "Healthy"],
  },
  {
    id: 5,
    title: "Homemade Margherita Pizza",
    image: "/placeholder.svg?height=300&width=400&query=margherita%20pizza",
    description: "A classic pizza with tomato sauce, fresh mozzarella, and basil.",
    time: "45 mins",
    difficulty: "Medium",
    rating: 4.6,
    tags: ["Italian", "Pizza", "Vegetarian"],
  },
  {
    id: 6,
    title: "Chocolate Chip Cookies",
    image: "/placeholder.svg?height=300&width=400&query=chocolate%20chip%20cookies",
    description: "Soft and chewy cookies with chocolate chips.",
    time: "30 mins",
    difficulty: "Easy",
    rating: 4.8,
    tags: ["Dessert", "Baking", "Sweet"],
  },
]

export default function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<typeof MOCK_RECIPES>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [mealTypeFilter, setMealTypeFilter] = useState<string | null>(null)

  const handleMealTypeFilter = (mealType: string | null) => {
    setMealTypeFilter(mealType)
    // In a real app, this would filter the results based on meal type
    console.log("Filtering by meal type:", mealType)
  }

  useEffect(() => {
    // Simulate API call with a delay
    setLoading(true)
    const timer = setTimeout(() => {
      if (query) {
        // Filter mock recipes based on query
        const filteredResults = MOCK_RECIPES.filter(
          (recipe) =>
            recipe.title.toLowerCase().includes(query.toLowerCase()) ||
            recipe.description.toLowerCase().includes(query.toLowerCase()) ||
            recipe.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
        )
        setResults(filteredResults)
      } else {
        setResults(MOCK_RECIPES)
      }
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {query ? `Search Results for "${query}"` : "All Recipes"}
        </h1>
        <p className="text-gray-600">
          {results.length} {results.length === 1 ? "recipe" : "recipes"} found
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

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Filters</h2>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 p-0 h-auto">
                Reset
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Meal Type</h3>
                <div className="space-y-2">
                  {["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"].map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`meal-${type.toLowerCase()}`}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`meal-${type.toLowerCase()}`} className="ml-2 text-sm text-gray-600">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cuisine</h3>
                <div className="space-y-2">
                  {["Italian", "Asian", "Mexican", "American", "Mediterranean"].map((cuisine) => (
                    <div key={cuisine} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cuisine-${cuisine.toLowerCase()}`}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`cuisine-${cuisine.toLowerCase()}`} className="ml-2 text-sm text-gray-600">
                        {cuisine}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cooking Time</h3>
                <div className="space-y-2">
                  {["Under 15 min", "Under 30 min", "Under 1 hour", "Over 1 hour"].map((time) => (
                    <div key={time} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`time-${time.replace(/\s+/g, "-").toLowerCase()}`}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`time-${time.replace(/\s+/g, "-").toLowerCase()}`}
                        className="ml-2 text-sm text-gray-600"
                      >
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Dietary</h3>
                <div className="space-y-2">
                  {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto"].map((diet) => (
                    <div key={diet} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`diet-${diet.toLowerCase()}`}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`diet-${diet.toLowerCase()}`} className="ml-2 text-sm text-gray-600">
                        {diet}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button className="w-full mt-6">Apply Filters</Button>
          </div>
        </div>

        {/* Mobile filters button */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          {showFilters && (
            <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Mobile filters content - simplified version */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Meal Type</h3>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="">Any</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="dessert">Dessert</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Cuisine</h3>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="">Any</option>
                    <option value="italian">Italian</option>
                    <option value="asian">Asian</option>
                    <option value="mexican">Mexican</option>
                    <option value="american">American</option>
                    <option value="mediterranean">Mediterranean</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Cooking Time</h3>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="">Any</option>
                    <option value="15">Under 15 min</option>
                    <option value="30">Under 30 min</option>
                    <option value="60">Under 1 hour</option>
                    <option value="61">Over 1 hour</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Dietary</h3>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="">Any</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-Free</option>
                    <option value="dairy-free">Dairy-Free</option>
                    <option value="keto">Keto</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1">
                  Reset
                </Button>
                <Button className="flex-1">Apply</Button>
              </div>
            </div>
          )}
        </div>

        {/* Results grid */}
        <div className="flex-1">
          {loading ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {recipe.tags.slice(0, 2).map((tag, index) => (
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
                    <h3 className="font-bold text-lg mb-2 text-gray-800">{recipe.title}</h3>
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
                    <Button className="w-full bg-indigo-500 hover:bg-indigo-600">View Recipe</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any recipes matching "{query}". Try different keywords or filters.
              </p>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
