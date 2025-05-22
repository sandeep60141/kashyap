import { Search, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function TrendingSearches() {
  // These would typically come from an API in a real app
  const trendingSearches = [
    "Summer salads",
    "Quick dinner ideas",
    "Vegetarian pasta",
    "Air fryer recipes",
    "Healthy breakfast",
    "Gluten-free desserts",
    "One-pot meals",
    "Keto-friendly",
  ]

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-medium text-gray-700">Trending Searches</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {trendingSearches.map((term, index) => (
          <Link
            href={`/search?q=${encodeURIComponent(term)}`}
            key={index}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors flex items-center"
          >
            <Search className="h-3 w-3 mr-1 text-gray-400" />
            {term}
          </Link>
        ))}
      </div>
    </div>
  )
}
