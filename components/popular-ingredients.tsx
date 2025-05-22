"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PopularIngredientsProps {
  onIngredientClick: (ingredient: string) => void
  selectedIngredients?: string[]
  type?: "pantry" | "cocktail" | "general"
}

export default function PopularIngredients({
  onIngredientClick,
  selectedIngredients = [],
  type = "general",
}: PopularIngredientsProps) {
  const ingredientSets = {
    pantry: [
      "Chicken breast",
      "Ground beef",
      "Salmon",
      "Eggs",
      "Rice",
      "Pasta",
      "Potatoes",
      "Onions",
      "Garlic",
      "Tomatoes",
      "Bell peppers",
      "Carrots",
      "Broccoli",
      "Spinach",
      "Cheese",
      "Olive oil",
      "Butter",
      "Salt",
      "Black pepper",
      "Paprika",
      "Cumin",
      "Oregano",
      "Basil",
    ],
    cocktail: [
      "Vodka",
      "Gin",
      "Rum",
      "Whiskey",
      "Tequila",
      "Lime juice",
      "Lemon juice",
      "Simple syrup",
      "Triple sec",
      "Cointreau",
      "Vermouth",
      "Bitters",
      "Mint",
      "Basil",
      "Cranberry juice",
      "Orange juice",
      "Pineapple juice",
      "Ginger beer",
      "Soda water",
      "Tonic water",
    ],
    general: [
      "Chicken",
      "Beef",
      "Fish",
      "Eggs",
      "Rice",
      "Pasta",
      "Potatoes",
      "Onions",
      "Garlic",
      "Tomatoes",
      "Cheese",
      "Olive oil",
      "Butter",
      "Salt",
      "Pepper",
      "Herbs",
      "Spices",
    ],
  }

  const ingredients = ingredientSets[type]

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-primary">
        Popular {type === "cocktail" ? "Ingredients" : "Ingredients"}
      </h4>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient) => {
          const isSelected = selectedIngredients.some((selected) =>
            selected.toLowerCase().includes(ingredient.toLowerCase()),
          )

          return (
            <Button
              key={ingredient}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onIngredientClick(ingredient)}
              className={`text-xs ${
                isSelected ? "bg-primary text-white" : "border-primary/30 text-primary hover:bg-primary/10"
              }`}
            >
              <Plus className="h-3 w-3 mr-1" />
              {ingredient}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
