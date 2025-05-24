"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Clock, Check, X } from "lucide-react"

interface Instruction {
  step?: number
  description?: string
  timingTip?: string
  safetyTip?: string
}

interface CookingModeProps {
  title: string
  instructions: (string | Instruction)[]
  onClose: () => void
}

export default function CookingMode({ title, instructions, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const formattedInstructions = instructions.map((instruction, index) => {
    if (typeof instruction === "string") {
      return {
        step: index + 1,
        description: instruction,
      }
    } else {
      return {
        step: instruction.step || index + 1,
        description: instruction.description || "",
        timingTip: instruction.timingTip,
        safetyTip: instruction.safetyTip,
      }
    }
  })

  const handleNext = () => {
    if (currentStep < formattedInstructions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleStepCompletion = (step: number) => {
    if (completedSteps.includes(step)) {
      setCompletedSteps(completedSteps.filter((s) => s !== step))
    } else {
      setCompletedSteps([...completedSteps, step])
    }
  }

  const currentInstruction = formattedInstructions[currentStep]
  const progress = ((currentStep + 1) / formattedInstructions.length) * 100

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white rounded-xl overflow-hidden border-2 border-primary/20 shadow-2xl">
        <div className="bg-gradient-to-r from-primary to-accent p-4 sm:p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold truncate pr-4">Cooking Mode: {title}</h2>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 h-auto rounded-lg border border-white/30 hover:border-white/50 transition-all"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-4 bg-primary/30 h-3 rounded-full overflow-hidden border border-white/20">
            <div
              className="bg-white h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs sm:text-sm mt-2">
            <span>
              Step {currentStep + 1} of {formattedInstructions.length}
            </span>
            <span>{completedSteps.length} completed</span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="min-h-[250px]">
            <div className="flex items-start gap-4 mb-6">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium border-2 transition-all ${
                  completedSteps.includes(currentStep)
                    ? "bg-green-100 text-green-600 border-green-300"
                    : "bg-primary/10 text-primary border-primary/30"
                }`}
              >
                {completedSteps.includes(currentStep) ? <Check className="h-6 w-6" /> : currentInstruction.step}
              </div>
              <div className="pt-2 flex-1 min-w-0">
                <p className="text-base sm:text-lg leading-relaxed text-foreground">{currentInstruction.description}</p>

                {currentInstruction.timingTip && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Timing Tip:</span>
                      <span>{currentInstruction.timingTip}</span>
                    </p>
                  </div>
                )}

                {currentInstruction.safetyTip && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <span className="text-red-500">⚠️</span>
                      <span className="font-medium">Safety:</span>
                      <span>{currentInstruction.safetyTip}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              className={`transition-all border-2 ${
                completedSteps.includes(currentStep)
                  ? "bg-green-50 text-green-600 border-green-300 hover:bg-green-100"
                  : "border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
              }`}
              onClick={() => toggleStepCompletion(currentStep)}
            >
              {completedSteps.includes(currentStep) ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Mark as not done
                </>
              ) : (
                <>Mark as done</>
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center mt-8 gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < formattedInstructions.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 border-2 border-transparent"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-600 hover:border-green-700"
              >
                Finish Cooking
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
