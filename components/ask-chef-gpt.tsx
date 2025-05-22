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
      const response = await fetch("/api/quick-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: question,
          recipeName: recipe.title,
          recipeData: {
            title: recipe.title,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            cookTime: recipe.cookTime,
            prepTime: recipe.prepTime,
            difficulty: recipe.difficulty,
          },
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
    <div>
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
          className="w-full bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
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
