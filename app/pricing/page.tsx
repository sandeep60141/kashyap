"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChefHat, Clock, CookingPot, Flame, Sparkles, Utensils, X, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Pricing() {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      name: "Basic",
      description: "FREE FOREVER",
      subtitle: "No Credit Card Required",
      icon: <Utensils className="h-8 w-8 text-blue-500" />,
      price: { monthly: 0, annual: 0 },
      features: [
        "10 Monthly Generations",
        "Meal Plans up to 3 days",
        "Save 5 Recipes in the Cookbook",
        "Save 5 Recipes in the Shopping List",
        "Basic recipe customization",
        "Access to PantryChef mode",
        "Email support",
      ],
      limitations: [],
      cta: "Get Started",
      ctaLink: "/signup",
      popular: false,
    },
    {
      name: "Pro",
      description: "For those who need a Digital Personal Chef",
      subtitle: "",
      icon: <ChefHat className="h-8 w-8 text-white" />,
      price: { monthly: 2.99, annual: 2.39 },
      features: [
        "Unlimited Generations",
        "History mode",
        "Meal Plans up to 30 days",
        "Daily Meal Plan Tracking",
        "Unlimited Cookbook & Shopping Lists",
        "No Ads",
        "All cooking modes access",
        "Advanced recipe customization",
        "Detailed nutritional analysis",
        "Priority support",
      ],
      limitations: [],
      cta: "Get Started",
      ctaLink: "/signup?plan=pro",
      popular: true,
    },
  ]

  const businessPlans = [
    {
      name: "Restaurant",
      description: "For restaurants and professional kitchens",
      price: "Custom Pricing",
      features: [
        "Menu development assistance",
        "Seasonal recipe creation",
        "Cost optimization for ingredients",
        "Nutritional analysis for menu items",
        "Allergen identification",
        "Staff training resources",
        "White-labeled recipe cards",
      ],
    },
    {
      name: "Food Service",
      description: "For catering and food service businesses",
      price: "Custom Pricing",
      features: [
        "Bulk recipe scaling",
        "Event-specific menu planning",
        "Dietary accommodation tools",
        "Ingredient cost analysis",
        "Inventory management integration",
        "Custom API access",
        "Dedicated account manager",
      ],
    },
  ]

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
          <span className="block">Unlock the Full Power of</span>
          <span className="block text-primary">AI-Powered Cooking</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your cooking needs and transform your kitchen experience
        </p>
      </div>

      <div className="mt-12 flex justify-center">
        <div className="relative bg-card rounded-full p-1 flex shadow-md">
          <button
            type="button"
            className={`relative rounded-full py-2 text-sm font-medium whitespace-nowrap focus:outline-none px-8 ${
              !annual ? "bg-primary text-primary-foreground" : "text-foreground"
            }`}
            onClick={() => setAnnual(false)}
          >
            Monthly billing
          </button>
          <button
            type="button"
            className={`relative rounded-full py-2 text-sm font-medium whitespace-nowrap focus:outline-none px-8 ${
              annual ? "bg-primary text-primary-foreground" : "text-foreground"
            }`}
            onClick={() => setAnnual(true)}
          >
            Annual billing
            <span className="absolute -top-2 -right-12 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              Save 23%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 shadow-sm transition-all duration-200 hover:shadow-lg ${
              plan.popular
                ? "bg-green-600 text-white border-green-600 ring-2 ring-green-600 ring-opacity-50"
                : "bg-card border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                  <Zap className="mr-1 h-3 w-3" /> Most Popular
                </span>
              </div>
            )}
            <div className="flex items-center gap-4 mb-4">
              <div className={`rounded-full p-2 ${plan.popular ? "bg-white/20" : "bg-primary/10"}`}>{plan.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p className={`text-sm font-medium ${plan.popular ? "text-green-100" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
                {plan.subtitle && (
                  <p className={`text-xs ${plan.popular ? "text-green-200" : "text-muted-foreground"}`}>
                    {plan.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold">${annual ? plan.price.annual : plan.price.monthly}</span>
              <span className="ml-1 text-base font-medium text-muted-foreground">/month</span>
            </div>
            {annual && (
              <p className="text-sm text-green-600 mt-1">
                Billed annually (${(annual ? plan.price.annual : plan.price.monthly) * 12}/year)
              </p>
            )}

            <Link href={plan.ctaLink}>
              <Button
                className={`mt-8 w-full rounded-full py-6 text-base ${
                  plan.popular
                    ? "bg-white text-green-600 hover:bg-gray-100"
                    : "bg-accent hover:bg-accent/90 text-accent-foreground"
                }`}
              >
                {plan.cta}
              </Button>
            </Link>

            <div className="mt-8">
              <h3 className="text-sm font-medium">What's included</h3>
              <ul className="mt-4 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm">{feature}</p>
                  </li>
                ))}
              </ul>

              {plan.limitations.length > 0 && (
                <>
                  <h3 className="text-sm font-medium mt-8">Limitations</h3>
                  <ul className="mt-4 space-y-4">
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start">
                        <div className="flex-shrink-0 text-muted-foreground">
                          <X className="h-5 w-5" />
                        </div>
                        <p className="ml-3 text-sm text-muted-foreground">{limitation}</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-8">Business Solutions</h2>
        <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
          Specialized plans for restaurants, catering businesses, and food service companies
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {businessPlans.map((plan) => (
            <div key={plan.name} className="relative rounded-2xl border bg-card p-8 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-8 text-2xl font-bold">{plan.price}</p>
                <Link href="/contact-sales">
                  <Button className="mt-8 w-full rounded-full">Contact Sales</Button>
                </Link>
              </div>
              <div className="mt-8">
                <h3 className="text-sm font-medium">Features</h3>
                <ul className="mt-4 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-3xl px-8 py-12 sm:px-12 lg:flex lg:items-center">
        <div className="lg:w-0 lg:flex-1">
          <h3 className="text-2xl font-bold">Need a custom solution?</h3>
          <p className="mt-4 max-w-3xl text-lg">
            Our enterprise plans offer custom features, dedicated support, and specialized AI models tailored to your
            specific needs.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center">
              <CookingPot className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Custom AI models</span>
            </div>
            <div className="flex items-center">
              <Flame className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Dedicated support</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Priority processing</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">White-label options</span>
            </div>
          </div>
        </div>
        <div className="mt-8 lg:mt-0 lg:ml-8 lg:flex-shrink-0">
          <Link href="/contact-sales">
            <Button size="lg" className="w-full lg:w-auto rounded-full">
              Schedule a Demo
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-3">How many recipes can I generate?</h3>
            <p className="text-muted-foreground">
              Basic users can generate up to 10 recipes per month. Chef plan users get 100 recipes per month, while
              Master Chef users enjoy unlimited recipe generation.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-3">What's the difference between the AI models?</h3>
            <p className="text-muted-foreground">
              Standard AI (Basic plan) provides good recipe suggestions. Advanced AI (Chef plan) offers more detailed
              recipes with better customization. Premium AI (Master Chef plan) delivers restaurant-quality recipes with
              professional techniques.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-3">Can I change plans later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your subscription will take
              effect immediately, with prorated refunds for downgrades.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-3">Is there a free trial?</h3>
            <p className="text-muted-foreground">
              Yes, new users can try the Chef plan for 7 days before being charged. You can cancel anytime during the
              trial period with no obligation.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-3">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through
              Stripe with end-to-end encryption.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-3">How detailed are the meal plans?</h3>
            <p className="text-muted-foreground">
              Basic users can create simple 1-day meal plans. Chef plan users can create detailed weekly meal plans (up
              to 7 days) with nutritional information. Master Chef users get additional features like event planning and
              multi-profile meal plans.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-6">Trusted by chefs and home cooks worldwide</h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mt-8 opacity-70">
          <Image
            src="/whole-foods-logo.png"
            alt="Whole Foods"
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <Image
            src="/kitchenaid-logo.png"
            alt="KitchenAid"
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <Image
            src="/blue-apron-inspired-logo.png"
            alt="Blue Apron"
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <Image src="/vitamix-logo.png" alt="Vitamix" width={120} height={60} className="h-12 w-auto object-contain" />
        </div>
      </div>

      <div className="mt-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Still not convinced?</h2>
        <p className="text-lg text-muted-foreground mb-8">Try our Basic plan for free, no credit card required.</p>
        <Link href="/signup">
          <Button size="lg" className="rounded-full">
            Get Started Free
          </Button>
        </Link>
      </div>
    </div>
  )
}
