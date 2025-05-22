"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"

interface AskChefGPTProps {
  recipe: any
}

export default function AskChefGPT({ recipe }: AskChefGPTProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setAnswer(null)
    setError(null)

    try {
      // Log the recipe data to ensure it's being passed correctly
      console.log("Sending recipe data:", JSON.stringify(recipe).substring(0, 100) + "...")

      const response = await fetch("/api/quick-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: question,
          recipeName: recipe.title,
          // Send the complete recipe object
          recipeData: recipe,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.status}`)
      }

      const data = await response.json()
      setAnswer(data.answer)
    } catch (error) {
      console.error("Error getting answer:", error)
      setError("Sorry, I couldn't answer that question. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-primary/20">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
        Ask Chef About This Recipe
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Ask a question about this recipe..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[80px] bg-secondary/50 border border-primary/30 rounded-lg px-4 py-3 text-foreground placeholder:text-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="w-full bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Ask Chef
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {answer && (
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm">{answer}</p>
        </div>
      )}
    </div>
  )
}
