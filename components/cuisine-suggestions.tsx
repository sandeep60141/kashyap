"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

interface CuisineSuggestionsProps {
  onCuisineClick: (cuisine: string) => void
  selectedCuisine?: string
}

export default function CuisineSuggestions({ onCuisineClick, selectedCuisine }: CuisineSuggestionsProps) {
  const cuisines = [
    { name: "Italian", flag: "🇮🇹" },
    { name: "Mexican", flag: "🇲🇽" },
    { name: "Chinese", flag: "🇨🇳" },
    { name: "Japanese", flag: "🇯🇵" },
    { name: "Thai", flag: "🇹🇭" },
    { name: "Indian", flag: "🇮🇳" },
    { name: "French", flag: "🇫🇷" },
    { name: "Mediterranean", flag: "🇬🇷" },
    { name: "American", flag: "🇺🇸" },
    { name: "Korean", flag: "🇰🇷" },
    { name: "Vietnamese", flag: "🇻🇳" },
    { name: "Spanish", flag: "🇪🇸" },
    { name: "Middle Eastern", flag: "🇹🇷" },
    { name: "Brazilian", flag: "🇧🇷" },
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-primary flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Popular Cuisines
      </h4>
      <div className="flex flex-wrap gap-2">
        {cuisines.map((cuisine) => (
          <Button
            key={cuisine.name}
            variant={selectedCuisine === cuisine.name ? "default" : "outline"}
            size="sm"
            onClick={() => onCuisineClick(cuisine.name)}
            className={`text-xs flex items-center gap-1 ${
              selectedCuisine === cuisine.name
                ? "bg-primary text-white"
                : "border-primary/30 text-primary hover:bg-primary/10"
            }`}
          >
            <span>{cuisine.flag}</span>
            {cuisine.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
