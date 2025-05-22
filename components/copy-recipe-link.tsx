"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CopyRecipeLinkProps {
  recipeId?: string
  recipeName: string
}

export default function CopyRecipeLink({ recipeId, recipeName }: CopyRecipeLinkProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopyLink = () => {
    // In a real app, this would use a unique recipe ID
    // For now, we'll create a shareable link with the recipe name in the URL
    const shareableLink = `${window.location.origin}/shared-recipe?name=${encodeURIComponent(recipeName)}&id=${
      recipeId || "latest"
    }`

    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        setCopied(true)
        toast({
          title: "Link copied!",
          description: "Recipe link has been copied to clipboard",
        })

        // Reset the copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy link:", err)
        toast({
          title: "Failed to copy link",
          description: "Please try again",
          variant: "destructive",
        })
      })
  }

  return (
    <Button onClick={handleCopyLink} variant="outline" className="flex items-center gap-2">
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <Link className="h-4 w-4" />
          Copy Link
        </>
      )}
    </Button>
  )
}
