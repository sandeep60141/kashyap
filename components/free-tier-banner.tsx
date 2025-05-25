"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import Link from "next/link"

export function FreeTierBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  return (
    <div className="bg-secondary/30 border border-primary/20 rounded-lg p-4 mb-6 relative">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-primary">Free Tier Limitations</h3>
          <p className="text-sm text-foreground/80 mt-1">
            You're using the free tier which has limited generations per day. For unlimited access and premium features,
            consider upgrading to a paid plan.
          </p>
          <div className="mt-3">
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-foreground/60 hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default FreeTierBanner
