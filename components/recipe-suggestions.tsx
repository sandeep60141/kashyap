"use client"

import { Button } from "@/components/ui/button"
import { Lightbulb, ChefHat, Clock, Heart, Zap } from "lucide-react"

interface RecipeSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
  type?: "general" | "healthy" | "quick" | "comfort"
}

export default function RecipeSuggestions({ onSuggestionClick, type = "general" }: RecipeSuggestionsProps) {
  const suggestionSets = {
    general: [
      { name: "Creamy Garlic Parmesan Pasta", icon: <ChefHat className="h-3 w-3" /> },
      { name: "Honey Glazed Salmon with Vegetables", icon: <ChefHat className="h-3 w-3" /> },
      { name: "Classic Beef Stir Fry", icon: <ChefHat className="h-3 w-3" /> },
      { name: "Chicken Caesar Salad", icon: <ChefHat className="h-3 w-3" /> },
      { name: "Vegetarian Buddha Bowl", icon: <ChefHat className="h-3 w-3" /> },
      { name: "Spicy Thai Curry", icon: <ChefHat className="h-3 w-3" /> },
    ],
    healthy: [
      { name: "Quinoa Power Bowl with Avocado", icon: <Heart className="h-3 w-3" /> },
      { name: "Grilled Chicken with Sweet Potato", icon: <Heart className="h-3 w-3" /> },
      { name: "Mediterranean Chickpea Salad", icon: <Heart className="h-3 w-3" /> },
      { name: "Zucchini Noodles with Pesto", icon: <Heart className="h-3 w-3" /> },
      { name: "Baked Cod with Herbs", icon: <Heart className="h-3 w-3" /> },
      { name: "Green Smoothie Bowl", icon: <Heart className="h-3 w-3" /> },
    ],
    quick: [
      { name: "15-Minute Pasta Aglio e Olio", icon: <Clock className="h-3 w-3" /> },
      { name: "Quick Chicken Quesadillas", icon: <Clock className="h-3 w-3" /> },
      { name: "5-Minute Avocado Toast", icon: <Clock className="h-3 w-3" /> },
      { name: "Instant Ramen Upgrade", icon: <Clock className="h-3 w-3" /> },
      { name: "Microwave Mug Omelet", icon: <Clock className="h-3 w-3" /> },
      { name: "No-Cook Greek Salad", icon: <Clock className="h-3 w-3" /> },
    ],
    comfort: [
      { name: "Classic Mac and Cheese", icon: <Zap className="h-3 w-3" /> },
      { name: "Homemade Chicken Soup", icon: <Zap className="h-3 w-3" /> },
      { name: "Beef and Mushroom Stew", icon: <Zap className="h-3 w-3" /> },
      { name: "Loaded Baked Potato", icon: <Zap className="h-3 w-3" /> },
      { name: "Grilled Cheese and Tomato Soup", icon: <Zap className="h-3 w-3" /> },
      { name: "Chocolate Chip Cookies", icon: <Zap className="h-3 w-3" /> },
    ],
  }

  const suggestions = suggestionSets[type]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-accent" />
        <h4 className="text-sm font-medium text-primary">Recipe Ideas</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.name}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion.name)}
            className="text-xs text-left justify-start border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-2"
          >
            <span className="text-primary">{suggestion.icon}</span>
            {suggestion.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
