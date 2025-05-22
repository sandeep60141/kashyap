"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Check, Trash, Download } from "lucide-react"

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
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowList(!showList)}
        className="flex items-center gap-1 border-primary/30 text-primary hover:bg-primary/10"
      >
        <ShoppingBag className="h-4 w-4" />
        Shopping List
      </Button>

      {showList && (
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="font-medium text-primary mb-2">Shopping List for {recipeName}</h3>
          {shoppingList.length > 0 ? (
            <div className="space-y-2">
              <ul className="space-y-1">
                {shoppingList.map((item, index) => (
                  <li key={index} className="flex items-center justify-between gap-2">
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
                      className="text-foreground/60 hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between pt-2 border-t border-primary/10">
                <span className="text-xs text-foreground/60">
                  {shoppingList.filter((item) => item.checked).length} of {shoppingList.length} items checked
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadList}
                  className="text-xs text-primary hover:bg-primary/10"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download List
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground/60">No ingredients available</p>
          )}
        </div>
      )}
    </div>
  )
}
