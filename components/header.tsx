"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ChevronDown, Menu, X, ShoppingBag, Globe, Leaf, Calendar, Wine, Zap } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleDropdown = (dropdown: string) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(dropdown)
    }
  }

  const closeDropdown = () => {
    setActiveDropdown(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const dropdownElement = dropdownRefs.current[activeDropdown]
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setActiveDropdown(null)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/90 backdrop-blur-md">
      <div className="w-[85%] max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo className="text-primary" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Generate Dropdown */}
          <div className="relative" ref={(el) => (dropdownRefs.current["generate"] = el)}>
            <button
              onClick={() => toggleDropdown("generate")}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              Food AI Tools
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  activeDropdown === "generate" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeDropdown === "generate" && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-primary/20 bg-card p-2 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="grid gap-1">
                  <Link
                    href="/pantryChef"
                    onClick={closeDropdown}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Pantry Recipe AI</div>
                      <div className="text-xs text-foreground/50">Use what you have</div>
                    </div>
                  </Link>
                  <Link
                    href="/masterChef"
                    onClick={closeDropdown}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <Globe className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Global Cuisine AI</div>
                      <div className="text-xs text-foreground/50">World recipes</div>
                    </div>
                  </Link>
                  <Link
                    href="/macrosChef"
                    onClick={closeDropdown}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <Leaf className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Nutrition AI</div>
                      <div className="text-xs text-foreground/50">Healthy meals</div>
                    </div>
                  </Link>
                  <Link
                    href="/mealPlanChef"
                    onClick={closeDropdown}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Meal Planning AI</div>
                      <div className="text-xs text-foreground/50">Weekly plans</div>
                    </div>
                  </Link>
                  <Link
                    href="/pairPerfect"
                    onClick={closeDropdown}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <Wine className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Food Pairing AI</div>
                      <div className="text-xs text-foreground/50">Perfect combinations</div>
                    </div>
                  </Link>
                  <Link
                    href="/mixologyMaestro"
                    onClick={closeDropdown}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <Zap className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Cocktail AI</div>
                      <div className="text-xs text-foreground/50">Custom drinks</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/recipes"
            className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
          >
            All Recipes
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
              <div className="mb-2 px-2 text-sm font-medium">Food AI Tools</div>
              <Link
                href="/pantryChef"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span>Pantry Recipe AI</span>
              </Link>
              <Link
                href="/masterChef"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Globe className="h-4 w-4 text-primary" />
                <span>Global Cuisine AI</span>
              </Link>
              <Link
                href="/macrosChef"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Leaf className="h-4 w-4 text-primary" />
                <span>Nutrition AI</span>
              </Link>
              <Link
                href="/mealPlanChef"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Calendar className="h-4 w-4 text-primary" />
                <span>Meal Planning AI</span>
              </Link>
              <Link
                href="/pairPerfect"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Wine className="h-4 w-4 text-primary" />
                <span>Food Pairing AI</span>
              </Link>
              <Link
                href="/mixologyMaestro"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
                onClick={toggleMobileMenu}
              >
                <Zap className="h-4 w-4 text-primary" />
                <span>Cocktail AI</span>
              </Link>
            </div>

            <Link
              href="/recipes"
              className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
              onClick={toggleMobileMenu}
            >
              All Recipes
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
