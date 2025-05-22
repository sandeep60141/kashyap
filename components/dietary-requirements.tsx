"use client"
import { Check } from "lucide-react"

interface DietaryRequirementsProps {
  selectedRequirements: string[]
  onChange: (requirements: string[]) => void
}

export default function DietaryRequirements({ selectedRequirements, onChange }: DietaryRequirementsProps) {
  const requirements = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Low-Carb",
    "Keto",
    "Paleo",
    "Pescatarian",
    "Halal",
    "Kosher",
  ]

  const toggleRequirement = (requirement: string) => {
    if (selectedRequirements.includes(requirement)) {
      onChange(selectedRequirements.filter((r) => r !== requirement))
    } else {
      onChange([...selectedRequirements, requirement])
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {requirements.map((requirement) => (
        <div
          key={requirement}
          className={`generator-option ${selectedRequirements.includes(requirement) ? "generator-option-active" : ""}`}
          onClick={() => toggleRequirement(requirement)}
        >
          <div
            className={`flex-shrink-0 w-5 h-5 rounded border ${
              selectedRequirements.includes(requirement)
                ? "bg-primary border-primary flex items-center justify-center"
                : "border-primary/30"
            }`}
          >
            {selectedRequirements.includes(requirement) && <Check className="h-3 w-3 text-white" />}
          </div>
          <span>{requirement}</span>
        </div>
      ))}
    </div>
  )
}
