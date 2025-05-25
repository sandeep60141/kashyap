"use client"

import { Button } from "@/components/ui/button"
import { Plus, Beef, Fish, Egg, Wheat, Carrot, Milk, Droplets, Grape } from "lucide-react"

interface PopularIngredientsProps {
  onIngredientClick: (ingredient: string) => void
  selectedIngredients?: string[]
  type?: "pantry" | "cocktail" | "general"
}

export function PopularIngredients({
  onIngredientClick,
  selectedIngredients = [],
  type = "general",
}: PopularIngredientsProps) {
  const ingredientSets = {
    pantry: [
      { name: "Chicken breast", icon: <Beef className="h-3 w-3" /> },
      { name: "Ground beef", icon: <Beef className="h-3 w-3" /> },
      { name: "Salmon", icon: <Fish className="h-3 w-3" /> },
      { name: "Eggs", icon: <Egg className="h-3 w-3" /> },
      { name: "Rice", icon: <Wheat className="h-3 w-3" /> },
      { name: "Pasta", icon: <Wheat className="h-3 w-3" /> },
      { name: "Potatoes", icon: <Carrot className="h-3 w-3" /> },
      { name: "Onions", icon: <Carrot className="h-3 w-3" /> },
      { name: "Garlic", icon: <Carrot className="h-3 w-3" /> },
      { name: "Tomatoes", icon: <Carrot className="h-3 w-3" /> },
      { name: "Bell peppers", icon: <Carrot className="h-3 w-3" /> },
      { name: "Carrots", icon: <Carrot className="h-3 w-3" /> },
      { name: "Broccoli", icon: <Carrot className="h-3 w-3" /> },
      { name: "Spinach", icon: <Carrot className="h-3 w-3" /> },
      { name: "Cheese", icon: <Milk className="h-3 w-3" /> },
      { name: "Olive oil", icon: <Droplets className="h-3 w-3" /> },
      { name: "Butter", icon: <Milk className="h-3 w-3" /> },
    ],
    cocktail: [
      { name: "Vodka", icon: <Droplets className="h-3 w-3" /> },
      { name: "Gin", icon: <Droplets className="h-3 w-3" /> },
      { name: "Rum", icon: <Droplets className="h-3 w-3" /> },
      { name: "Whiskey", icon: <Droplets className="h-3 w-3" /> },
      { name: "Tequila", icon: <Droplets className="h-3 w-3" /> },
      { name: "Lime juice", icon: <Grape className="h-3 w-3" /> },
      { name: "Lemon juice", icon: <Grape className="h-3 w-3" /> },
      { name: "Simple syrup", icon: <Droplets className="h-3 w-3" /> },
      { name: "Triple sec", icon: <Droplets className="h-3 w-3" /> },
      { name: "Cointreau", icon: <Droplets className="h-3 w-3" /> },
      { name: "Vermouth", icon: <Droplets className="h-3 w-3" /> },
      { name: "Bitters", icon: <Droplets className="h-3 w-3" /> },
      { name: "Cranberry juice", icon: <Grape className="h-3 w-3" /> },
      { name: "Orange juice", icon: <Grape className="h-3 w-3" /> },
      { name: "Pineapple juice", icon: <Grape className="h-3 w-3" /> },
      { name: "Ginger beer", icon: <Droplets className="h-3 w-3" /> },
      { name: "Soda water", icon: <Droplets className="h-3 w-3" /> },
      { name: "Tonic water", icon: <Droplets className="h-3 w-3" /> },
    ],
    general: [
      { name: "Chicken", icon: <Beef className="h-3 w-3" /> },
      { name: "Beef", icon: <Beef className="h-3 w-3" /> },
      { name: "Fish", icon: <Fish className="h-3 w-3" /> },
      { name: "Eggs", icon: <Egg className="h-3 w-3" /> },
      { name: "Rice", icon: <Wheat className="h-3 w-3" /> },
      { name: "Pasta", icon: <Wheat className="h-3 w-3" /> },
      { name: "Potatoes", icon: <Carrot className="h-3 w-3" /> },
      { name: "Onions", icon: <Carrot className="h-3 w-3" /> },
      { name: "Garlic", icon: <Carrot className="h-3 w-3" /> },
      { name: "Tomatoes", icon: <Carrot className="h-3 w-3" /> },
      { name: "Cheese", icon: <Milk className="h-3 w-3" /> },
      { name: "Olive oil", icon: <Droplets className="h-3 w-3" /> },
    ],
  }

  const ingredients = ingredientSets[type]

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-primary flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Popular {type === "cocktail" ? "Ingredients" : "Ingredients"}
      </h4>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient) => {
          const isSelected = selectedIngredients.some((selected) =>
            selected.toLowerCase().includes(ingredient.name.toLowerCase()),
          )

          return (
            <Button
              key={ingredient.name}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onIngredientClick(ingredient.name)}
              className={`text-xs flex items-center gap-1 ${
                isSelected ? "bg-primary text-white" : "border-primary/30 text-primary hover:bg-primary/10"
              }`}
            >
              {ingredient.icon}
              {ingredient.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default PopularIngredients
