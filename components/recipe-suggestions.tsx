"use client"

import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"

interface RecipeSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
  type?: "general" | "healthy" | "quick" | "comfort"
}

export default function RecipeSuggestions({ onSuggestionClick, type = "general" }: RecipeSuggestionsProps) {
  const suggestionSets = {
    general: [
      "Creamy Garlic Parmesan Pasta",
      "Honey Glazed Salmon with Vegetables",
      "Classic Beef Stir Fry",
      "Chicken Caesar Salad",
      "Vegetarian Buddha Bowl",
      "Spicy Thai Curry",
    ],
    healthy: [
      "Quinoa Power Bowl with Avocado",
      "Grilled Chicken with Sweet Potato",
      "Mediterranean Chickpea Salad",
      "Zucchini Noodles with Pesto",
      "Baked Cod with Herbs",
      "Green Smoothie Bowl",
    ],
    quick: [
      "15-Minute Pasta Aglio e Olio",
      "Quick Chicken Quesadillas",
      "5-Minute Avocado Toast",
      "Instant Ramen Upgrade",
      "Microwave Mug Omelet",
      "No-Cook Greek Salad",
    ],
    comfort: [
      "Classic Mac and Cheese",
      "Homemade Chicken Soup",
      "Beef and Mushroom Stew",
      "Loaded Baked Potato",
      "Grilled Cheese and Tomato Soup",
      "Chocolate Chip Cookies",
    ],
  }

  const suggestions = suggestionSets[type]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-medium text-primary">Recipe Ideas</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="text-xs text-left justify-start border-primary/30 text-primary hover:bg-primary/10"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  )
}
