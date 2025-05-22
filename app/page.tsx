import Link from "next/link"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center">
        <div className="container px-4 md:px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-primary">Culina</span>AI
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto">
            AI-Powered Recipe Generation & Cooking Assistant
          </p>

          <div className="max-w-3xl mx-auto bg-card rounded-xl p-8 shadow-lg border border-primary/20">
            <div className="flex mb-6 overflow-hidden rounded-lg">
              <button className="flex-1 py-2 px-4 tab-active">Generate Recipe</button>
              <button className="flex-1 py-2 px-4 tab-inactive">Meal Planning</button>
              <button className="flex-1 py-2 px-4 tab-inactive">Ask ChefGPT</button>
            </div>

            <div className="mb-6">
              <textarea
                className="w-full input-primary min-h-[120px]"
                placeholder="Tell us what ingredients you have, your dietary preferences, or what type of meal you want to make..."
              ></textarea>
            </div>

            <div className="mb-6">
              <p className="text-left mb-2 text-foreground/80">Select Cuisine Style</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-lg bg-primary text-white">Italian</button>
                <button className="px-4 py-2 rounded-lg bg-secondary text-white/80 hover:bg-secondary/80">
                  Mexican
                </button>
                <button className="px-4 py-2 rounded-lg bg-secondary text-white/80 hover:bg-secondary/80">Asian</button>
                <button className="px-4 py-2 rounded-lg bg-secondary text-white/80 hover:bg-secondary/80">
                  Mediterranean
                </button>
                <button className="px-4 py-2 rounded-lg bg-secondary text-white/80 hover:bg-secondary/80">
                  American
                </button>
                <button className="px-4 py-2 rounded-lg bg-secondary text-white/80 hover:bg-secondary/80">
                  Indian
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <Link href="/recipe-result">
                <button className="btn-generate">Generate Recipe</button>
              </Link>
            </div>

            <p className="text-xs text-foreground/60 mt-4">Pro tip: Press Ctrl+Enter to generate</p>
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
            <div className="feature-card">
              <FileDown className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Download as PDF</h3>
              <p className="text-foreground/80 mb-4">Save your recipes for offline viewing or printing.</p>
            </div>

            <div className="feature-card">
              <ShoppingBag className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Shopping List</h3>
              <p className="text-foreground/80 mb-4">Automatically generate shopping lists from your recipes.</p>
            </div>

            <div className="feature-card">
              <Link2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Copy Recipe Link</h3>
              <p className="text-foreground/80 mb-4">Share your favorite recipes with friends and family.</p>
            </div>

            <div className="feature-card">
              <MessageSquare className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Ask ChefGPT</h3>
              <p className="text-foreground/80 mb-4">Get answers to your cooking questions instantly.</p>
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
