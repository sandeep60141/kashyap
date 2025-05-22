"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Coffee, Utensils, Moon, Cookie, Apple } from "lucide-react"

interface MealTypeFiltersProps {
  onFilterChange: (mealType: string | null) => void
}

export default function MealTypeFilters({ onFilterChange }: MealTypeFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const mealTypes = [
    { id: "breakfast", label: "Breakfast", icon: <Coffee className="h-4 w-4" /> },
    { id: "lunch", label: "Lunch", icon: <Utensils className="h-4 w-4" /> },
    { id: "dinner", label: "Dinner", icon: <Moon className="h-4 w-4" /> },
    { id: "dessert", label: "Dessert", icon: <Cookie className="h-4 w-4" /> },
    { id: "snack", label: "Snack", icon: <Apple className="h-4 w-4" /> },
  ]

  const handleFilterClick = (mealType: string) => {
    const newFilter = activeFilter === mealType ? null : mealType
    setActiveFilter(newFilter)
    onFilterChange(newFilter)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {mealTypes.map((type) => (
        <Button
          key={type.id}
          variant={activeFilter === type.id ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick(type.id)}
          className={`flex items-center gap-1 ${
            activeFilter === type.id ? "bg-primary text-white" : "border-primary/30 text-foreground hover:bg-primary/10"
          }`}
        >
          {type.icon}
          {type.label}
        </Button>
      ))}
    </div>
  )
}
