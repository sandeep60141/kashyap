"use client"

import { useState, useEffect } from "react"
import { History, X } from "lucide-react"
import Link from "next/link"

export default function SearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // In a real app, this would be stored in a database or localStorage
  useEffect(() => {
    // Simulate loading search history
    setSearchHistory([
      "Vegetarian pasta recipes",
      "Quick dinner ideas",
      "Chocolate desserts",
      "Healthy breakfast",
      "Gluten-free bread",
    ])
  }, [])

  const clearHistory = () => {
    setSearchHistory([])
    // In a real app, this would clear the history from storage
  }

  const removeFromHistory = (index: number) => {
    const newHistory = [...searchHistory]
    newHistory.splice(index, 1)
    setSearchHistory(newHistory)
    // In a real app, this would remove the item from storage
  }

  if (searchHistory.length === 0) {
    return null
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
        </div>
        <button onClick={clearHistory} className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline">
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searchHistory.map((term, index) => (
          <div
            key={index}
            className="group flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
          >
            <Link href={`/search?q=${encodeURIComponent(term)}`} className="flex-1">
              {term}
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault()
                removeFromHistory(index)
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-100 rounded-full transition-opacity"
            >
              <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
