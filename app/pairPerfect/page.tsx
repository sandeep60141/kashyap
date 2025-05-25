"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { generateRecipe } from "@/lib/client-recipe-generator"
import { ChefForm } from "@/components/chef-form"
import FormStep from "@/components/form-step"
import FreeTierBanner from "@/components/free-tier-banner"
import ModelSelector from "@/components/model-selector"
import LanguageSelector from "@/components/language-selector"

export default function PairPerfect() {
  const router = useRouter()
  const [dish, setDish] = useState("")
  const [pairingType, setPairingType] = useState("wine")
  const [preferences, setPreferences] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const pairingTypes = [
    { type: "wine", label: "Wine Pairing", desc: "Perfect wine selections" },
    { type: "beer", label: "Beer Pairing", desc: "Craft beer recommendations" },
    { type: "cocktail", label: "Cocktail Pairing", desc: "Signature drink pairings" },
    { type: "side", label: "Side Dishes", desc: "Complementary sides" },
    { type: "sauce", label: "Sauce & Condiments", desc: "Perfect flavor enhancers" },
    { type: "dessert", label: "Dessert Pairing", desc: "Sweet endings" },
  ]

  const dishExamples = [
    "Grilled Salmon with Herbs",
    "Beef Wellington",
    "Chicken Tikka Masala",
    "Margherita Pizza",
    "Chocolate Lava Cake",
    "Caesar Salad",
  ]

  const handleSubmit = async () => {
    if (!dish.trim()) {
      setError("Please enter a dish name")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Add language instruction to the prompt
      const languageInstruction =
        selectedLanguage !== "en"
          ? `\n\nIMPORTANT: Generate this pairing recommendation in ${getLanguageName(selectedLanguage)} language. Include pairing names, descriptions, and all text in ${getLanguageName(selectedLanguage)}.`
          : ""

      const recipe = await generateRecipe({
        dish: dish + languageInstruction,
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

  const getLanguageName = (code: string) => {
    const languages = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      hi: "Hindi",
      ar: "Arabic",
      tr: "Turkish",
      nl: "Dutch",
      sv: "Swedish",
      da: "Danish",
      no: "Norwegian",
      fi: "Finnish",
      pl: "Polish",
      cs: "Czech",
    }
    return languages[code] || "English"
  }

  return (
    <div className="generator-container">
      <FreeTierBanner />

      {error && <div className="generator-error mb-6">{error}</div>}

      <ChefForm
        title="PairPerfect - Perfect Food & Drink Pairings"
        buttonText="Get Pairing Suggestions"
        onSubmit={handleSubmit}
        isLoading={isGenerating}
      >
        <FormStep number={1} title="Your Dish" subtitle="Tell us about the dish you want to pair">
          <div className="space-y-6">
            <div>
              <label htmlFor="dish" className="block text-sm font-medium text-primary mb-2">
                What dish would you like to pair? *
              </label>
              <Input
                id="dish"
                placeholder="E.g., Grilled Salmon, Beef Steak, Chicken Curry, Chocolate Cake, etc."
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                className="generator-input"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Popular Dishes</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {dishExamples.map((example) => (
                  <button
                    key={example}
                    onClick={() => setDish(example)}
                    className="text-xs text-left p-2 rounded border border-primary/30 hover:bg-primary/10 text-primary"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-primary mb-2">
                Any specific preferences? (optional)
              </label>
              <Textarea
                id="preferences"
                placeholder="E.g., budget-friendly, premium options, specific regions, dietary restrictions, etc."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="generator-textarea"
                rows={3}
              />
            </div>
          </div>
        </FormStep>

        <FormStep number={2} title="Pairing Type" subtitle="What type of pairing are you looking for?">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-3">Select Pairing Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pairingTypes.map(({ type, label, desc }) => (
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
                    <div className="cursor-pointer">
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-foreground/70 mt-1">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FormStep>

        <FormStep
          number={3}
          title="Final Settings"
          subtitle="Choose your AI model, language, and review your pairing request"
        >
          <div className="space-y-6">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />

            <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} />

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Pairing Summary</h4>
              <div className="text-sm text-foreground/80 space-y-1">
                <p>
                  <strong>Dish:</strong> {dish || "Not specified"}
                </p>
                <p>
                  <strong>Pairing Type:</strong> {pairingTypes.find((p) => p.type === pairingType)?.label}
                </p>
                <p>
                  <strong>Preferences:</strong> {preferences || "None"}
                </p>
                <p>
                  <strong>Language:</strong> {getLanguageName(selectedLanguage)}
                </p>
              </div>
            </div>
          </div>
        </FormStep>
      </ChefForm>
    </div>
  )
}
