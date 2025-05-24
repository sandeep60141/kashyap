"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link, Check, Loader2 } from "lucide-react"

interface CopyRecipeLinkProps {
  recipe: any
}

export function CopyRecipeLink({ recipe }: CopyRecipeLinkProps) {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCopy = async () => {
    setIsLoading(true)

    try {
      // Create a shareable link - in a real app, this would be a proper URL
      // For now, we'll just create a dummy URL with the recipe title
      const shareableLink = `${window.location.origin}/shared-recipe?name=${encodeURIComponent(
        recipe.title || "Recipe",
      )}&id=latest`

      await navigator.clipboard.writeText(shareableLink)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      disabled={isLoading}
      className="flex items-center gap-1 text-primary hover:bg-primary/10 px-3 py-2 rounded-lg font-medium transition-all border border-primary/30 hover:border-primary text-xs sm:text-sm"
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
      ) : copied ? (
        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
      ) : (
        <Link className="h-3 w-3 sm:h-4 sm:w-4" />
      )}
      <span className="hidden sm:inline">{copied ? "Copied!" : "Link"}</span>
    </Button>
  )
}
