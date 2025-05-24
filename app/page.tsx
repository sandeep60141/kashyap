"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronRight,
  Utensils,
  Globe,
  Leaf,
  Calendar,
  Wine,
  Zap,
  FileDown,
  ShoppingBag,
  Link2,
  MessageSquare,
  ChefHat,
  Sparkles,
  Loader2,
} from "lucide-react"
import { generateRecipe } from "@/lib/client-recipe-generator"
import DietaryRequirements from "@/components/dietary-requirements"

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("generate")
  const [prompt, setPrompt] = useState("")
  const [selectedCuisine, setSelectedCuisine] = useState("Italian")
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Meal planning specific states
  const [mealPlanDays, setMealPlanDays] = useState(3)
  const [mealPlanCalories, setMealPlanCalories] = useState(2000)

  // Ask ChefGPT specific states
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const cuisines = [
    { name: "Italian", flag: "🇮🇹", active: true },
    { name: "Mexican", flag: "🇲🇽", active: false },
    { name: "Asian", flag: "🇨🇳", active: false },
    { name: "Mediterranean", flag: "🇬🇷", active: false },
    { name: "American", flag: "🇺🇸", active: false },
    { name: "Indian", flag: "🇮🇳", active: false },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === "generate") {
      await handleRecipeGeneration()
    } else if (activeTab === "meal-planning") {
      await handleMealPlanGeneration()
    } else if (activeTab === "ask-chef") {
      await handleAskChefGPT()
    }
  }

  const handleRecipeGeneration = async () => {
    if (!prompt.trim()) {
      setError("Please describe what you want to cook")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const recipe = await generateRecipe({
        recipeName: prompt,
        cuisine: selectedCuisine,
        dietaryRequirements,
        preferences: `Cuisine: ${selectedCuisine}`,
        model: "gpt-4o",
      })

      localStorage.setItem("generatedRecipe", JSON.stringify(recipe))
      router.push("/recipe-result")
    } catch (err) {
      console.error("Error generating recipe:", err)
      setError(`Failed to generate recipe: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMealPlanGeneration = async () => {
    if (!prompt.trim()) {
      setError("Please describe your meal plan preferences")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const mealPlan = await generateRecipe({
        days: mealPlanDays,
        calories: mealPlanCalories,
        preferences: prompt,
        dietaryRequirements,
        type: "mealPlan",
        model: "gpt-4o",
      })

      localStorage.setItem("generatedRecipe", JSON.stringify(mealPlan))
      router.push("/recipe-result")
    } catch (err) {
      console.error("Error generating meal plan:", err)
      setError(`Failed to generate meal plan: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAskChefGPT = async () => {
    if (!question.trim()) {
      setError("Please ask a cooking question")
      return
    }

    setIsGenerating(true)
    setError(null)
    setAnswer("")

    try {
      const response = await fetch("/api/quick-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        throw new Error("Failed to get answer")
      }

      const data = await response.json()
      setAnswer(data.answer)
    } catch (err) {
      console.error("Error getting answer:", err)
      setError(`Failed to get answer: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit(e as any)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ChefHat className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-primary">Culina</span>AI
            </h1>
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto">
            AI-Powered Recipe Generation & Cooking Assistant
          </p>

          <div className="max-w-3xl mx-auto bg-card rounded-xl p-8 shadow-lg border border-primary/20">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="flex mb-6 overflow-hidden rounded-lg border border-primary/20">
                <button
                  type="button"
                  onClick={() => setActiveTab("generate")}
                  className={`flex-1 py-3 px-4 transition-all duration-200 ${
                    activeTab === "generate"
                      ? "bg-gradient-to-r from-primary to-accent text-white"
                      : "bg-secondary/50 text-foreground/70 hover:bg-primary/10"
                  }`}
                >
                  <ChefHat className="h-4 w-4 mr-2 inline" />
                  Generate Recipe
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("meal-planning")}
                  className={`flex-1 py-3 px-4 transition-all duration-200 ${
                    activeTab === "meal-planning"
                      ? "bg-gradient-to-r from-primary to-accent text-white"
                      : "bg-secondary/50 text-foreground/70 hover:bg-primary/10"
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2 inline" />
                  Meal Planning
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ask-chef")}
                  className={`flex-1 py-3 px-4 transition-all duration-200 ${
                    activeTab === "ask-chef"
                      ? "bg-gradient-to-r from-primary to-accent text-white"
                      : "bg-secondary/50 text-foreground/70 hover:bg-primary/10"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2 inline" />
                  Ask ChefGPT
                </button>
              </div>

              {/* Generate Recipe Tab */}
              {activeTab === "generate" && (
                <div className="space-y-6">
                  <div>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full min-h-[120px] border-primary/30 focus:border-primary focus:ring-primary/20"
                      placeholder="Tell us what ingredients you have, your dietary preferences, or what type of meal you want to make..."
                    />
                  </div>

                  <div>
                    <p className="text-left mb-3 text-foreground/80 font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Select Cuisine Style
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {cuisines.map((cuisine) => (
                        <button
                          key={cuisine.name}
                          type="button"
                          onClick={() => setSelectedCuisine(cuisine.name)}
                          className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                            selectedCuisine === cuisine.name
                              ? "bg-gradient-to-r from-primary to-accent text-white border-primary"
                              : "border-primary/30 text-primary hover:bg-primary/10"
                          }`}
                        >
                          <span>{cuisine.flag}</span>
                          {cuisine.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-3">
                      Dietary Requirements (optional)
                    </label>
                    <DietaryRequirements selectedRequirements={dietaryRequirements} onChange={setDietaryRequirements} />
                  </div>
                </div>
              )}

              {/* Meal Planning Tab */}
              {activeTab === "meal-planning" && (
                <div className="space-y-6">
                  <div>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full min-h-[120px] border-primary/30 focus:border-primary focus:ring-primary/20"
                      placeholder="Describe your meal plan preferences (e.g., healthy meals, quick prep, family-friendly, etc.)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Number of Days</label>
                      <select
                        value={mealPlanDays}
                        onChange={(e) => setMealPlanDays(Number(e.target.value))}
                        className="w-full p-3 border border-primary/30 rounded-lg focus:border-primary focus:ring-primary/20"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                          <option key={day} value={day}>
                            {day} {day === 1 ? "day" : "days"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Daily Calories</label>
                      <select
                        value={mealPlanCalories}
                        onChange={(e) => setMealPlanCalories(Number(e.target.value))}
                        className="w-full p-3 border border-primary/30 rounded-lg focus:border-primary focus:ring-primary/20"
                      >
                        <option value={1200}>1,200 calories</option>
                        <option value={1500}>1,500 calories</option>
                        <option value={1800}>1,800 calories</option>
                        <option value={2000}>2,000 calories</option>
                        <option value={2200}>2,200 calories</option>
                        <option value={2500}>2,500 calories</option>
                        <option value={3000}>3,000 calories</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-3">
                      Dietary Requirements (optional)
                    </label>
                    <DietaryRequirements selectedRequirements={dietaryRequirements} onChange={setDietaryRequirements} />
                  </div>
                </div>
              )}

              {/* Ask ChefGPT Tab */}
              {activeTab === "ask-chef" && (
                <div className="space-y-6">
                  <div>
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full min-h-[120px] border-primary/30 focus:border-primary focus:ring-primary/20"
                      placeholder="Ask any cooking question (e.g., How do I make perfect pasta? What's a good substitute for eggs? How long should I cook chicken?)"
                    />
                  </div>

                  {answer && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-medium text-primary mb-2">ChefGPT Answer:</h4>
                      <p className="text-foreground/80 whitespace-pre-wrap">{answer}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center mt-8">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 px-8 py-3 text-lg font-medium"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {activeTab === "generate"
                        ? "Generating Recipe..."
                        : activeTab === "meal-planning"
                          ? "Creating Meal Plan..."
                          : "Getting Answer..."}
                    </>
                  ) : (
                    <>
                      <ChefHat className="h-5 w-5 mr-2" />
                      {activeTab === "generate"
                        ? "Generate Recipe"
                        : activeTab === "meal-planning"
                          ? "Create Meal Plan"
                          : "Ask ChefGPT"}
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-foreground/60 mt-4 text-center">
                Pro tip: Press Ctrl+Enter to{" "}
                {activeTab === "generate"
                  ? "generate"
                  : activeTab === "meal-planning"
                    ? "create meal plan"
                    : "ask question"}
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Recipe Style Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Recipe Style</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/pantryChef" className="feature-card">
              <Utensils className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Pantry Recipes</h3>
              <p className="text-foreground/80 mb-4">Create delicious meals with ingredients you already have.</p>
              <Button variant="link" className="text-primary p-0">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/masterChef" className="feature-card">
              <Globe className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Cuisine Explorer</h3>
              <p className="text-foreground/80 mb-4">Discover authentic recipes from around the world.</p>
              <Button variant="link" className="text-primary p-0">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/macrosChef" className="feature-card">
              <Leaf className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Nutrition Focus</h3>
              <p className="text-foreground/80 mb-4">Healthy recipes tailored to your dietary needs.</p>
              <Button variant="link" className="text-primary p-0">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/mealPlanChef" className="feature-card">
              <Calendar className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Meal Planning</h3>
              <p className="text-foreground/80 mb-4">Create weekly meal plans with shopping lists.</p>
              <Button variant="link" className="text-primary p-0">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/pairPerfect" className="feature-card">
              <Wine className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Food Pairing</h3>
              <p className="text-foreground/80 mb-4">Find perfect combinations for your meals.</p>
              <Button variant="link" className="text-primary p-0">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/mixologyMaestro" className="feature-card">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Cocktail Creator</h3>
              <p className="text-foreground/80 mb-4">Design custom drinks for any occasion.</p>
              <Button variant="link" className="text-primary p-0">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Recipe Tools</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="feature-card group">
              <FileDown className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80" />
              <h3 className="text-xl font-bold mb-2">Download as PDF</h3>
              <p className="text-foreground/80 mb-4">Save your recipes for offline viewing or printing.</p>
              <Button variant="link" className="text-primary p-0 hover:text-primary/80">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="feature-card group">
              <ShoppingBag className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80" />
              <h3 className="text-xl font-bold mb-2">Shopping List</h3>
              <p className="text-foreground/80 mb-4">Automatically generate shopping lists from your recipes.</p>
              <Button variant="link" className="text-primary p-0 hover:text-primary/80">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="feature-card group">
              <Link2 className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80" />
              <h3 className="text-xl font-bold mb-2">Copy Recipe Link</h3>
              <p className="text-foreground/80 mb-4">Share your favorite recipes with friends and family.</p>
              <Button variant="link" className="text-primary p-0 hover:text-primary/80">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="feature-card group">
              <MessageSquare className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80" />
              <h3 className="text-xl font-bold mb-2">Ask ChefGPT</h3>
              <p className="text-foreground/80 mb-4">Get answers to your cooking questions instantly.</p>
              <Button variant="link" className="text-primary p-0 hover:text-primary/80">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/recipe-result">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Try All Tools <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
