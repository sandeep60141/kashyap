"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, ArrowUp, ArrowDown } from "lucide-react"

// Comprehensive list of cooking-related terms
const COOKING_TERMS = {
  ingredients: [
    "Chicken",
    "Beef",
    "Pork",
    "Salmon",
    "Tuna",
    "Shrimp",
    "Tofu",
    "Tempeh",
    "Rice",
    "Pasta",
    "Quinoa",
    "Couscous",
    "Potatoes",
    "Sweet Potatoes",
    "Carrots",
    "Onions",
    "Garlic",
    "Ginger",
    "Tomatoes",
    "Bell Peppers",
    "Spinach",
    "Kale",
    "Broccoli",
    "Cauliflower",
    "Zucchini",
    "Eggplant",
    "Mushrooms",
    "Avocado",
    "Lemon",
    "Lime",
    "Orange",
    "Berries",
    "Apples",
    "Bananas",
    "Flour",
    "Sugar",
    "Honey",
    "Maple Syrup",
    "Olive Oil",
    "Butter",
    "Cheese",
    "Milk",
    "Cream",
    "Yogurt",
    "Eggs",
    "Nuts",
    "Seeds",
    "Beans",
    "Lentils",
    "Chickpeas",
    "Herbs",
    "Spices",
    "Soy Sauce",
    "Vinegar",
    "Wine",
    "Chocolate",
  ],
  cuisines: [
    "Italian",
    "French",
    "Chinese",
    "Japanese",
    "Thai",
    "Indian",
    "Mexican",
    "Spanish",
    "Greek",
    "Mediterranean",
    "Middle Eastern",
    "Korean",
    "Vietnamese",
    "American",
    "Southern",
    "Cajun",
    "Creole",
    "Caribbean",
    "Brazilian",
    "Peruvian",
    "Moroccan",
    "Ethiopian",
    "Turkish",
    "Lebanese",
    "German",
    "British",
    "Irish",
    "Russian",
    "Scandinavian",
    "Filipino",
    "Indonesian",
    "Malaysian",
    "Fusion",
  ],
  dishTypes: [
    "Soup",
    "Stew",
    "Salad",
    "Sandwich",
    "Pasta",
    "Curry",
    "Stir-fry",
    "Roast",
    "Grill",
    "Bake",
    "Casserole",
    "Pie",
    "Tart",
    "Cake",
    "Cookie",
    "Bread",
    "Muffin",
    "Pancake",
    "Waffle",
    "Smoothie",
    "Juice",
    "Cocktail",
    "Appetizer",
    "Main Course",
    "Side Dish",
    "Dessert",
    "Breakfast",
    "Brunch",
    "Lunch",
    "Dinner",
    "Snack",
  ],
  cookingMethods: [
    "Bake",
    "Roast",
    "Grill",
    "Broil",
    "Sauté",
    "Fry",
    "Deep-fry",
    "Steam",
    "Boil",
    "Simmer",
    "Poach",
    "Braise",
    "Stew",
    "Blanch",
    "Marinate",
    "Pickle",
    "Ferment",
    "Smoke",
    "Cure",
    "Sous Vide",
    "Pressure Cook",
    "Slow Cook",
    "Air Fry",
    "Microwave",
  ],
  dietaryTerms: [
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Dairy-free",
    "Nut-free",
    "Soy-free",
    "Egg-free",
    "Keto",
    "Paleo",
    "Low-carb",
    "Low-fat",
    "High-protein",
    "Whole30",
    "Mediterranean Diet",
    "DASH Diet",
    "Pescatarian",
    "Flexitarian",
    "Raw",
    "Organic",
  ],
  popularDishes: [
    "Pizza",
    "Pasta",
    "Burger",
    "Taco",
    "Burrito",
    "Sushi",
    "Ramen",
    "Pho",
    "Curry",
    "Stir-fry",
    "Risotto",
    "Paella",
    "Lasagna",
    "Moussaka",
    "Biryani",
    "Pad Thai",
    "Butter Chicken",
    "Beef Wellington",
    "Coq au Vin",
    "Beef Bourguignon",
    "Chili",
    "Jambalaya",
    "Gumbo",
    "Falafel",
    "Hummus",
    "Shakshuka",
    "Tiramisu",
    "Cheesecake",
    "Chocolate Cake",
    "Apple Pie",
    "Crème Brûlée",
  ],
}

// Flatten all terms into a single array
const ALL_COOKING_TERMS = Object.values(COOKING_TERMS).flat()

export default function RecipeSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Update suggestions when search query changes
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase().trim()
      const filteredSuggestions = ALL_COOKING_TERMS.filter((term) => term.toLowerCase().includes(query)).slice(0, 8) // Limit to 8 suggestions

      setSuggestions(filteredSuggestions)
      setShowSuggestions(filteredSuggestions.length > 0)
      setSelectedSuggestionIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would search for recipes
    console.log("Searching for:", searchQuery)
    setShowSuggestions(false)
    alert(`Search functionality would look for: "${searchQuery}"`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard navigation for suggestions
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault()
        setSearchQuery(suggestions[selectedSuggestionIndex])
        setShowSuggestions(false)
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for recipes, ingredients, or cuisines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.trim().length > 1 && setSuggestions.length > 0 && setShowSuggestions(true)}
          className="pl-10 pr-20 py-6 text-base border-indigo-200 focus:border-indigo-500 rounded-full shadow-sm"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
          </Button>
          <Button type="submit" className="rounded-full">
            Search
          </Button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-2 text-xs text-gray-500 border-b">Suggested cooking terms:</div>
            <ul>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 flex items-center ${
                    index === selectedSuggestionIndex ? "bg-indigo-50 text-indigo-700" : ""
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <Search className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="flex-1">{suggestion}</span>
                  {index === selectedSuggestionIndex && (
                    <div className="flex items-center text-xs text-gray-500">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <ArrowDown className="h-3 w-3 mr-1" />
                      to navigate
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="p-2 text-xs text-gray-500 border-t">Press Enter to select or Escape to close</div>
          </div>
        )}
      </form>

      {showFilters && (
        <div className="mt-3 p-4 bg-white rounded-lg shadow-md border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Cuisine</label>
              <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="">Any</option>
                {COOKING_TERMS.cuisines.slice(0, 10).map((cuisine, index) => (
                  <option key={index} value={cuisine.toLowerCase()}>
                    {cuisine}
                  </option>
                ))}
                <option value="other">More...</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Meal Type</label>
              <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="">Any</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="dessert">Dessert</option>
                <option value="snack">Snack</option>
                <option value="appetizer">Appetizer</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Diet</label>
              <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="">Any</option>
                {COOKING_TERMS.dietaryTerms.slice(0, 8).map((diet, index) => (
                  <option key={index} value={diet.toLowerCase()}>
                    {diet}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Time</label>
              <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="">Any</option>
                <option value="15">Under 15 min</option>
                <option value="30">Under 30 min</option>
                <option value="60">Under 1 hour</option>
                <option value="120">Under 2 hours</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <Button variant="outline" size="sm" className="mr-2">
              Reset
            </Button>
            <Button size="sm">Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  )
}
