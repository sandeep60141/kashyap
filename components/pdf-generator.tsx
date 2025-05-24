"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import { useToast } from "@/hooks/use-toast"

interface PdfGeneratorProps {
  contentId?: string
  fileName: string
  recipe: any
}

export function PDFGenerator({ fileName, recipe }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generatePdf = async () => {
    setIsGenerating(true)

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Set font styles
      doc.setFont("helvetica", "bold")
      doc.setFontSize(24)
      doc.setTextColor(28, 157, 85) // Primary green color

      // Add title
      doc.text(recipe.title || "Recipe", 20, 20)

      // Add description
      if (recipe.description) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60)

        const descriptionLines = doc.splitTextToSize(recipe.description, 170)
        doc.text(descriptionLines, 20, 30)
      }

      // Add recipe details
      let yPos = 50

      // Add cooking time, servings, difficulty
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      const details = []
      if (recipe.prepTime) details.push(`Prep Time: ${recipe.prepTime}`)
      if (recipe.cookTime) details.push(`Cook Time: ${recipe.cookTime}`)
      if (recipe.servings) details.push(`Servings: ${recipe.servings}`)
      if (recipe.difficulty) details.push(`Difficulty: ${recipe.difficulty}`)

      doc.text(details.join(" | "), 20, yPos)
      yPos += 10

      // Add ingredients section
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.setTextColor(28, 157, 85) // Primary green color
      doc.text("Ingredients", 20, yPos)
      yPos += 8

      // Add ingredients list
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)

      const ingredients = recipe.ingredients || []
      if (Array.isArray(ingredients)) {
        ingredients.forEach((ingredient) => {
          const ingredientText =
            typeof ingredient === "string"
              ? ingredient
              : `${ingredient.amount ? `${ingredient.amount} ` : ""}${ingredient.name}`

          doc.text(`• ${ingredientText}`, 25, yPos)
          yPos += 6

          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
        })
      }

      yPos += 5

      // Add instructions section
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.setTextColor(28, 157, 85) // Primary green color
      doc.text("Instructions", 20, yPos)
      yPos += 8

      // Add instructions list
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)

      const instructions = recipe.instructions || []
      if (Array.isArray(instructions)) {
        instructions.forEach((instruction, index) => {
          const instructionText = typeof instruction === "string" ? instruction : instruction.description

          const stepText = `${index + 1}. ${instructionText}`
          const lines = doc.splitTextToSize(stepText, 165)

          doc.text(lines, 20, yPos)
          yPos += 6 * lines.length + 2

          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
        })
      } else if (typeof instructions === "string") {
        const instructionLines = instructions.split("\n").filter(Boolean)
        instructionLines.forEach((instruction, index) => {
          const stepText = `${index + 1}. ${instruction}`
          const lines = doc.splitTextToSize(stepText, 165)

          doc.text(lines, 20, yPos)
          yPos += 6 * lines.length + 2

          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
        })
      }

      // Add nutrition info if available
      if (recipe.nutritionalInfo) {
        yPos += 5

        // Check if we need a new page
        if (yPos > 240) {
          doc.addPage()
          yPos = 20
        }

        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.setTextColor(28, 157, 85) // Primary green color
        doc.text("Nutrition Information", 20, yPos)
        yPos += 8

        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60)

        const nutritionInfo = recipe.nutritionalInfo
        if (nutritionInfo.calories) doc.text(`Calories: ${nutritionInfo.calories}`, 25, yPos)
        yPos += 6
        if (nutritionInfo.protein) doc.text(`Protein: ${nutritionInfo.protein}`, 25, yPos)
        yPos += 6
        if (nutritionInfo.carbs) doc.text(`Carbohydrates: ${nutritionInfo.carbs}`, 25, yPos)
        yPos += 6
        if (nutritionInfo.fat) doc.text(`Fat: ${nutritionInfo.fat}`, 25, yPos)
        yPos += 6
      }

      // Add food safety tips if available
      if (recipe.foodSafetyTips && recipe.foodSafetyTips.length > 0) {
        yPos += 5

        // Check if we need a new page
        if (yPos > 240) {
          doc.addPage()
          yPos = 20
        }

        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.setTextColor(220, 53, 69) // Red color for safety
        doc.text("Food Safety Tips", 20, yPos)
        yPos += 8

        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        doc.setTextColor(220, 53, 69) // Red color for safety

        recipe.foodSafetyTips.forEach((tip) => {
          const lines = doc.splitTextToSize(`• ${tip}`, 165)
          doc.text(lines, 20, yPos)
          yPos += 6 * lines.length + 2

          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
        })
      }

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFont("helvetica", "italic")
        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150)
        doc.text(`Generated by ChefGPT - Page ${i} of ${pageCount}`, 20, 285)
      }

      // Save the PDF
      doc.save(`${fileName}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Your recipe has been downloaded as a PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={generatePdf}
      disabled={isGenerating}
      className="flex items-center gap-1 text-primary hover:bg-primary/10 px-3 py-2 rounded-lg font-medium transition-all border border-primary/30 hover:border-primary text-xs sm:text-sm"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          <span className="hidden sm:inline">Generating...</span>
        </>
      ) : (
        <>
          <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">PDF</span>
        </>
      )}
    </Button>
  )
}
