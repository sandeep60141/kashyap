"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChefHat, Clock, CookingPot, Heart, Sparkles, Utensils, Zap, Star, Users, Rocket } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: "Basic",
      description: "Perfect for casual home cooks",
      subtitle: "FREE FOREVER",
      badge: "No Credit Card Required",
      icon: <Utensils className="h-8 w-8 text-blue-500" />,
      price: { monthly: 0, annual: 0 },
      features: [
        "10 AI recipe generations per month",
        "Basic meal plans (up to 3 days)",
        "Save 5 recipes in cookbook",
        "Save 5 items in shopping list",
        "Access to PantryChef mode",
        "Basic recipe customization",
        "Community support",
      ],
      cta: "Get Started Free",
      ctaLink: "/signup",
      popular: false,
    },
    {
      name: "Pro",
      description: "Your Digital Personal Chef",
      subtitle: "MOST POPULAR",
      badge: "Best Value",
      icon: <ChefHat className="h-8 w-8 text-white" />,
      price: { monthly: 2.99, annual: 2.39 },
      features: [
        "Unlimited AI recipe generations",
        "Advanced meal plans (up to 30 days)",
        "Unlimited cookbook & shopping lists",
        "All cooking modes (PantryChef, MasterChef, etc.)",
        "Advanced recipe customization",
        "Nutritional analysis & tracking",
        "Recipe history & favorites",
        "Daily meal plan tracking",
        "No advertisements",
        "Priority email support",
        "Export recipes to PDF",
        "Share recipes with friends",
      ],
      cta: "Upgrade to Pro",
      ctaLink: "/signup?plan=pro",
      popular: true,
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Home Cook",
      avatar: "/diverse-woman-avatar.png",
      content:
        "ChefGPT has completely transformed my cooking! I've discovered so many new recipes and my family loves the variety.",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Food Blogger",
      avatar: "/man-avatar.png",
      content:
        "The AI recipe generator is incredibly smart. It understands my dietary needs and creates perfect meal plans every time.",
      rating: 5,
    },
    {
      name: "Lisa Park",
      role: "Busy Mom",
      avatar: "/asian-woman-avatar.png",
      content: "Meal planning used to take hours. Now it takes minutes! The shopping list feature is a game-changer.",
      rating: 5,
    },
  ]

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "AI-Powered Recipe Generation",
      description:
        "Create unlimited personalized recipes based on your ingredients, dietary preferences, and cooking style.",
    },
    {
      icon: <CookingPot className="h-6 w-6 text-primary" />,
      title: "Smart Meal Planning",
      description:
        "Generate complete meal plans for days or weeks with automatic shopping lists and nutritional tracking.",
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: "Dietary Customization",
      description: "Support for all dietary needs including vegan, keto, gluten-free, and custom restrictions.",
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Time-Saving Tools",
      description: "Cooking mode, step-by-step instructions, and timer integration to make cooking effortless.",
    },
  ]

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="container-custom text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="block">Choose Your</span>
          <span className="block gradient-text">Culinary Journey</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          From casual cooking to culinary mastery, find the perfect plan to transform your kitchen experience with
          AI-powered recipe generation.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="relative bg-secondary rounded-full p-1 flex shadow-lg border">
            <button
              type="button"
              className={`relative rounded-full py-3 px-6 text-sm font-medium transition-all ${
                !annual ? "bg-primary text-white shadow-md" : "text-foreground hover:text-primary"
              }`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`relative rounded-full py-3 px-6 text-sm font-medium transition-all ${
                annual ? "bg-primary text-white shadow-md" : "text-foreground hover:text-primary"
              }`}
              onClick={() => setAnnual(true)}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="container-custom mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-2xl border-2 border-green-400"
                  : "bg-card border-2 border-border shadow-lg hover:shadow-xl"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    {plan.subtitle}
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-2xl mb-4 ${plan.popular ? "bg-white/20" : "bg-primary/10"}`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm font-medium mb-1 ${plan.popular ? "text-green-100" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    plan.popular ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  {plan.badge}
                </span>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold">${annual ? plan.price.annual : plan.price.monthly}</span>
                  <span className={`ml-2 text-lg ${plan.popular ? "text-green-100" : "text-muted-foreground"}`}>
                    /month
                  </span>
                </div>
                {annual && plan.price.monthly > 0 && (
                  <p className={`text-sm ${plan.popular ? "text-green-200" : "text-green-600"}`}>
                    Save ${((plan.price.monthly - plan.price.annual) * 12).toFixed(0)} per year
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <Link href={plan.ctaLink} className="block mb-8">
                <Button
                  className={`w-full py-4 text-lg font-semibold rounded-xl transition-all ${
                    plan.popular
                      ? "bg-white text-green-600 hover:bg-gray-100 shadow-lg"
                      : "bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Features */}
              <div>
                <h4 className={`font-semibold mb-4 ${plan.popular ? "text-white" : "text-foreground"}`}>
                  Everything included:
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-green-200" : "text-green-500"}`}
                      />
                      <span className={`text-sm ${plan.popular ? "text-green-50" : "text-foreground"}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="container-custom mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ChefGPT?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the powerful features that make ChefGPT the ultimate AI cooking companion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card text-center">
              <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container-custom mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Home Cooks Everywhere</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of satisfied users who've transformed their cooking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="feature-card">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="container-custom mb-20">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold text-primary">50K+</span>
              </div>
              <p className="text-muted-foreground">Happy Users</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CookingPot className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold text-primary">1M+</span>
              </div>
              <p className="text-muted-foreground">Recipes Generated</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold text-primary">4.9/5</span>
              </div>
              <p className="text-muted-foreground">User Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container-custom mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about ChefGPT</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
          <div className="feature-card">
            <h3 className="text-lg font-semibold mb-3">How does the AI recipe generation work?</h3>
            <p className="text-muted-foreground">
              Our AI analyzes your ingredients, dietary preferences, and cooking style to create personalized recipes.
              The more you use it, the better it gets at understanding your tastes.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="text-lg font-semibold mb-3">Can I cancel my Pro subscription anytime?</h3>
            <p className="text-muted-foreground">
              Yes! You can cancel your Pro subscription at any time. You'll continue to have Pro access until the end of
              your billing period, then automatically switch to the Basic plan.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="text-lg font-semibold mb-3">What dietary restrictions are supported?</h3>
            <p className="text-muted-foreground">
              We support all major dietary restrictions including vegan, vegetarian, keto, paleo, gluten-free,
              dairy-free, and many more. You can also set custom restrictions.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="text-lg font-semibold mb-3">Do I need to provide my own ingredients?</h3>
            <p className="text-muted-foreground">
              You can either input ingredients you have (PantryChef mode) or let our AI suggest complete recipes with
              shopping lists. Both options work great!
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container-custom text-center">
        <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-white">
          <Rocket className="h-12 w-12 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Cooking?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of home cooks who've discovered the joy of AI-powered recipe creation. Start your culinary
            journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl">
                Start Free Today
              </Button>
            </Link>
            <Link href="/signup?plan=pro">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl"
              >
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
