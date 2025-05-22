"use client"
import { Check, Leaf, Wheat, Milk, Nut, Fish, Egg } from "lucide-react"

interface DietaryRequirementsProps {
  selectedRequirements: string[]
  onChange: (requirements: string[]) => void
}

export default function DietaryRequirements({ selectedRequirements, onChange }: DietaryRequirementsProps) {
  const requirements = [
    { name: "Vegetarian", icon: <Leaf className="h-4 w-4" /> },
    { name: "Vegan", icon: <Leaf className="h-4 w-4" /> },
    { name: "Gluten-Free", icon: <Wheat className="h-4 w-4" /> },
    { name: "Dairy-Free", icon: <Milk className="h-4 w-4" /> },
    { name: "Nut-Free", icon: <Nut className="h-4 w-4" /> },
    { name: "Low-Carb", icon: <Wheat className="h-4 w-4" /> },
    { name: "Keto", icon: <Leaf className="h-4 w-4" /> },
    { name: "Paleo", icon: <Leaf className="h-4 w-4" /> },
    { name: "Pescatarian", icon: <Fish className="h-4 w-4" /> },
    { name: "Egg-Free", icon: <Egg className="h-4 w-4" /> },
    { name: "Halal", icon: <Leaf className="h-4 w-4" /> },
    { name: "Kosher", icon: <Leaf className="h-4 w-4" /> },
  ]

  const toggleRequirement = (requirement: string) => {
    if (selectedRequirements.includes(requirement)) {
      onChange(selectedRequirements.filter((r) => r !== requirement))
    } else {
      onChange([...selectedRequirements, requirement])
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {requirements.map((requirement) => (
        <div
          key={requirement.name}
          className={`generator-option ${selectedRequirements.includes(requirement.name) ? "generator-option-active" : ""}`}
          onClick={() => toggleRequirement(requirement.name)}
        >
          <div
            className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${
              selectedRequirements.includes(requirement.name)
                ? "bg-primary border-primary text-white"
                : "border-primary/30"
            }`}
          >
            {selectedRequirements.includes(requirement.name) && <Check className="h-3 w-3" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary">{requirement.icon}</span>
            <span className="text-sm font-medium">{requirement.name}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
