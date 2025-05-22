"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface ChefFormProps {
  title: string
  buttonText: string
  onSubmit: () => void
  isLoading?: boolean
  children: React.ReactNode
}

export function ChefForm({ title, buttonText, onSubmit, isLoading = false, children }: ChefFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const childrenArray = React.Children.toArray(children)

  // Add a progress indicator function
  const getProgressPercentage = () => {
    return ((currentStep + 1) / childrenArray.length) * 100
  }

  const handleNext = () => {
    if (currentStep < childrenArray.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Only submit if the user is on the last step and clicks the submit button
    // The button click will call onSubmit directly
  }

  const handleGenerateClick = () => {
    // This function is only called when the user explicitly clicks the generate button
    onSubmit()
  }

  // Add keyboard navigation support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow keyboard navigation with arrow keys
      if (e.key === "ArrowRight" && currentStep < childrenArray.length - 1) {
        handleNext()
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentStep, childrenArray.length])

  return (
    <div className="py-8">
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 rounded-lg mb-6 shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">{title}</h1>
        <p className="text-foreground/80">Follow the steps below to create your perfect recipe</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-md p-6 border border-primary/20">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-1 h-3 bg-secondary/30 rounded-full overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <span className="ml-4 text-sm font-medium text-primary">
              Step {currentStep + 1} of {childrenArray.length}
            </span>
          </div>

          <div className="flex justify-between">
            {childrenArray.map((_, index) => (
              <div
                key={index}
                className={`text-xs ${
                  index === currentStep
                    ? "text-primary font-medium"
                    : index < currentStep
                      ? "text-primary/70"
                      : "text-foreground/40"
                }`}
              >
                Step {index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">{childrenArray[currentStep]}</div>

        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 border-primary/30 text-primary hover:bg-primary/10"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < childrenArray.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="px-6 bg-gradient-to-r from-primary to-purple-500 text-white hover:from-primary/90 hover:to-purple-500/90"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="px-6 bg-gradient-to-r from-primary to-purple-500 text-white hover:from-primary/90 hover:to-purple-500/90"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Generating...
                </>
              ) : (
                buttonText
              )}
            </Button>
          )}
        </div>
        <div className="mt-2 text-xs text-center text-foreground/60">
          Keyboard shortcuts: Use ← → arrow keys to navigate between steps
        </div>
      </form>
    </div>
  )
}
