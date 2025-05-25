import { Heart } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Heart className="h-6 w-6 fill-primary text-primary" />
      <span className="font-bold text-xl">
        <span className="text-primary">Food</span>
        <span className="text-foreground">AI</span>
      </span>
    </Link>
  )
}
