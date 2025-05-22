"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"

interface FormValidationProps {
  value: string
  validationRules?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    customValidator?: (value: string) => boolean
  }
  showValidation?: boolean
  errorMessage?: string
  successMessage?: string
}

export default function FormValidation({
  value,
  validationRules = {},
  showValidation = true,
  errorMessage = "This field is required",
  successMessage = "Looks good!",
}: FormValidationProps) {
  const [isValid, setIsValid] = useState(true)
  const [message, setMessage] = useState("")
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (!isDirty && value) {
      setIsDirty(true)
    }

    if (!isDirty) {
      setIsValid(true)
      setMessage("")
      return
    }

    // Validate based on rules
    if (validationRules.required && !value.trim()) {
      setIsValid(false)
      setMessage(errorMessage)
      return
    }

    if (validationRules.minLength && value.trim().length < validationRules.minLength) {
      setIsValid(false)
      setMessage(`Must be at least ${validationRules.minLength} characters`)
      return
    }

    if (validationRules.maxLength && value.trim().length > validationRules.maxLength) {
      setIsValid(false)
      setMessage(`Must be no more than ${validationRules.maxLength} characters`)
      return
    }

    if (validationRules.pattern && !validationRules.pattern.test(value)) {
      setIsValid(false)
      setMessage("Invalid format")
      return
    }

    if (validationRules.customValidator && !validationRules.customValidator(value)) {
      setIsValid(false)
      setMessage(errorMessage)
      return
    }

    setIsValid(true)
    setMessage(successMessage)
  }, [value, validationRules, errorMessage, successMessage, isDirty])

  if (!showValidation || !isDirty) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 mt-1 text-xs ${isValid ? "text-green-600" : "text-red-600"}`}>
      {isValid ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      <span>{message}</span>
    </div>
  )
}
