"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { jsPDF } from "jspdf"
import { useToast } from "@/hooks/use-toast"

interface PdfGeneratorProps {
  contentId?: string
  fileName: string
  recipe: any
}

export function PdfGenerator({ fileName, recipe }: PdfGeneratorProps) {
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
      if (recipe.cookingTime) details.push(`Cooking Time: ${recipe.cookingTime}`)
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
              : `${ingredient.name}${ingredient.amount ? ` (${ingredient.amount})` : ""}`

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
      variant="outline"
      size="sm"
      onClick={generatePdf}
      disabled={isGenerating}
      className="flex items-center gap-1 border-primary/30 text-primary hover:bg-primary/10"
    >
      {isGenerating ? (
        <>
          <span className="animate-spin mr-1">⏳</span>
          Generating...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  )
}
