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
      <Card className="w-full max-w-2xl bg-white rounded-xl overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Cooking Mode: {title}</h2>
            <Button variant="ghost" className="text-white hover:bg-indigo-700 p-1 h-auto" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-2 bg-indigo-700/50 h-2 rounded-full">
            <div className="bg-white h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>
              Step {currentStep + 1} of {formattedInstructions.length}
            </span>
            <span>{completedSteps.length} completed</span>
          </div>
        </div>

        <div className="p-6">
          <div className="min-h-[200px]">
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium ${
                  completedSteps.includes(currentStep) ? "bg-green-100 text-green-600" : "bg-indigo-100 text-indigo-600"
                }`}
              >
                {completedSteps.includes(currentStep) ? <Check className="h-5 w-5" /> : currentInstruction.step}
              </div>
              <div className="pt-1">
                <p className="text-lg">{currentInstruction.description}</p>

                {currentInstruction.timingTip && (
                  <p className="mt-3 text-sm text-blue-600 italic flex items-center">
                    <Clock className="inline-block h-4 w-4 mr-1" />
                    {currentInstruction.timingTip}
                  </p>
                )}

                {currentInstruction.safetyTip && (
                  <p className="mt-2 text-sm text-red-600 italic">⚠️ {currentInstruction.safetyTip}</p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              className={`mt-4 ${
                completedSteps.includes(currentStep)
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "border-indigo-200 text-indigo-600"
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

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-indigo-200"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentStep < formattedInstructions.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                Finish Cooking
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
