"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { generateRecipe } from "@/lib/client-recipe-generator"
import { ChefForm } from "@/components/chef-form"
import FormStep from "@/components/form-step"
import FreeTierBanner from "@/components/free-tier-banner"
import ModelSelector from "@/components/model-selector"

export default function PairPerfect() {
  const router = useRouter()
  const [dish, setDish] = useState("")
  const [pairingType, setPairingType] = useState("wine")
  const [preferences, setPreferences] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")

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
