"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Check, Trash, Download, X } from "lucide-react"

interface Ingredient {
  name: string
  amount?: string
  checked?: boolean
}

interface ShoppingListGeneratorProps {
  ingredients: (Ingredient | string)[]
  recipeName?: string
}

export default function ShoppingListGenerator({ ingredients, recipeName = "Recipe" }: ShoppingListGeneratorProps) {
  const [showList, setShowList] = useState(false)
  const [shoppingList, setShoppingList] = useState<Ingredient[]>(() => {
    return ingredients.map((ing) => {
      if (typeof ing === "string") {
        return { name: ing, checked: false }
      }
      return { ...ing, checked: ing.checked || false }
    })
  })

  const toggleItem = (index: number) => {
    setShoppingList((prev) => {
      const newList = [...prev]
      newList[index] = { ...newList[index], checked: !newList[index].checked }
      return newList
    })
  }

  const removeItem = (index: number) => {
    setShoppingList((prev) => prev.filter((_, i) => i !== index))
  }

  const downloadList = () => {
    const listText = shoppingList
      .map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.name}${item.amount ? ` (${item.amount})` : ""}`)
      .join("\n")

    const element = document.createElement("a")
    const file = new Blob([`Shopping List for ${recipeName}\n\n${listText}`], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `shopping-list-${recipeName.toLowerCase().replace(/\s+/g, "-")}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowList(!showList)}
        className="flex items-center gap-1 text-primary hover:bg-primary/10"
      >
        <ShoppingBag className="h-4 w-4" />
        Shopping List
      </Button>

      {showList && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowList(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Shopping List for {recipeName}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowList(false)}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              {shoppingList.length > 0 ? (
                <ul className="space-y-2">
                  {shoppingList.map((item, index) => (
                    <li key={index} className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleItem(index)}>
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            item.checked ? "bg-primary border-primary text-white" : "border-primary/30 text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className={item.checked ? "line-through text-foreground/60" : ""}>
                          {item.name}
                          {item.amount ? ` (${item.amount})` : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-foreground/60 hover:text-destructive p-1 rounded-full hover:bg-gray-100"
                        aria-label="Remove item"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-8 text-foreground/60">No ingredients available</p>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-foreground/60">
                  {shoppingList.filter((item) => item.checked).length} of {shoppingList.length} items checked
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadList}
                  className="text-primary border-primary/30 hover:bg-primary/10"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download List
                </Button>
              </div>
              <Button onClick={() => setShowList(false)} className="w-full bg-primary text-white hover:bg-primary/90">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
