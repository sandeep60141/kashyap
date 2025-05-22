import Link from "next/link"
import { Logo } from "@/components/logo"
import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-card border-t border-primary/20">
      <div className="container px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Logo className="mb-4" />
          <p className="text-foreground/70 max-w-md mb-6">
            Transform your cooking with AI-powered recipes tailored to your preferences, dietary needs, and available
            ingredients.
          </p>
          <div className="flex space-x-6 mb-6">
            <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
          <div className="text-sm text-foreground/60">© {new Date().getFullYear()} CulinaAI. All rights reserved.</div>
          <div className="mt-2 text-sm text-foreground/60 flex items-center">
            Made with <Heart className="h-3 w-3 mx-1 fill-primary text-primary" /> by CulinaAI Team
          </div>
        </div>
      </div>
    </footer>
  )
}
