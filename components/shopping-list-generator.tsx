"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ShoppingBag, Check, Printer, Download, Share2 } from "lucide-react"

interface Ingredient {
  name: string
  amount: string
  checked?: boolean
}

interface ShoppingListGeneratorProps {
  ingredients: Ingredient[]
  recipeName: string
}

export default function ShoppingListGenerator({ ingredients, recipeName }: ShoppingListGeneratorProps) {
  const [shoppingList, setShoppingList] = useState<Ingredient[]>(ingredients.map((ing) => ({ ...ing, checked: false })))
  const [dialogOpen, setDialogOpen] = useState(false)

  const toggleIngredient = (index: number) => {
    const newList = [...shoppingList]
    newList[index].checked = !newList[index].checked
    setShoppingList(newList)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const uncheckedItems = shoppingList.filter((item) => !item.checked)

    printWindow.document.write(`
      <html>
        <head>
          <title>Shopping List for ${recipeName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #800080; } /* Purple color */
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            .amount { color: #6b7280; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>Shopping List for ${recipeName}</h1>
          <p>Total items: ${uncheckedItems.length}</p>
          <ul>
            ${uncheckedItems
              .map(
                (item) => `
              <li>
                ${item.name} <span class="amount">(${item.amount})</span>
              </li>
            `,
              )
              .join("")}
          </ul>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  const handleShare = async () => {
    const uncheckedItems = shoppingList.filter((item) => !item.checked)
    const text = `Shopping List for ${recipeName}:

${uncheckedItems.map((item) => `• ${item.name} (${item.amount})`).join("\n")}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Shopping List for ${recipeName}`,
          text: text,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard
        .writeText(text)
        .then(() => alert("Shopping list copied to clipboard!"))
        .catch((err) => console.error("Failed to copy:", err))
    }
  }

  const handleDownload = () => {
    const uncheckedItems = shoppingList.filter((item) => !item.checked)
    const text = `Shopping List for ${recipeName}:

${uncheckedItems.map((item) => `• ${item.name} (${item.amount})`).join("\n")}`

    const element = document.createElement("a")
    const file = new Blob([text], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `shopping-list-${recipeName.replace(/\s+/g, "-").toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          Shopping List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Shopping List for {recipeName}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto py-4">
          {shoppingList.length === 0 ? (
            <p className="text-center text-gray-500">No ingredients found</p>
          ) : (
            <ul className="space-y-2">
              {shoppingList.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <button
                    onClick={() => toggleIngredient(index)}
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border ${
                      ingredient.checked
                        ? "bg-primary border-primary flex items-center justify-center"
                        : "border-primary/30"
                    }`}
                  >
                    {ingredient.checked && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <span className={ingredient.checked ? "line-through text-gray-400" : ""}>
                    <span className="font-medium">{ingredient.name}</span>
                    <span className="text-gray-500 text-sm"> ({ingredient.amount})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
