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
  DollarSign,
  Star,
  Users,
  Clock,
} from "lucide-react"
import { generateRecipe } from "@/lib/client-recipe-generator"
import DietaryRequirements from "@/components/dietary-requirements"
import Head from "next/head"

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

  // Token optimization mode
  const [ecoMode, setEcoMode] = useState(true)

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
      const optimizedPrompt = ecoMode
        ? `${prompt}. ${selectedCuisine} style.`
        : `${prompt}. Cuisine: ${selectedCuisine}. Dietary: ${dietaryRequirements.join(", ")}.`

      const recipe = await generateRecipe({
        recipeName: optimizedPrompt,
        cuisine: selectedCuisine,
        dietaryRequirements: ecoMode ? [] : dietaryRequirements,
        preferences: ecoMode ? "" : `Cuisine: ${selectedCuisine}`,
        model: ecoMode ? "gpt-3.5-turbo" : "gpt-4o",
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
      const mealPlanPrompt = `Create a complete ${mealPlanDays}-day meal plan with exactly ${mealPlanDays} days.

REQUIREMENTS:
- MUST include exactly ${mealPlanDays} days (Day 1, Day 2, etc.)
- Each day MUST have 3 meals: Breakfast, Lunch, Dinner
- Daily calorie target: ${mealPlanCalories} calories
- User preferences: ${prompt}
${dietaryRequirements.length > 0 ? `- Dietary requirements: ${dietaryRequirements.join(", ")}` : ""}

CRITICAL: This is a ${mealPlanDays}-day meal plan request. Do not create a single recipe.

Format as a meal plan with multiple days, not a single recipe.`

      const mealPlan = await generateRecipe(mealPlanPrompt, {
        provider: "openai",
        value: ecoMode ? "gpt-3.5-turbo" : "gpt-4o",
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
        body: JSON.stringify({
          prompt: question,
          recipeName: "General Cooking Question",
          recipeData: null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get answer")
      }

      const data = await response.json()
      setAnswer(data.answer)
      setQuestion("")
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
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "CulinaAI Recipe Generator",
              description: "AI-powered Food AI platform for generating personalized recipes and meal plans",
              url: "https://culinaai.com",
              applicationCategory: "Food & Cooking",
              operatingSystem: "Web Browser",
              browserRequirements: "Requires JavaScript",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </Head>

      <div className="flex flex-col min-h-screen">
        {/* Hero Section - 85% Container */}
        <section className="py-20 md:py-32 text-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="w-[85%] max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <ChefHat className="h-12 w-12 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="text-primary">Culina</span>AI
              </h1>
              <Sparkles className="h-8 w-8 text-accent" />
            </div>

            <h2 className="text-xl md:text-2xl text-foreground/80 mb-4 max-w-4xl mx-auto">
              Advanced <strong>Food AI</strong> & <strong>Recipe Generator AI</strong> for Smart Cooking
            </h2>

            <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-3xl mx-auto">
              Transform your kitchen experience with our intelligent Food AI technology. Generate personalized recipes,
              create meal plans, and get expert cooking assistance powered by advanced Recipe Generator AI.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>50,000+ Happy Cooks</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>1M+ Recipes Generated</span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto bg-card rounded-xl p-6 md:p-8 shadow-lg border border-primary/20">
              {/* Token Optimization Toggle */}
              <div className="flex items-center justify-between mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Eco Mode: {ecoMode ? "ON" : "OFF"} (Saves ~60% tokens)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEcoMode(!ecoMode)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    ecoMode ? "bg-green-600 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  }`}
                >
                  {ecoMode ? "Eco Mode" : "Full Mode"}
                </button>
              </div>

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
                    Recipe Generator AI
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
                    Meal Planning AI
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
                    Ask Food AI
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
                        placeholder={
                          ecoMode
                            ? "Describe what you want to cook with our Recipe Generator AI..."
                            : "Tell our Food AI about your ingredients, dietary preferences, or meal type..."
                        }
                      />
                    </div>

                    <div>
                      <p className="text-left mb-3 text-foreground/80 font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Select Cuisine Style for Recipe Generator AI
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

                    {!ecoMode && (
                      <div>
                        <label className="block text-sm font-medium text-primary mb-3">
                          Dietary Requirements for Food AI (optional)
                        </label>
                        <DietaryRequirements
                          selectedRequirements={dietaryRequirements}
                          onChange={setDietaryRequirements}
                        />
                      </div>
                    )}
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
                        placeholder={
                          ecoMode
                            ? "Brief meal plan preferences for our Food AI..."
                            : "Describe your meal plan preferences to our intelligent Food AI system..."
                        }
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
                          {(ecoMode ? [1, 2, 3] : [1, 2, 3, 4, 5, 6, 7]).map((day) => (
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

                    {!ecoMode && (
                      <div>
                        <label className="block text-sm font-medium text-primary mb-3">
                          Dietary Requirements for Meal Planning AI (optional)
                        </label>
                        <DietaryRequirements
                          selectedRequirements={dietaryRequirements}
                          onChange={setDietaryRequirements}
                        />
                      </div>
                    )}
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
                        placeholder={
                          ecoMode
                            ? "Ask our Food AI a simple cooking question..."
                            : "Ask our intelligent Food AI any cooking question (substitutions, techniques, timing, etc.)"
                        }
                      />
                    </div>

                    {answer && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h4 className="font-medium text-primary mb-2">Food AI Answer:</h4>
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
                          ? "Recipe Generator AI Working..."
                          : activeTab === "meal-planning"
                            ? "Food AI Creating Plan..."
                            : "Food AI Thinking..."}
                      </>
                    ) : (
                      <>
                        <ChefHat className="h-5 w-5 mr-2" />
                        {activeTab === "generate"
                          ? "Generate Recipe with AI"
                          : activeTab === "meal-planning"
                            ? "Create Meal Plan with AI"
                            : "Ask Food AI"}
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-foreground/60 mt-4 text-center">
                  {ecoMode && <span className="text-green-600 font-medium">💡 Eco Mode saves ~60% tokens • </span>}
                  Pro tip: Press Ctrl+Enter to activate our Food AI
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Recipe Style Section - 85% Container */}
        <section className="py-16 bg-secondary/30">
          <div className="w-[85%] max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-4">
              Choose Your <span className="text-primary">Food AI</span> Recipe Style
            </h2>
            <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
              Our advanced Recipe Generator AI offers specialized cooking modes for every culinary need
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/pantryChef" className="feature-card group">
                <Utensils className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Pantry Recipe AI</h3>
                <p className="text-foreground/80 mb-4">
                  Let our Food AI create delicious meals with ingredients you already have at home.
                </p>
                <Button variant="link" className="text-primary p-0 group-hover:text-primary/80">
                  Try Recipe Generator AI <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>

              <Link href="/masterChef" className="feature-card group">
                <Globe className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Global Cuisine AI</h3>
                <p className="text-foreground/80 mb-4">
                  Discover authentic recipes from around the world with our intelligent Food AI.
                </p>
                <Button variant="link" className="text-primary p-0 group-hover:text-primary/80">
                  Explore with Food AI <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>

              <Link href="/macrosChef" className="feature-card group">
                <Leaf className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Nutrition AI</h3>
                <p className="text-foreground/80 mb-4">
                  Get healthy recipes tailored to your dietary needs with our smart Food AI.
                </p>
                <Button variant="link" className="text-primary p-0 group-hover:text-primary/80">
                  Try Nutrition AI <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>

              <Link href="/mealPlanChef" className="feature-card group">
                <Calendar className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Meal Planning AI</h3>
                <p className="text-foreground/80 mb-4">
                  Create comprehensive weekly meal plans with our intelligent Food AI system.
                </p>
                <Button variant="link" className="text-primary p-0 group-hover:text-primary/80">
                  Plan with AI <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>

              <Link href="/pairPerfect" className="feature-card group">
                <Wine className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Food Pairing AI</h3>
                <p className="text-foreground/80 mb-4">
                  Find perfect flavor combinations with our advanced Recipe Generator AI.
                </p>
                <Button variant="link" className="text-primary p-0 group-hover:text-primary/80">
                  Discover Pairings <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>

              <Link href="/mixologyMaestro" className="feature-card group">
                <Zap className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Cocktail AI</h3>
                <p className="text-foreground/80 mb-4">
                  Design custom drinks for any occasion with our beverage Food AI.
                </p>
                <Button variant="link" className="text-primary p-0 group-hover:text-primary/80">
                  Mix with AI <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Tools Section - 85% Container */}
        <section className="py-16 bg-background">
          <div className="w-[85%] max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-4">
              Powerful <span className="text-primary">Food AI</span> Recipe Tools
            </h2>
            <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
              Enhance your cooking experience with our comprehensive Recipe Generator AI toolkit
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="feature-card group">
                <FileDown className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80 group-hover:scale-110 transition-all" />
                <h3 className="text-xl font-bold mb-2">PDF Recipe Export</h3>
                <p className="text-foreground/80 mb-4">
                  Save your Food AI generated recipes for offline viewing and printing.
                </p>
                <Button variant="link" className="text-primary p-0 hover:text-primary/80">
                  Export Recipes <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="feature-card group">
                <ShoppingBag className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80 group-hover:scale-110 transition-all" />
                <h3 className="text-xl font-bold mb-2">Smart Shopping Lists</h3>
                <p className="text-foreground/80 mb-4">
                  Auto-generate organized shopping lists from your Recipe Generator AI creations.
                </p>
                <Button variant="link" className="text-primary p-0 hover:text-primary/80">
                  Create Lists <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="feature-card group">
                <Link2 className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80 group-hover:scale-110 transition-all" />
                <h3 className="text-xl font-bold mb-2">Recipe Sharing</h3>
                <p className="text-foreground/80 mb-4">
                  Share your favorite Food AI recipes with friends and family instantly.
                </p>
                <Button variant="link" className="text-primary p-0 hover:text-primary/80">
                  Share Recipes <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="feature-card group">
                <MessageSquare className="h-10 w-10 text-primary mb-4 group-hover:text-primary/80 group-hover:scale-110 transition-all" />
                <h3 className="text-xl font-bold mb-2">Food AI Assistant</h3>
                <p className="text-foreground/80 mb-4">
                  Get instant answers to cooking questions from our intelligent Food AI.
                </p>
                <Button variant="link" className="text-primary p-0 hover:text-primary/80">
                  Ask Food AI <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            <div className="text-center mt-10">
              <Link href="/recipe-result">
                <Button className="bg-primary text-white hover:bg-primary/90 px-8 py-3">
                  Try All Food AI Tools <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="w-[85%] max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Why Choose Our <span className="text-primary">Food AI</span> Platform?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-foreground/80">
                      <strong>Advanced Recipe Generator AI:</strong> Our cutting-edge Food AI technology creates
                      personalized recipes based on your exact preferences and dietary needs.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-foreground/80">
                      <strong>Intelligent Meal Planning:</strong> Let our Food AI create comprehensive meal plans that
                      save time and reduce food waste.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-foreground/80">
                      <strong>24/7 Cooking Assistant:</strong> Get instant help from our Recipe Generator AI for cooking
                      techniques, substitutions, and troubleshooting.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">External Resources & Partners</h3>
                  <div className="space-y-2">
                    <a
                      href="https://www.nutrition.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:text-primary/80 underline"
                    >
                      Nutrition.gov - Official Nutrition Information
                    </a>
                    <a
                      href="https://www.foodsafety.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:text-primary/80 underline"
                    >
                      FoodSafety.gov - Food Safety Guidelines
                    </a>
                    <a
                      href="https://www.usda.gov/topics/food-and-nutrition"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:text-primary/80 underline"
                    >
                      USDA Food & Nutrition Resources
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-primary/20">
                <h3 className="text-xl font-bold mb-4 text-center">Food AI Success Stories</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <p className="text-sm text-foreground/80 italic">
                      "CulinaAI's Recipe Generator AI helped me create amazing meals with just pantry ingredients. The
                      Food AI suggestions are incredibly accurate!"
                    </p>
                    <p className="text-xs text-foreground/60 mt-2">- Sarah M., Home Chef</p>
                  </div>
                  <div className="border-l-4 border-accent pl-4">
                    <p className="text-sm text-foreground/80 italic">
                      "The meal planning Food AI saved me hours every week. Perfect for busy families who want healthy,
                      varied meals."
                    </p>
                    <p className="text-xs text-foreground/60 mt-2">- Mike R., Father of 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
