"use client"

import { Button } from "@/components/ui/button"

interface CuisineSuggestionsProps {
  onCuisineClick: (cuisine: string) => void
  selectedCuisine?: string
}

export default function CuisineSuggestions({ onCuisineClick, selectedCuisine }: CuisineSuggestionsProps) {
  const cuisines = [
    "Italian",
    "Mexican",
    "Chinese",
    "Japanese",
    "Thai",
    "Indian",
    "French",
    "Mediterranean",
    "American",
    "Korean",
    "Vietnamese",
    "Greek",
    "Spanish",
    "Middle Eastern",
    "Brazilian",
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-primary">Popular Cuisines</h4>
      <div className="flex flex-wrap gap-2">
        {cuisines.map((cuisine) => (
          <Button
            key={cuisine}
            variant={selectedCuisine === cuisine ? "default" : "outline"}
            size="sm"
            onClick={() => onCuisineClick(cuisine)}
            className={`text-xs ${
              selectedCuisine === cuisine
                ? "bg-primary text-white"
                : "border-primary/30 text-primary hover:bg-primary/10"
            }`}
          >
            {cuisine}
          </Button>
        ))}
      </div>
    </div>
  )
}
