"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Crown, Zap, Loader2 } from "lucide-react"
import { createCheckoutSession } from "@/lib/stripe"
import { getUserProfile } from "@/lib/auth"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const profile = await getUserProfile()
      const priceId = billingCycle === "monthly" ? "price_premium_monthly" : "price_premium_yearly"

      await createCheckoutSession(priceId, profile?.stripe_customer_id)
    } catch (error) {
      console.error("Error creating checkout session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    "Unlimited AI recipe generations",
    "Advanced meal plans (up to 30 days)",
    "Unlimited cookbook & shopping lists",
    "All cooking modes",
    "Priority support",
    "Export recipes to PDF",
    "No advertisements",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {feature && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Feature Locked</span>
              </div>
              <p className="text-sm text-muted-foreground">{feature} requires a Premium subscription.</p>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="relative bg-secondary rounded-full p-1 flex">
              <button
                type="button"
                className={`relative rounded-full py-2 px-4 text-sm font-medium transition-all ${
                  billingCycle === "monthly" ? "bg-primary text-white shadow-md" : "text-foreground"
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`relative rounded-full py-2 px-4 text-sm font-medium transition-all ${
                  billingCycle === "yearly" ? "bg-primary text-white shadow-md" : "text-foreground"
                }`}
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center">
            <div className="flex items-baseline justify-center mb-2">
              <span className="text-3xl font-bold">${billingCycle === "monthly" ? "2.99" : "2.39"}</span>
              <span className="ml-2 text-muted-foreground">/month</span>
            </div>
            {billingCycle === "yearly" && <p className="text-sm text-green-600">Save $7.20 per year</p>}
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-3">Everything included:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <Button onClick={handleUpgrade} disabled={isLoading} className="w-full" size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upgrade to Premium
          </Button>

          <p className="text-xs text-center text-muted-foreground">Cancel anytime. No questions asked.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
