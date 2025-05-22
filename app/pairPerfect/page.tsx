"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Wine } from "lucide-react"
import { generateRecipe } from "@/lib/client-recipe-generator"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Store the recipe in localStorage
      localStorage.setItem("generatedRecipe", JSON.stringify(recipe))

      // Redirect to the recipe result page
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
      <div className="generator-header">
        <h1 className="generator-title">
          <Wine className="inline-block mr-2 h-8 w-8" />
          PairPerfect
        </h1>
        <p className="generator-description">Find the perfect wine, beer, or beverage pairing for any dish.</p>
      </div>

      <FreeTierBanner />

      <form onSubmit={handleSubmit} className="generator-form">
        <div className="generator-section">
          <label htmlFor="dish" className="generator-section-title">
            What dish would you like to pair?
          </label>
          <Textarea
            id="dish"
            placeholder="Describe your dish (e.g., Grilled salmon with lemon and herbs)"
            value={dish}
            onChange={(e) => setDish(e.target.value)}
            className="generator-textarea"
          />
        </div>

        <div className="generator-section">
          <label className="generator-section-title">Pairing Type</label>
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
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="generator-section">
          <label htmlFor="preferences" className="generator-section-title">
            Any preferences or additional instructions? (optional)
          </label>
          <Textarea
            id="preferences"
            placeholder="E.g., red wine only, local beers, non-alcoholic options, etc."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="generator-textarea"
          />
        </div>

        <div className="generator-section">
          <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
        </div>

        {error && <div className="generator-error">{error}</div>}

        <Button type="submit" disabled={isGenerating || !dish.trim()} className="generator-button">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding Perfect Pairing...
            </>
          ) : (
            <>
              <Wine className="mr-2 h-4 w-4" />
              Find Pairing
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
