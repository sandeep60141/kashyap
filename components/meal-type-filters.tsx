"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function MealTypeFilters() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const mealTypes = [
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "dessert", label: "Dessert" },
    { id: "snack", label: "Snack" },
    { id: "appetizer", label: "Appetizer" },
  ]

  const handleTypeClick = (typeId: string) => {
    setSelectedType(typeId === selectedType ? null : typeId)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {mealTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeClick(type.id)}
            className={selectedType === type.id ? "bg-primary text-white" : ""}
          >
            {type.label}
          </Button>
        ))}
      </div>
      {selectedType && (
        <p className="text-sm text-primary mt-2">
          Showing recipes for:{" "}
          <span className="font-medium">{mealTypes.find((t) => t.id === selectedType)?.label}</span>
        </p>
      )}
    </div>
  )
}
