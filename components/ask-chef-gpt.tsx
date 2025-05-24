"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, Trash2 } from "lucide-react"

interface AskChefGPTProps {
  recipe: any
}

export function AskChefGPT({ recipe }: AskChefGPTProps) {
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
          recipeData: recipe,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.status}`)
      }

      const data = await response.json()
      setAnswer(data.answer)

      // Clear the input after successful submission
      setQuestion("")
    } catch (error) {
      console.error("Error getting answer:", error)
      setError("Sorry, I couldn't answer that question. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const clearInput = () => {
    setQuestion("")
    setAnswer(null)
    setError(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-primary/20">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-primary">
        <span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>
        Ask Chef About This Recipe
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            placeholder="Ask a question about this recipe..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[80px] bg-secondary/50 border-2 border-primary/30 rounded-lg px-4 py-3 pr-12 text-foreground placeholder:text-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          {question && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 border border-red-200 rounded-full"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="w-full bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all duration-200 border-2 border-primary hover:border-primary/90"
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
        <div className="mt-4 p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:bg-red-100 border border-red-200"
          >
            Dismiss
          </Button>
        </div>
      )}

      {answer && (
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-primary">Chef's Answer:</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAnswer(null)}
              className="h-6 w-6 p-0 hover:bg-primary/10 border border-primary/20 rounded-full"
            >
              ×
            </Button>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{answer}</p>
        </div>
      )}

      <div className="mt-3 text-xs text-foreground/60">
        <p className="italic">
          💡 Example questions: "How can I make this spicier?", "What can I substitute for [ingredient]?", "How do I
          know when it's done?"
        </p>
      </div>
    </div>
  )
}
