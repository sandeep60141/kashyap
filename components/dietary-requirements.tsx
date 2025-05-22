"use client"
import { Check } from "lucide-react"
import TooltipHelper from "@/components/ui/tooltip-helper"
import { TooltipProvider } from "@/components/ui/tooltip"

interface DietaryRequirementsProps {
  selectedRequirements: string[]
  onChange: (requirements: string[]) => void
}

export default function DietaryRequirements({ selectedRequirements, onChange }: DietaryRequirementsProps) {
  // Group dietary requirements by category
  const dietaryGroups = {
    "Diet Types": ["Vegetarian", "Vegan", "Pescatarian"],
    "Allergies & Restrictions": ["Gluten-Free", "Dairy-Free", "Nut-Free"],
    "Health Goals": ["Low-Carb", "Keto", "Paleo"],
    Religious: ["Halal", "Kosher"],
  }

  // Add tooltips for each dietary requirement
  const dietaryTooltips = {
    Vegetarian: "No meat, poultry, or seafood, but may include eggs and dairy",
    Vegan: "No animal products including meat, dairy, eggs, or honey",
    "Gluten-Free": "No wheat, barley, rye, or other gluten-containing ingredients",
    "Dairy-Free": "No milk, cheese, butter, or other dairy products",
    "Nut-Free": "No peanuts, tree nuts, or ingredients derived from nuts",
    "Low-Carb": "Limited carbohydrates, focusing on proteins and healthy fats",
    Keto: "Very low carb, high fat diet that puts your body in ketosis",
    Paleo: "Foods similar to what might have been eaten during the Paleolithic era",
    Pescatarian: "Vegetarian diet that includes fish and seafood",
    Halal: "Foods permissible according to Islamic law",
    Kosher: "Foods that conform to Jewish dietary laws",
  }

  const toggleRequirement = (requirement: string) => {
    if (selectedRequirements.includes(requirement)) {
      onChange(selectedRequirements.filter((r) => r !== requirement))
    } else {
      onChange([...selectedRequirements, requirement])
    }
  }

  // Update the component to use grouped requirements with tooltips
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {Object.entries(dietaryGroups).map(([groupName, requirements]) => (
          <div key={groupName} className="space-y-2">
            <h5 className="text-xs font-medium text-primary/80">{groupName}</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {requirements.map((requirement) => (
                <div
                  key={requirement}
                  className={`generator-option ${selectedRequirements.includes(requirement) ? "generator-option-active" : ""}`}
                  onClick={() => toggleRequirement(requirement)}
                  title={dietaryTooltips[requirement]}
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
                  <div className="flex items-center">
                    <span>{requirement}</span>
                    <TooltipHelper content={dietaryTooltips[requirement]} className="ml-1" position="right" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
