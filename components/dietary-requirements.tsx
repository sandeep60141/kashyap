"use client"
import { Leaf, Wheat, Milk, Nut, Fish, Egg } from "lucide-react"

interface DietaryRequirementsProps {
  selectedRequirements: string[]
  onChange: (requirements: string[]) => void
}

export default function DietaryRequirements({ selectedRequirements, onChange }: DietaryRequirementsProps) {
  const requirements = [
    { name: "Vegetarian", icon: <Leaf className="option-icon" /> },
    { name: "Vegan", icon: <Leaf className="option-icon" /> },
    { name: "Gluten-Free", icon: <Wheat className="option-icon" /> },
    { name: "Dairy-Free", icon: <Milk className="option-icon" /> },
    { name: "Nut-Free", icon: <Nut className="option-icon" /> },
    { name: "Low-Carb", icon: <Wheat className="option-icon" /> },
    { name: "Keto", icon: <Leaf className="option-icon" /> },
    { name: "Paleo", icon: <Leaf className="option-icon" /> },
    { name: "Pescatarian", icon: <Fish className="option-icon" /> },
    { name: "Egg-Free", icon: <Egg className="option-icon" /> },
    { name: "Halal", icon: <Leaf className="option-icon" /> },
    { name: "Kosher", icon: <Leaf className="option-icon" /> },
  ]

  const toggleRequirement = (requirement: string) => {
    if (selectedRequirements.includes(requirement)) {
      onChange(selectedRequirements.filter((r) => r !== requirement))
    } else {
      onChange([...selectedRequirements, requirement])
    }
  }

  return (
    <div className="dietary-grid">
      {requirements.map((requirement) => (
        <div
          key={requirement.name}
          className={`generator-option ${selectedRequirements.includes(requirement.name) ? "generator-option-active" : ""}`}
          onClick={() => toggleRequirement(requirement.name)}
        >
          <div className="custom-checkbox">
            <input
              type="checkbox"
              id={`dietary-${requirement.name}`}
              checked={selectedRequirements.includes(requirement.name)}
              onChange={() => toggleRequirement(requirement.name)}
            />
            <div className="checkbox-visual"></div>
          </div>
          <div className="option-content">
            {requirement.icon}
            <span className="option-text">{requirement.name}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
