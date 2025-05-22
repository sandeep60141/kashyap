import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function RecipeOfDay() {
  // In a real app, this would be fetched from an API
  const recipe = {
    title: "Lemon Herb Roasted Chicken",
    image: "/placeholder.svg?height=400&width=600&query=lemon%20herb%20roasted%20chicken%20with%20vegetables",
    description:
      "Tender roasted chicken with fresh herbs, lemon, and seasonal vegetables. A perfect weeknight dinner that's both healthy and flavorful.",
    prepTime: "15 min",
    cookTime: "45 min",
    difficulty: "Medium",
    tags: ["Dinner", "Healthy", "High-Protein"],
  }

  return (
    <Card className="overflow-hidden shadow-lg border-0">
      <div className="relative h-64 md:h-80">
        <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <div className="flex gap-2 mb-2">
            {recipe.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-indigo-500/80 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-2xl font-bold mb-1">{recipe.title}</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Prep: {recipe.prepTime}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Cook: {recipe.cookTime}</span>
            </div>
            <div className="flex items-center">
              <ChefHat className="h-4 w-4 mr-1" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-indigo-800 mb-2">Recipe of the Day</h2>
        <p className="text-gray-600 mb-4">{recipe.description}</p>
        <Link href="/recipe-result">
          <Button className="w-full">
            View Recipe
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
