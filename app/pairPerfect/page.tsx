"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { generateRecipe } from "@/lib/client-recipe-generator"
import { ChefForm } from "@/components/chef-form"
import FormStep from "@/components/form-step"
import FreeTierBanner from "@/components/free-tier-banner"
import ModelSelector from "@/components/model-selector"
import { Button } from "@/components/ui/button"

// Improve the food pairing tool with better dish suggestions and pairing explanations

// Add dish suggestions

export default function PairPerfect() {
  const router = useRouter()
  const [dish, setDish] = useState("")
  const [pairingType, setPairingType] = useState("wine")
  const [preferences, setPreferences] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")

  // Add dish suggestions
  const dishSuggestions = [
    { name: "Grilled Salmon", type: "seafood" },
    { name: "Ribeye Steak", type: "meat" },
    { name: "Mushroom Risotto", type: "vegetarian" },
    { name: "Spicy Thai Curry", type: "spicy" },
    { name: "Chocolate Lava Cake", type: "dessert" },
    { name: "Cheese Platter", type: "appetizer" },
    { name: "Roast Chicken", type: "poultry" },
    { name: "Pasta Carbonara", type: "pasta" },
  ]

  // Add a function to handle dish suggestion clicks
  const handleDishClick = (suggestion: string) => {
    setDish(suggestion)

    // Auto-select appropriate pairing type based on the dish
    const lowerCaseDish = suggestion.toLowerCase()
    if (
      lowerCaseDish.includes("cake") ||
      lowerCaseDish.includes("chocolate") ||
      lowerCaseDish.includes("dessert") ||
      lowerCaseDish.includes("sweet")
    ) {
      setPairingType("beverage") // Non-alcoholic often pairs better with desserts
    } else if (
      lowerCaseDish.includes("seafood") ||
      lowerCaseDish.includes("fish") ||
      lowerCaseDish.includes("salmon") ||
      lowerCaseDish.includes("tuna")
    ) {
      setPairingType("wine") // Wine often pairs well with seafood
    } else if (lowerCaseDish.includes("burger") || lowerCaseDish.includes("bbq") || lowerCaseDish.includes("grill")) {
      setPairingType("beer") // Beer often pairs well with grilled foods
    }
  }

  // Add pairing explanations
  const pairingExplanations = {
    wine: "Wine pairs well with many dishes through complementary or contrasting flavors. Red wines typically pair with red meats, while white wines complement seafood and poultry.",
    beer: "Beer's carbonation and range of flavors make it versatile for food pairing. Lighter beers pair with lighter foods, while robust beers complement hearty dishes.",
    beverage:
      "Non-alcoholic beverages like sparkling water, tea, or craft sodas can enhance meals through complementary flavors without the alcohol.",
  }

  const handleSubmit = async () => {
    if (!dish.trim()) {
      setError("Please enter a dish")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const recipe = await generateRecipe({
        dish,
        pairingType,
        preferences,
        type: "pairing",
        model: selectedModel,
      })

      localStorage.setItem("generatedRecipe", JSON.stringify(recipe))
      router.push("/recipe-result")
    } catch (err) {
      console.error("Error generating pairing:", err)
      setError(`Failed to generate pairing: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="generator-container">
      <FreeTierBanner />

      {error && <div className="generator-error mb-6">{error}</div>}

      <ChefForm
        title="PairPerfect - Perfect Food & Drink Pairings"
        buttonText="Find Pairing"
        onSubmit={handleSubmit}
        isLoading={isGenerating}
      >
        <FormStep number={1} title="Your Dish" subtitle="Tell us about the dish you want to pair">
          <div className="space-y-4">
            <div>
              <label htmlFor="dish" className="block text-sm font-medium text-primary mb-2">
                What dish would you like to pair? *
              </label>
              <Textarea
                id="dish"
                placeholder="Describe your dish in detail (e.g., Grilled salmon with lemon and herbs, Spicy Thai curry, Chocolate lava cake)"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                className="generator-textarea"
                rows={4}
              />
              <p className="text-xs text-foreground/60 mt-2">
                💡 Include cooking method, main ingredients, and flavor profile for better pairing suggestions
              </p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-primary mb-3">Popular Dishes</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dishSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.name}
                  variant={dish === suggestion.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDishClick(suggestion.name)}
                  className={`text-xs ${
                    dish === suggestion.name
                      ? "bg-primary text-white"
                      : "border-primary/30 text-primary hover:bg-primary/10"
                  }`}
                >
                  {suggestion.name}
                </Button>
              ))}
            </div>
          </div>
        </FormStep>

        <FormStep number={2} title="Pairing Preferences" subtitle="What type of pairing are you looking for?">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-3">Pairing Type</label>
              <div className="grid grid-cols-3 gap-4">
                {["wine", "beer", "beverage"].map((type) => (
                  <div
                    key={type}
                    className={`generator-option ${pairingType === type ? "generator-option-active" : ""}`}
                    onClick={() => setPairingType(type)}
                  >
                    <input
                      type="radio"
                      name="pairingType"
                      id={type}
                      checked={pairingType === type}
                      onChange={() => setPairingType(type)}
                      className="generator-radio"
                    />
                    <label htmlFor={type} className="capitalize cursor-pointer">
                      {type === "beverage" ? "Non-Alcoholic" : type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="text-sm font-medium text-primary mb-2">
                About {pairingType.charAt(0).toUpperCase() + pairingType.slice(1)} Pairings
              </h4>
              <p className="text-xs text-foreground/80">{pairingExplanations[pairingType]}</p>
            </div>

            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-primary mb-2">
                Any preferences or additional instructions? (optional)
              </label>
              <Textarea
                id="preferences"
                placeholder="E.g., red wine only, local craft beers, budget-friendly options, specific regions, etc."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="generator-textarea"
                rows={3}
              />
            </div>
          </div>
        </FormStep>

        <FormStep number={3} title="Final Settings" subtitle="Choose your AI model and review your pairing request">
          <div className="space-y-6">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Pairing Summary</h4>
              <div className="text-sm text-foreground/80 space-y-1">
                <p>
                  <strong>Dish:</strong> {dish || "Not specified"}
                </p>
                <p>
                  <strong>Pairing Type:</strong>{" "}
                  {pairingType === "beverage"
                    ? "Non-Alcoholic Beverage"
                    : pairingType.charAt(0).toUpperCase() + pairingType.slice(1)}
                </p>
                <p>
                  <strong>Preferences:</strong> {preferences || "Any"}
                </p>
              </div>
            </div>
          </div>
        </FormStep>
      </ChefForm>
    </div>
  )
}
