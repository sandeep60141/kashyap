"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import {
  ChevronDown,
  Menu,
  X,
  ShoppingBag,
  Globe,
  Leaf,
  Calendar,
  Wine,
  Zap,
  FileDown,
  MessageSquare,
  Link2,
  Coffee,
  Utensils,
  Soup,
  Cake,
  Apple,
} from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleDropdownEnter = (dropdown: string) => {
    setActiveDropdown(dropdown)
  }

  const handleDropdownLeave = () => {
    // Add a small delay before hiding to prevent accidental closes
    setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  const handleDropdownStay = () => {
    // Keep dropdown open when hovering over it
    if (activeDropdown) {
      setActiveDropdown(activeDropdown)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Logo className="text-primary" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Generate Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("generate")}
            onMouseLeave={handleDropdownLeave}
          >
            <button className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10">
              Generate
              <ChevronDown
                className={`h-4 w-4 transition-transform ${activeDropdown === "generate" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute left-0 top-full mt-1 w-64 rounded-xl border border-primary/20 bg-card p-2 shadow-lg transition-all duration-200 ${
                activeDropdown === "generate"
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2 pointer-events-none"
              }`}
              onMouseEnter={handleDropdownStay}
              onMouseLeave={handleDropdownLeave}
            >
              <div className="grid gap-1">
                <Link
                  href="/pantryChef"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Pantry Recipes</div>
                    <div className="text-xs text-foreground/50">Use what you have</div>
                  </div>
                </Link>
                <Link
                  href="/masterChef"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Globe className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Cuisine Explorer</div>
                    <div className="text-xs text-foreground/50">Global recipes</div>
                  </div>
                </Link>
                <Link
                  href="/macrosChef"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Leaf className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Nutrition Focus</div>
                    <div className="text-xs text-foreground/50">Macro-friendly meals</div>
                  </div>
                </Link>
                <Link
                  href="/mealPlanChef"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Meal Planning</div>
                    <div className="text-xs text-foreground/50">Weekly meal plans</div>
                  </div>
                </Link>
                <Link
                  href="/pairPerfect"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Wine className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Food Pairing</div>
                    <div className="text-xs text-foreground/50">Perfect combinations</div>
                  </div>
                </Link>
                <Link
                  href="/mixologyMaestro"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Zap className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Cocktail Creator</div>
                    <div className="text-xs text-foreground/50">Custom drinks</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Tools Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("tools")}
            onMouseLeave={handleDropdownLeave}
          >
            <button className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10">
              Tools
              <ChevronDown
                className={`h-4 w-4 transition-transform ${activeDropdown === "tools" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute left-0 top-full mt-1 w-64 rounded-xl border border-primary/20 bg-card p-2 shadow-lg transition-all duration-200 ${
                activeDropdown === "tools"
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2 pointer-events-none"
              }`}
              onMouseEnter={handleDropdownStay}
              onMouseLeave={handleDropdownLeave}
            >
              <div className="grid gap-1">
                <Link
                  href="/recipe-result"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <FileDown className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Download as PDF</div>
                    <div className="text-xs text-foreground/50">Save recipes offline</div>
                  </div>
                </Link>
                <Link
                  href="/recipe-result"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Shopping List</div>
                    <div className="text-xs text-foreground/50">Generate from recipes</div>
                  </div>
                </Link>
                <Link
                  href="/recipe-result"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Link2 className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Share Recipes</div>
                    <div className="text-xs text-foreground/50">Copy shareable links</div>
                  </div>
                </Link>
                <Link
                  href="/recipe-result"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Ask ChefGPT</div>
                    <div className="text-xs text-foreground/50">Recipe questions</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Meal Types Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("mealtypes")}
            onMouseLeave={handleDropdownLeave}
          >
            <button className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10">
              Meal Types
              <ChevronDown
                className={`h-4 w-4 transition-transform ${activeDropdown === "mealtypes" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute left-0 top-full mt-1 w-64 rounded-xl border border-primary/20 bg-card p-2 shadow-lg transition-all duration-200 ${
                activeDropdown === "mealtypes"
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2 pointer-events-none"
              }`}
              onMouseEnter={handleDropdownStay}
              onMouseLeave={handleDropdownLeave}
            >
              <div className="grid gap-1">
                <Link
                  href="/search?type=breakfast"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Coffee className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Breakfast</div>
                    <div className="text-xs text-foreground/50">Morning meals</div>
                  </div>
                </Link>
                <Link
                  href="/search?type=lunch"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Utensils className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Lunch</div>
                    <div className="text-xs text-foreground/50">Midday meals</div>
                  </div>
                </Link>
                <Link
                  href="/search?type=dinner"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Soup className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Dinner</div>
                    <div className="text-xs text-foreground/50">Evening meals</div>
                  </div>
                </Link>
                <Link
                  href="/search?type=dessert"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Cake className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Dessert</div>
                    <div className="text-xs text-foreground/50">Sweet treats</div>
                  </div>
                </Link>
                <Link
                  href="/search?type=snack"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <Apple className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Snack</div>
                    <div className="text-xs text-foreground/50">Light bites</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/recipes"
            className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
          >
            Recipes
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary text-white hover:bg-primary/90">Sign up</Button>
          </Link>
          <button className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-primary/20">
          <div className="space-y-1 px-4 py-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <div className="mb-2 px-2 text-sm font-medium">Generate</div>
              <Link
                href="/pantryChef"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span>Pantry Recipes</span>
              </Link>
              <Link
                href="/masterChef"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Globe className="h-4 w-4 text-primary" />
                <span>Cuisine Explorer</span>
              </Link>
              <Link
                href="/macrosChef"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Leaf className="h-4 w-4 text-primary" />
                <span>Nutrition Focus</span>
              </Link>
              <Link
                href="/mealPlanChef"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Calendar className="h-4 w-4 text-primary" />
                <span>Meal Planning</span>
              </Link>
              <Link
                href="/pairPerfect"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Wine className="h-4 w-4 text-primary" />
                <span>Food Pairing</span>
              </Link>
              <Link
                href="/mixologyMaestro"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Zap className="h-4 w-4 text-primary" />
                <span>Cocktail Creator</span>
              </Link>
            </div>

            <div className="rounded-lg bg-primary/10 p-2 mt-2">
              <div className="mb-2 px-2 text-sm font-medium">Tools</div>
              <Link
                href="/recipe-result"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <FileDown className="h-4 w-4 text-primary" />
                <span>Download as PDF</span>
              </Link>
              <Link
                href="/recipe-result"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span>Shopping List</span>
              </Link>
              <Link
                href="/recipe-result"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Link2 className="h-4 w-4 text-primary" />
                <span>Share Recipes</span>
              </Link>
              <Link
                href="/recipe-result"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>Ask ChefGPT</span>
              </Link>
            </div>

            <div className="rounded-lg bg-primary/10 p-2 mt-2">
              <div className="mb-2 px-2 text-sm font-medium">Meal Types</div>
              <Link
                href="/search?type=breakfast"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Coffee className="h-4 w-4 text-primary" />
                <span>Breakfast</span>
              </Link>
              <Link
                href="/search?type=lunch"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Utensils className="h-4 w-4 text-primary" />
                <span>Lunch</span>
              </Link>
              <Link
                href="/search?type=dinner"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Soup className="h-4 w-4 text-primary" />
                <span>Dinner</span>
              </Link>
              <Link
                href="/search?type=dessert"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Cake className="h-4 w-4 text-primary" />
                <span>Dessert</span>
              </Link>
              <Link
                href="/search?type=snack"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Apple className="h-4 w-4 text-primary" />
                <span>Snack</span>
              </Link>
            </div>

            <Link
              href="/recipes"
              className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
              onClick={toggleMobileMenu}
            >
              Recipes
            </Link>
            <Link
              href="/pricing"
              className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
              onClick={toggleMobileMenu}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
              onClick={toggleMobileMenu}
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
