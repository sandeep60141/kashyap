import Link from "next/link"
import { Logo } from "@/components/logo"
import { Heart, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-card border-t border-primary/20">
      <div className="w-[85%] max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Logo className="mb-4" />
            <p className="text-foreground/70 mb-4 text-sm">
              Advanced <strong>Food AI</strong> and <strong>Recipe Generator AI</strong> platform transforming how you
              cook, plan meals, and discover new flavors.
            </p>
            <div className="space-y-2 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@culinaai.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) CULINA-AI</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Food AI Tools */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Food AI Tools</h3>
            <div className="space-y-2 text-sm">
              <Link href="/pantryChef" className="block text-foreground/70 hover:text-primary transition-colors">
                Pantry Recipe AI
              </Link>
              <Link href="/masterChef" className="block text-foreground/70 hover:text-primary transition-colors">
                Global Cuisine AI
              </Link>
              <Link href="/macrosChef" className="block text-foreground/70 hover:text-primary transition-colors">
                Nutrition AI
              </Link>
              <Link href="/mealPlanChef" className="block text-foreground/70 hover:text-primary transition-colors">
                Meal Planning AI
              </Link>
              <Link href="/pairPerfect" className="block text-foreground/70 hover:text-primary transition-colors">
                Food Pairing AI
              </Link>
              <Link href="/mixologyMaestro" className="block text-foreground/70 hover:text-primary transition-colors">
                Cocktail AI
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <div className="space-y-2 text-sm">
              <Link href="/search" className="block text-foreground/70 hover:text-primary transition-colors">
                Recipe Search
              </Link>
              <Link href="/faq" className="block text-foreground/70 hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="/pricing" className="block text-foreground/70 hover:text-primary transition-colors">
                Pricing
              </Link>
              <a
                href="https://blog.culinaai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground/70 hover:text-primary transition-colors"
              >
                Food AI Blog
              </a>
              <a
                href="https://help.culinaai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground/70 hover:text-primary transition-colors"
              >
                Help Center
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <div className="space-y-2 text-sm">
              <Link href="/about" className="block text-foreground/70 hover:text-primary transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-foreground/70 hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="block text-foreground/70 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-foreground/70 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <a
                href="https://careers.culinaai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground/70 hover:text-primary transition-colors"
              >
                Careers
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-foreground/60">
              © {new Date().getFullYear()} CulinaAI. All rights reserved. | Advanced Food AI & Recipe Generator AI
              Technology
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/CulinaAI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-primary transition-colors"
                aria-label="Follow CulinaAI on Twitter"
              >
                Twitter
              </a>
              <a
                href="https://facebook.com/CulinaAI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-primary transition-colors"
                aria-label="Follow CulinaAI on Facebook"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com/CulinaAI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-primary transition-colors"
                aria-label="Follow CulinaAI on Instagram"
              >
                Instagram
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-foreground/60 flex items-center justify-center">
              Made with <Heart className="h-3 w-3 mx-1 fill-primary text-primary" /> by CulinaAI Team
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
