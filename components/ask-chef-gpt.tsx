"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChefHat, Send, Loader2 } from "lucide-react"

interface AskChefGPTProps {
  recipeName: string
}

export default function AskChefGPT({ recipeName }: AskChefGPTProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Create a more focused prompt that forces a direct answer
      const prompt = `
        Answer this cooking question about "${recipeName}" directly and concisely:
        
        Question: ${question}
        
        Important: Do NOT return a recipe JSON. Only provide a direct answer to the question.
        Format your response as plain text without any JSON or code blocks.
      `

      // Use a shorter timeout for faster responses
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15-second timeout

      const response = await fetch("/api/quick-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, recipeName }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setAnswer(data.answer)
    } catch (err) {
      console.error("Error getting answer:", err)
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-primary">
          <ChefHat className="h-5 w-5" />
          Ask ChefGPT
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask a question about this recipe..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 border-primary/30 focus:border-primary focus:ring-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          {answer && (
            <div className="p-4 bg-primary/10 rounded-md">
              <h3 className="font-medium mb-2 text-primary">Answer:</h3>
              <div className="text-foreground whitespace-pre-line">{answer}</div>
            </div>
          )}

          {!answer && !error && !isLoading && (
            <div className="text-sm text-foreground/60 italic">
              Example questions: "How can I make this recipe spicier?", "What can I substitute for butter?", "How do I
              know when it's properly cooked?"
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
