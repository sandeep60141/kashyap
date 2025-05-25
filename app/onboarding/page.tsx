"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, ChefHat, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { clearLastPath } from "@/lib/auth"

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState("free")

  useEffect(() => {
    checkUserAndProfile()
  }, [])

  const checkUserAndProfile = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      setUser(currentUser)

      const userProfile = await getUserProfile(currentUser.id)
      setProfile(userProfile)

      // If user already has a profile and has been here before, redirect to dashboard
      if (userProfile && userProfile.subscription_tier) {
        // Check if this is their first time (you could add a flag for this)
        // For now, we'll always show onboarding for new signups
      }
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetStarted = () => {
    clearLastPath() // Clear any stored paths
    router.push("/dashboard")
  }

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started with Food AI",
      features: [
        "10 recipe generations per month",
        "3-day meal plans maximum",
        "5 Ask Food AI questions per month",
        "Basic recipe export (PDF)",
        "Community support",
      ],
      badge: "Current Plan",
      badgeColor: "bg-green-100 text-green-800",
      popular: false,
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: "$9.99",
      period: "/month",
      description: "Unlimited access to all Food AI features",
      features: [
        "Unlimited recipe generations",
        "30-day meal plans",
        "Unlimited Ask Food AI questions",
        "Advanced recipe export options",
        "Priority support",
        "Early access to new features",
        "Custom dietary preferences",
        "Shopping list integration",
      ],
      badge: "Upgrade Available",
      badgeColor: "bg-purple-100 text-purple-800",
      popular: true,
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-[90%] max-w-4xl mx-auto py-12 px-4">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ChefHat className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">
              <span className="text-primary">Welcome to Food AI!</span>
            </h1>
            <Sparkles className="h-8 w-8 text-accent" />
          </div>

          <p className="text-xl text-gray-600 mb-4">
            Hi {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there"}! 👋
          </p>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Your account has been created successfully. You're all set to start generating amazing recipes with our
            AI-powered platform!
          </p>
        </div>

        {/* Account Status */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Account Successfully Created!</h3>
                <p className="text-green-600">
                  You've been automatically enrolled in our <strong>Free Plan</strong> with 10 recipe generations per
                  month.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Choose Your Plan</h2>
          <p className="text-center text-gray-600 mb-8">
            You can always upgrade or change your plan later from your profile settings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id ? "ring-2 ring-primary border-primary" : "hover:shadow-lg border-gray-200"
                } ${plan.popular ? "border-purple-300" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-3 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <Badge className={plan.badgeColor}>{plan.badge}</Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === "premium" && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push("/pricing")
                      }}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  )}
                </CardContent>

                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Start Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🚀 Quick Start Tips</CardTitle>
            <CardDescription>Get the most out of your Food AI experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <ChefHat className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Generate Recipes</h4>
                <p className="text-sm text-gray-600">
                  Describe what you want to cook and let our AI create the perfect recipe
                </p>
              </div>
              <div className="text-center p-4">
                <Sparkles className="h-8 w-8 text-accent mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Ask Food AI</h4>
                <p className="text-sm text-gray-600">Get instant answers to cooking questions and techniques</p>
              </div>
              <div className="text-center p-4">
                <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Plan Meals</h4>
                <p className="text-sm text-gray-600">Create comprehensive meal plans for any number of days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Started Button */}
        <div className="text-center">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 px-8 py-3 text-lg"
          >
            Get Started with Food AI
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            You can access your profile and upgrade your plan anytime from the header menu.
          </p>
        </div>
      </div>
    </div>
  )
}
