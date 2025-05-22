"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "lucide-react"

interface CopyRecipeLinkProps {
  recipe: any
}

export default function CopyRecipeLink({ recipe }: CopyRecipeLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    // Create a shareable link - in a real app, this would be a proper URL
    // For now, we'll just create a dummy URL with the recipe title
    const shareableLink = `${window.location.origin}/shared-recipe?title=${encodeURIComponent(
      recipe.title || "Recipe",
    )}`

    navigator.clipboard.writeText(shareableLink)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="flex items-center gap-1 border-primary/30 text-primary hover:bg-primary/10"
    >
      <Link className="h-4 w-4" />
      {copied ? "Link Copied!" : "Copy Recipe Link"}
    </Button>
  )
}
