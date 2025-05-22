"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { generateRecipeClient } from "@/lib/client-recipe-generator"

export default function SharedRecipe() {
  const searchParams = useSearchParams()
  const recipeName = searchParams.get("name")
  const recipeId = searchParams.get("id")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRecipe() {
      try {
        // If it's the latest recipe, we can try to get it from localStorage
        if (recipeId === "latest") {
          const storedRecipe = localStorage.getItem("generatedRecipe")
          if (storedRecipe) {
            // If we have the recipe in localStorage, redirect to recipe-result
            window.location.href = "/recipe-result"
            return
          }
        }

        // For future implementation: fetch recipe by ID from a database
        // For now, we'll generate a similar recipe based on the name
        if (recipeName) {
          setLoading(true)
          const prompt = `Create a recipe for ${recipeName}. Make it detailed and include ingredients, instructions, and nutritional information.`

          const recipe = await generateRecipeClient(prompt)
          localStorage.setItem("generatedRecipe", recipe || "No recipe generated")

          // Redirect to the recipe result page
          window.location.href = "/recipe-result"
        } else {
          setError("No recipe name provided")
          setLoading(false)
        }
      } catch (err) {
        console.error("Error loading shared recipe:", err)
        setError(`Error loading recipe: ${err instanceof Error ? err.message : String(err)}`)
        setLoading(false)
      }
    }

    loadRecipe()
  }, [recipeName, recipeId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-600">Loading recipe...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Recipe</h2>
        <p className="mb-6 text-gray-600">{error}</p>
        <Link href="/">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  return null // This will not be rendered as we redirect
}
