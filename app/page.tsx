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
import { generateRecipeClient } from "@/lib/client-recipe-generator"

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("generate")
  const [prompt, setPrompt] = useState("")
  const [selectedCuisine, setSelectedCuisine] = useState("Italian")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cuisines = [
    { id: "italian", name: "Italian", flag: "🇮🇹" },
    { id: "mexican", name: "Mexican", flag: "🇲🇽" },
    { id: "asian", name: "Asian", flag: "🇨🇳" },
    { id: "mediterranean", name: "Mediterranean", flag: "🇬🇷" },
    { id: "american", name: "American", flag: "🇺🇸" },
    { id: "indian", name: "Indian", flag: "🇮🇳" },
  ]

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setError(null)
    // Clear prompt when switching tabs for better UX
    setPrompt("")
  }

  const handleCuisineSelect = (cuisine: string) => {
    setSelectedCuisine(cuisine)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter some ingredients, preferences, or describe what you want to cook.")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      let enhancedPrompt = ""

      // Create different prompts based on the active tab
      switch (activeTab) {
        case "generate":
          enhancedPrompt = `Create a ${selectedCuisine} recipe based on: ${prompt}. 
          Include detailed ingredients with measurements, step-by-step instructions, cooking times, and nutritional information.`
          break

        case "mealPlan":
          enhancedPrompt = `Create a 3-day meal plan based on these preferences: ${prompt}. 
          Include breakfast, lunch, and dinner for each day with ${selectedCuisine} cuisine influence. 
          Provide shopping lists and prep instructions. This is a meal plan request.`
          break

        case "askChef":
          enhancedPrompt = `As an expert chef, answer this cooking question: ${prompt}. 
          Provide detailed, practical advice with specific techniques and tips. 
          If it's about a specific cuisine, focus on ${selectedCuisine} cooking methods.`
          break

        default:
          enhancedPrompt = prompt
      }

      console.log("Generating with prompt:", enhancedPrompt)

      const recipe = await generateRecipeClient(enhancedPrompt, {
        provider: "openai",
        value: "gpt-4o",
      })

      // Store the generated recipe
      localStorage.setItem("generatedRecipe", recipe)

      // Navigate to results page
      router.push("/recipe-result")
    } catch (err) {
      console.error("Error generating recipe:", err)
      setError(`Failed to generate recipe: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleGenerate()
    }
  }

  const getTabContent = () => {
    switch (activeTab) {
      case "generate":
        return {
          placeholder:
            "Tell us what ingredients you have, your dietary preferences, or what type of meal you want to make...",
          buttonText: "Generate Recipe",
          icon: <ChefHat className="h-5 w-5 mr-2" />,
        }
      case "mealPlan":
        return {
          placeholder:
            "Describe your meal planning needs: dietary preferences, number of people, cooking skill level, time constraints...",
          buttonText: "Create Meal Plan",
          icon: <Calendar className="h-5 w-5 mr-2" />,
        }
      case "askChef":
        return {
          placeholder:
            "Ask any cooking question: How do I make pasta from scratch? What's the best way to season chicken? How do I fix oversalted soup?",
          buttonText: "Ask ChefGPT",
          icon: <MessageSquare className="h-5 w-5 mr-2" />,
        }
      default:
        return {
          placeholder: "Enter your request...",
          buttonText: "Generate",
          icon: <ChefHat className="h-5 w-5 mr-2" />,
        }
    }
  }

  const tabContent = getTabContent()

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

          <div className="max-w-3xl mx-auto bg-card rounded-xl p-8 shadow-lg border-2 border-primary/20">
            {/* Tab Navigation */}
            <div className="flex mb-6 overflow-hidden rounded-lg border-2 border-primary/20">
              <button
                onClick={() => handleTabChange("generate")}
                className={`flex-1 py-3 px-4 font-medium transition-all border-r-2 border-primary/20 ${
                  activeTab === "generate"
                    ? "bg-primary text-white border-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <ChefHat className="h-4 w-4 mr-2 inline" />
                Generate Recipe
              </button>
              <button
                onClick={() => handleTabChange("mealPlan")}
                className={`flex-1 py-3 px-4 font-medium transition-all border-r-2 border-primary/20 ${
                  activeTab === "mealPlan"
                    ? "bg-primary text-white border-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Calendar className="h-4 w-4 mr-2 inline" />
                Meal Planning
              </button>
              <button
                onClick={() => handleTabChange("askChef")}
                className={`flex-1 py-3 px-4 font-medium transition-all ${
                  activeTab === "askChef"
                    ? "bg-primary text-white border-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2 inline" />
                Ask ChefGPT
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Main Input */}
            <div className="mb-6">
              <Textarea
                className="w-full input-primary min-h-[120px] border-2 border-primary/30 focus:border-primary resize-none"
                placeholder={tabContent.placeholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isGenerating}
              />
            </div>

            {/* Cuisine Selection - Only show for generate and meal plan tabs */}
            {(activeTab === "generate" || activeTab === "mealPlan") && (
              <div className="mb-6">
                <p className="text-left mb-3 text-foreground/80 font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Select Cuisine Style
                </p>
                <div className="flex flex-wrap gap-3">
                  {cuisines.map((cuisine) => (
                    <button
                      key={cuisine.id}
                      onClick={() => handleCuisineSelect(cuisine.name)}
                      className={`cuisine-button transition-all border-2 ${
                        selectedCuisine === cuisine.name
                          ? "cuisine-button-active border-primary"
                          : "border-primary/30 hover:border-primary"
                      }`}
                      disabled={isGenerating}
                    >
                      <span>{cuisine.flag}</span>
                      {cuisine.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="btn-generate border-2 border-primary hover:border-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    {tabContent.icon}
                    {tabContent.buttonText}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-foreground/60 mt-4">
              💡 Pro tip: Press Ctrl+Enter to {tabContent.buttonText.toLowerCase()}
            </p>

            {/* Tab-specific tips */}
            <div className="mt-4 text-xs text-foreground/60 italic">
              {activeTab === "generate" && (
                <p>
                  ✨ Try: "Chicken breast, rice, broccoli" or "Quick vegetarian dinner" or "Comfort food for cold
                  weather"
                </p>
              )}
              {activeTab === "mealPlan" && (
                <p>
                  ✨ Try: "Healthy meals for weight loss, 2 people" or "Quick family dinners, picky eaters" or "Meal
                  prep for busy week"
                </p>
              )}
              {activeTab === "askChef" && (
                <p>
                  ✨ Try: "How do I make perfect scrambled eggs?" or "What's the secret to fluffy pancakes?" or "How to
                  fix bland soup?"
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Style Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Recipe Style</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/pantryChef" className="feature-card border-2 border-primary/20 hover:border-primary/40">
              <Utensils className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Pantry Recipes</h3>
              <p className="text-foreground/80 mb-4">Create delicious meals with ingredients you already have.</p>
              <Button variant="link" className="text-primary p-0 border-b border-primary/30 hover:border-primary">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/masterChef" className="feature-card border-2 border-primary/20 hover:border-primary/40">
              <Globe className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Cuisine Explorer</h3>
              <p className="text-foreground/80 mb-4">Discover authentic recipes from around the world.</p>
              <Button variant="link" className="text-primary p-0 border-b border-primary/30 hover:border-primary">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/macrosChef" className="feature-card border-2 border-primary/20 hover:border-primary/40">
              <Leaf className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Nutrition Focus</h3>
              <p className="text-foreground/80 mb-4">Healthy recipes tailored to your dietary needs.</p>
              <Button variant="link" className="text-primary p-0 border-b border-primary/30 hover:border-primary">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/mealPlanChef" className="feature-card border-2 border-primary/20 hover:border-primary/40">
              <Calendar className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Meal Planning</h3>
              <p className="text-foreground/80 mb-4">Create weekly meal plans with shopping lists.</p>
              <Button variant="link" className="text-primary p-0 border-b border-primary/30 hover:border-primary">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/pairPerfect" className="feature-card border-2 border-primary/20 hover:border-primary/40">
              <Wine className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Food Pairing</h3>
              <p className="text-foreground/80 mb-4">Find perfect combinations for your meals.</p>
              <Button variant="link" className="text-primary p-0 border-b border-primary/30 hover:border-primary">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>

            <Link href="/mixologyMaestro" className="feature-card border-2 border-primary/20 hover:border-primary/40">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Cocktail Creator</h3>
              <p className="text-foreground/80 mb-4">Design custom drinks for any occasion.</p>
              <Button variant="link" className="text-primary p-0 border-b border-primary/30 hover:border-primary">
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
            <div className="feature-card group border-2 border-primary/20 hover:border-primary/40">
              <FileDown className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80" />
              <h3 className="text-xl font-bold mb-2">Download as PDF</h3>
              <p className="text-foreground/80 mb-4">Save your recipes for offline viewing or printing.</p>
              <Button variant="link" className="text-primary p-0 hover:text-primary/80 border-b border-primary/30">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="feature-card group border-2 border-primary/20 hover:border-primary/40">
              <ShoppingBag className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80" />
              <h3 className="text-xl font-bold mb-2">Shopping List</h3>
              <p className="text-foreground/80 mb-4">Automatically generate shopping lists from your recipes.</p>
              <Button variant="link" className="text-primary p-0 hover:text-primary/80 border-b border-primary/30">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="feature-card group border-2 border-primary/20 hover:border-primary/40">
              <Link2 className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80" />
              <h3 className="text-xl font-bold mb-2">Copy Recipe Link</h3>
              <p className="text-foreground/80 mb-4">Share your favorite recipes with friends and family.</p>
              <Button variant="link" className="text-primary p-0 hover:text-primary/80 border-b border-primary/30">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="feature-card group border-2 border-primary/20 hover:border-primary/40">
              <MessageSquare className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80" />
              <h3 className="text-xl font-bold mb-2">Ask ChefGPT</h3>
              <p className="text-foreground/80 mb-4">Get answers to your cooking questions instantly.</p>
              <Button variant="link" className="text-primary p-0 hover:text-primary/80 border-b border-primary/30">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/recipe-result">
              <Button className="bg-primary text-white hover:bg-primary/90 border-2 border-primary hover:border-primary/90">
                Try All Tools <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
