"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, X, Printer, Copy, Check } from "lucide-react"

interface Ingredient {
  name: string
  amount?: string
  checked?: boolean
}

interface ShoppingListGeneratorProps {
  ingredients?: Ingredient[] | string[]
  recipeName?: string
}

export function ShoppingListGenerator({ ingredients = [], recipeName = "Recipe" }: ShoppingListGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shoppingList, setShoppingList] = useState<Ingredient[]>(() => {
    // Safely check if ingredients exists and has items
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return []
    }

    // Convert string[] to Ingredient[] if needed
    if (typeof ingredients[0] === "string") {
      return (ingredients as string[]).map((name) => ({ name, checked: false }))
    }

    return ingredients as Ingredient[]
  })
  const [copied, setCopied] = useState(false)

  const toggleItem = (index: number) => {
    const newList = [...shoppingList]
    newList[index].checked = !newList[index].checked
    setShoppingList(newList)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Shopping List for ${recipeName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #2e7d32; }
              ul { list-style-type: none; padding: 0; }
              li { padding: 8px 0; border-bottom: 1px solid #eee; }
              .checked { text-decoration: line-through; color: #888; }
            </style>
          </head>
          <body>
            <h1>Shopping List for ${recipeName}</h1>
            <ul>
              ${shoppingList
                .map(
                  (item) =>
                    `<li class="${item.checked ? "checked" : ""}">${item.amount ? item.amount + " " : ""}${
                      item.name
                    }</li>`,
                )
                .join("")}
            </ul>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleCopy = () => {
    const text = `Shopping List for ${recipeName}:\n\n${shoppingList
      .map((item) => `${item.amount ? item.amount + " " : ""}${item.name}`)
      .join("\n")}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Don't render if no ingredients
  if (!shoppingList || shoppingList.length === 0) {
    return (
      <Button variant="ghost" size="sm" disabled className="flex items-center gap-1 text-gray-400 cursor-not-allowed">
        <ShoppingBag className="h-4 w-4" />
        No Ingredients
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-primary hover:bg-primary/10"
      >
        <ShoppingBag className="h-4 w-4" />
        Shopping List
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Shopping List
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-white/90 text-sm mt-1">For: {recipeName}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4" id="shopping-list-content">
              {shoppingList.length === 0 ? (
                <p className="text-center text-gray-500 my-8">No ingredients found</p>
              ) : (
                <ul className="space-y-2">
                  {shoppingList.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked || false}
                        onChange={() => toggleItem(index)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span
                        className={`flex-1 ${
                          item.checked ? "line-through text-gray-400" : "text-gray-700"
                        } transition-all`}
                      >
                        {item.amount && <span className="font-medium">{item.amount} </span>}
                        {item.name || "Unknown ingredient"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
