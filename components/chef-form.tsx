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

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-8">{title}</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full"
                style={{ width: `${((currentStep + 1) / childrenArray.length) * 100}%` }}
              ></div>
            </div>
            <span className="ml-4 text-sm font-medium">
              Step {currentStep + 1} of {childrenArray.length}
            </span>
          </div>
        </div>

        {childrenArray[currentStep]}

        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < childrenArray.length - 1 ? (
            <Button type="button" onClick={handleNext} className="px-6">
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleGenerateClick} disabled={isLoading} className="px-6">
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
      </form>
    </div>
  )
}
