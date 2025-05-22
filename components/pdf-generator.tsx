"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import { toast } from "@/components/ui/use-toast"

interface PdfGeneratorProps {
  contentId: string
  fileName: string
  buttonText?: string
  recipe: any
}

export function PdfGenerator({ contentId, fileName, buttonText = "Download as PDF", recipe }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Set margins
      const margin = 15 // mm
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const contentWidth = pageWidth - 2 * margin

      // Track current Y position
      let yPos = margin

      // Helper function to add text with word wrap
      const addWrappedText = (text, x, y, maxWidth, lineHeight, style = {}) => {
        if (!text) return y

        // Set text style
        if (style.fontSize) pdf.setFontSize(style.fontSize)
        if (style.fontStyle) pdf.setFont(pdf.getFont().fontName, style.fontStyle)
        else pdf.setFont(pdf.getFont().fontName, "normal")

        // Split text into lines
        const lines = pdf.splitTextToSize(text, maxWidth)

        // Add each line
        lines.forEach((line) => {
          if (y > pageHeight - margin) {
            pdf.addPage()
            y = margin
          }
          pdf.text(line, x, y)
          y += lineHeight
        })

        // Reset font
        pdf.setFont(pdf.getFont().fontName, "normal")
        pdf.setFontSize(12)

        return y
      }

      // Helper function to check if we need a new page
      const checkForNewPage = (neededSpace) => {
        if (yPos + neededSpace > pageHeight - margin) {
          pdf.addPage()
          yPos = margin
          return true
        }
        return false
      }

      // Add title
      pdf.setFontSize(24)
      pdf.setTextColor(128, 0, 128) // Purple color for title (primary color)
      yPos = addWrappedText(recipe.title, margin, yPos, contentWidth, 10, { fontSize: 24 })
      yPos += 5

      // Add description
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      yPos = addWrappedText(recipe.description, margin, yPos, contentWidth, 6)
      yPos += 5

      // Add recipe details
      if (recipe.prepTime || recipe.cookTime || recipe.totalTime || recipe.servings) {
        // Create details table
        const detailsData = []

        if (recipe.prepTime) detailsData.push(["Prep Time:", recipe.prepTime])
        if (recipe.cookTime) detailsData.push(["Cook Time:", recipe.cookTime])
        if (recipe.totalTime) detailsData.push(["Total Time:", recipe.totalTime])
        if (recipe.servings) detailsData.push(["Servings:", recipe.servings])

        // Add details as text instead of table
        detailsData.forEach(([label, value]) => {
          pdf.setFontSize(10)
          pdf.setFont(pdf.getFont().fontName, "bold")
          pdf.text(label, margin, yPos)
          pdf.setFont(pdf.getFont().fontName, "normal")
          pdf.text(value, margin + 25, yPos)
          yPos += 5
        })

        yPos += 5
      }

      // Check if it's a meal plan
      const isMealPlan = recipe.days && Array.isArray(recipe.days)

      if (isMealPlan) {
        // Handle meal plan
        pdf.setFontSize(18)
        pdf.setTextColor(128, 0, 128) // Purple color (primary)
        yPos = addWrappedText(`${recipe.days.length}-Day Meal Plan`, margin, yPos, contentWidth, 8, { fontSize: 18 })
        yPos += 5

        // Add each day
        recipe.days.forEach((day, dayIndex) => {
          // Check if we need a new page for the day
          checkForNewPage(50) // Estimate space needed for day header

          // Add day header
          pdf.setFontSize(16)
          pdf.setTextColor(128, 0, 128) // Purple color (primary)
          yPos = addWrappedText(`Day ${dayIndex + 1}`, margin, yPos, contentWidth, 8, { fontSize: 16 })

          // Add horizontal line
          pdf.setDrawColor(229, 231, 235) // gray-200
          pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1)
          yPos += 5

          // Add each meal
          day.meals.forEach((meal) => {
            // Check if we need a new page for the meal
            checkForNewPage(40) // Estimate space needed for meal header

            // Add meal header
            pdf.setFontSize(14)
            pdf.setTextColor(128, 0, 128) // Purple color (primary)
            yPos = addWrappedText(meal.name, margin, yPos, contentWidth, 7, { fontSize: 14 })
            yPos += 3

            // Add meal description
            if (meal.description) {
              pdf.setFontSize(10)
              pdf.setTextColor(0, 0, 0)
              yPos = addWrappedText(meal.description, margin, yPos, contentWidth, 5)
              yPos += 3
            }

            // Add ingredients
            if (meal.ingredients && meal.ingredients.length > 0) {
              // Check if we need a new page for ingredients
              checkForNewPage(10 + meal.ingredients.length * 5)

              pdf.setFontSize(12)
              pdf.setTextColor(0, 0, 0)
              yPos = addWrappedText("Ingredients:", margin, yPos, contentWidth, 6, { fontStyle: "bold" })
              yPos += 2

              // Add ingredients as text
              meal.ingredients.forEach((ingredient) => {
                pdf.setFontSize(10)
                yPos = addWrappedText(
                  `• ${ingredient.amount} ${ingredient.name}`,
                  margin + 5,
                  yPos,
                  contentWidth - 5,
                  5,
                )
              })

              yPos += 3
            }

            // Add instructions
            if (meal.instructions && meal.instructions.length > 0) {
              // Check if we need a new page for instructions
              checkForNewPage(10 + meal.instructions.length * 5)

              pdf.setFontSize(12)
              pdf.setTextColor(0, 0, 0)
              yPos = addWrappedText("Instructions:", margin, yPos, contentWidth, 6, { fontStyle: "bold" })
              yPos += 2

              // Add instructions as text
              meal.instructions.forEach((instruction, idx) => {
                pdf.setFontSize(10)
                yPos = addWrappedText(`${idx + 1}. ${instruction}`, margin + 5, yPos, contentWidth - 5, 5)
              })

              yPos += 3
            }

            // Add nutritional info
            if (meal.nutritionalInfo) {
              // Check if we need a new page for nutrition info
              checkForNewPage(25)

              pdf.setFontSize(12)
              pdf.setTextColor(0, 0, 0)
              yPos = addWrappedText("Nutrition:", margin, yPos, contentWidth, 6, { fontStyle: "bold" })
              yPos += 2

              // Add nutrition info as text
              pdf.setFontSize(10)
              const nutritionText = `Calories: ${meal.nutritionalInfo.calories} | Protein: ${meal.nutritionalInfo.protein} | Carbs: ${meal.nutritionalInfo.carbs} | Fat: ${meal.nutritionalInfo.fat}`
              yPos = addWrappedText(nutritionText, margin + 5, yPos, contentWidth - 5, 5)

              yPos += 5
            }
          })

          // Add daily nutrition totals
          if (day.dailyNutritionTotals) {
            // Check if we need a new page for daily totals
            checkForNewPage(25)

            pdf.setFontSize(14)
            pdf.setTextColor(128, 0, 128) // Purple color (primary)
            yPos = addWrappedText("Daily Nutrition Totals", margin, yPos, contentWidth, 7, { fontSize: 14 })
            yPos += 3

            // Add daily totals as text
            pdf.setFontSize(10)
            pdf.setTextColor(0, 0, 0)
            const totalsText = `Calories: ${day.dailyNutritionTotals.calories} | Protein: ${day.dailyNutritionTotals.protein} | Carbs: ${day.dailyNutritionTotals.carbs} | Fat: ${day.dailyNutritionTotals.fat}`
            yPos = addWrappedText(totalsText, margin, yPos, contentWidth, 5)

            yPos += 10
          }
        })
      } else {
        // Handle regular recipe
        // Add ingredients
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          // Check if we need a new page for ingredients
          checkForNewPage(10 + recipe.ingredients.length * 5)

          pdf.setFontSize(16)
          pdf.setTextColor(128, 0, 128) // Purple color (primary)
          yPos = addWrappedText("Ingredients", margin, yPos, contentWidth, 8, { fontSize: 16 })
          yPos += 3

          // Add ingredients as text
          recipe.ingredients.forEach((ingredient) => {
            pdf.setFontSize(10)
            pdf.setTextColor(0, 0, 0)
            let text = `• ${ingredient.amount} ${ingredient.name}`
            if (ingredient.substitutes) {
              text += ` (Substitute: ${ingredient.substitutes})`
            }
            yPos = addWrappedText(text, margin + 5, yPos, contentWidth - 5, 5)
          })

          yPos += 5
        }

        // Add instructions
        if (recipe.instructions && recipe.instructions.length > 0) {
          // Check if we need a new page for instructions
          checkForNewPage(10 + recipe.instructions.length * 10)

          pdf.setFontSize(16)
          pdf.setTextColor(128, 0, 128) // Purple color (primary)
          yPos = addWrappedText("Instructions", margin, yPos, contentWidth, 8, { fontSize: 16 })
          yPos += 3

          // Process instructions
          recipe.instructions.forEach((instruction, index) => {
            // Check if we need a new page for this instruction
            checkForNewPage(15)

            pdf.setFontSize(10)
            pdf.setTextColor(0, 0, 0)

            let instructionText = ""
            if (typeof instruction === "string") {
              instructionText = `${index + 1}. ${instruction}`
            } else {
              instructionText = `${index + 1}. ${instruction.description || ""}`
            }

            yPos = addWrappedText(instructionText, margin, yPos, contentWidth, 5)

            // Add timing tip if available
            if (instruction.timingTip) {
              pdf.setTextColor(59, 130, 246) // blue-500
              yPos = addWrappedText(`Timing Tip: ${instruction.timingTip}`, margin + 10, yPos, contentWidth - 10, 5, {
                fontStyle: "italic",
              })
              pdf.setTextColor(0, 0, 0)
            }

            // Add safety tip if available
            if (instruction.safetyTip) {
              pdf.setTextColor(239, 68, 68) // red-500
              yPos = addWrappedText(`Safety Tip: ${instruction.safetyTip}`, margin + 10, yPos, contentWidth - 10, 5, {
                fontStyle: "italic",
              })
              pdf.setTextColor(0, 0, 0)
            }

            yPos += 3
          })

          yPos += 2
        }

        // Add equipment
        if (recipe.equipment && recipe.equipment.length > 0) {
          // Check if we need a new page for equipment
          checkForNewPage(10 + recipe.equipment.length * 5)

          pdf.setFontSize(16)
          pdf.setTextColor(128, 0, 128) // Purple color (primary)
          yPos = addWrappedText("Equipment Needed", margin, yPos, contentWidth, 8, { fontSize: 16 })
          yPos += 3

          // Add equipment as text
          recipe.equipment.forEach((item) => {
            pdf.setFontSize(10)
            pdf.setTextColor(0, 0, 0)
            yPos = addWrappedText(`• ${item}`, margin + 5, yPos, contentWidth - 5, 5)
          })

          yPos += 5
        }

        // Add nutritional info
        if (recipe.nutritionalInfo) {
          // Check if we need a new page for nutrition info
          checkForNewPage(40)

          pdf.setFontSize(16)
          pdf.setTextColor(128, 0, 128) // Purple color (primary)
          yPos = addWrappedText("Nutrition Facts", margin, yPos, contentWidth, 8, { fontSize: 16 })
          yPos += 3

          // Add nutrition info as text
          const nutritionItems = [
            ["Calories", recipe.nutritionalInfo.calories],
            ["Total Fat", recipe.nutritionalInfo.fat],
            ["Total Carbohydrates", recipe.nutritionalInfo.carbs],
            ["Protein", recipe.nutritionalInfo.protein],
          ]

          if (recipe.nutritionalInfo.fiber) {
            nutritionItems.splice(3, 0, ["Dietary Fiber", recipe.nutritionalInfo.fiber])
          }

          if (recipe.nutritionalInfo.sugar) {
            nutritionItems.splice(recipe.nutritionalInfo.fiber ? 4 : 3, 0, ["Sugars", recipe.nutritionalInfo.sugar])
          }

          nutritionItems.forEach(([label, value]) => {
            pdf.setFontSize(10)
            pdf.setFont(pdf.getFont().fontName, "bold")
            pdf.text(label, margin, yPos)
            pdf.setFont(pdf.getFont().fontName, "normal")
            pdf.text(value, margin + 40, yPos)
            yPos += 5
          })

          yPos += 5
        }

        // Add tips
        if (recipe.tips && recipe.tips.length > 0) {
          // Check if we need a new page for tips
          checkForNewPage(10 + recipe.tips.length * 5)

          pdf.setFontSize(16)
          pdf.setTextColor(128, 0, 128) // Purple color (primary)
          yPos = addWrappedText("Chef's Tips", margin, yPos, contentWidth, 8, { fontSize: 16 })
          yPos += 3

          // Add tips as text
          recipe.tips.forEach((tip) => {
            pdf.setFontSize(10)
            pdf.setTextColor(0, 0, 0)
            yPos = addWrappedText(`• ${tip}`, margin + 5, yPos, contentWidth - 5, 5)
          })

          yPos += 5
        }

        // Add storage and reheating
        if (recipe.storage || recipe.reheating) {
          // Check if we need a new page for storage info
          checkForNewPage(30)

          pdf.setFontSize(16)
          pdf.setTextColor(128, 0, 128) // Purple color (primary)
          yPos = addWrappedText("Storage & Reheating", margin, yPos, contentWidth, 8, { fontSize: 16 })
          yPos += 3

          if (recipe.storage) {
            pdf.setFontSize(12)
            pdf.setTextColor(0, 0, 0)
            yPos = addWrappedText("Storage:", margin, yPos, contentWidth, 6, { fontStyle: "bold" })
            yPos += 1
            yPos = addWrappedText(recipe.storage, margin + 5, yPos, contentWidth - 5, 5)
            yPos += 3
          }

          if (recipe.reheating) {
            pdf.setFontSize(12)
            pdf.setTextColor(0, 0, 0)
            yPos = addWrappedText("Reheating:", margin, yPos, contentWidth, 6, { fontStyle: "bold" })
            yPos += 1
            yPos = addWrappedText(recipe.reheating, margin + 5, yPos, contentWidth - 5, 5)
            yPos += 5
          }
        }
      }

      // Add footer on each page
      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(10)
        pdf.setTextColor(107, 114, 128) // gray-500
        pdf.text("Generated by ChefGPT", pageWidth / 2, pageHeight - 10, { align: "center" })

        // Add page numbers
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" })
      }

      // Save PDF
      pdf.save(`${fileName}.pdf`)
      toast({
        title: "PDF Generated",
        description: "Your recipe has been downloaded as a PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error Generating PDF",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={generatePDF} disabled={isGenerating} variant="outline" className="flex items-center gap-2">
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  )
}
