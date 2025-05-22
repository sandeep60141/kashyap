"use client"

import { X } from "lucide-react"

interface IngredientChipsProps {
  ingredients: string
  onRemove: (ingredient: string) => void
  onClearAll: () => void
}

export default function IngredientChips({ ingredients, onRemove, onClearAll }: IngredientChipsProps) {
  // Parse ingredients from comma-separated string
  const ingredientList = ingredients
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)

  if (ingredientList.length === 0) {
    return null
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2 mt-2">
        {ingredientList.map((ingredient, index) => (
          <div key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
            {ingredient}
            <button
              type="button"
              onClick={() => onRemove(ingredient)}
              className="ml-1 text-primary/70 hover:text-primary"
              aria-label={`Remove ${ingredient}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {ingredientList.length > 1 && (
          <button type="button" onClick={onClearAll} className="text-xs text-primary/70 hover:text-primary underline">
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
