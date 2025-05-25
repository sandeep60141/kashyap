"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle, UserCheck } from "lucide-react"
import {
  signUp,
  signIn,
  resetPassword,
  hasCompletedOnboarding,
  getLastPath,
  clearLastPath,
  checkUserExists,
} from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "signin" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Sign In Form
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  // Sign Up Form
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })

  // Reset Password Form
  const [resetEmail, setResetEmail] = useState("")

  const handleEmailBlur = async (email: string) => {
    if (!email || activeTab !== "signup") return

    setIsCheckingUser(true)
    try {
      const exists = await checkUserExists(email)
      if (exists) {
        setMessage({
          type: "info",
          text: "An account with this email already exists. Please sign in instead.",
        })
        setTimeout(() => {
          setActiveTab("signin")
          setSignInData({ email, password: "" })
          setMessage(null)
        }, 2000)
      } else {
        setMessage(null)
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setIsCheckingUser(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      console.log("🔄 Attempting sign in...")
      const result = await signIn(signInData.email, signInData.password)

      if (result.user && result.session) {
        console.log("✅ Sign in successful, checking onboarding status...")
        setMessage({ type: "success", text: "Successfully signed in! Redirecting..." })

        // Check if user has completed onboarding
        const completedOnboarding = await hasCompletedOnboarding(result.user.id)
        console.log("📋 Onboarding completed:", completedOnboarding)

        // Close modal first
        onClose()

        // Small delay to ensure modal closes
        setTimeout(() => {
          if (completedOnboarding) {
            // Existing user - redirect to last path or dashboard
            const lastPath = getLastPath()
            console.log("🎯 Redirecting to:", lastPath)
            clearLastPath()

            // Force page refresh to update auth state
            window.location.href = lastPath
          } else {
            // User exists but no profile - redirect to onboarding
            console.log("🎯 Redirecting to onboarding")
            window.location.href = "/onboarding"
          }
        }, 500)
      }
    } catch (error: any) {
      console.error("❌ Sign in error:", error)
      setMessage({ type: "error", text: error.message || "Failed to sign in" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      setIsLoading(false)
      return
    }

    if (signUpData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" })
      setIsLoading(false)
      return
    }

    if (!signUpData.fullName.trim()) {
      setMessage({ type: "error", text: "Please enter your full name" })
      setIsLoading(false)
      return
    }

    try {
      console.log("🔄 Attempting sign up...")
      const result = await signUp(signUpData.email, signUpData.password, signUpData.fullName)

      if (result.user) {
        console.log("✅ Sign up successful, redirecting to onboarding...")
        setMessage({ type: "success", text: "Account created successfully! Redirecting to onboarding..." })

        // Close modal first
        onClose()

        // Immediate redirect to onboarding
        setTimeout(() => {
          window.location.href = "/onboarding"
        }, 500)
      }
    } catch (error: any) {
      console.error("❌ Sign up error:", error)

      if (error.message.includes("already exists")) {
        setMessage({ type: "error", text: "An account with this email already exists. Please sign in instead." })
        setTimeout(() => {
          setActiveTab("signin")
          setSignInData({ email: signUpData.email, password: "" })
        }, 2000)
      } else {
        setMessage({ type: "error", text: error.message || "Failed to create account" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      await resetPassword(resetEmail)
      setMessage({ type: "success", text: "Password reset email sent! Check your inbox." })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to send reset email" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome to Food AI
          </DialogTitle>
          <DialogDescription>Sign in to your account or create a new one to get started</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="reset">Reset</TabsTrigger>
          </TabsList>

          {/* Message Display */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : message.type === "info"
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : message.type === "info" ? (
                <UserCheck className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    onBlur={(e) => handleEmailBlur(e.target.value)}
                    required
                  />
                  {isCheckingUser && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 chars)"
                    className="pl-10"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || isCheckingUser}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy. New accounts start with a free plan
                and no email verification required.
              </p>
            </form>
          </TabsContent>

          {/* Reset Password Tab */}
          <TabsContent value="reset">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Email...
                  </>
                ) : (
                  "Send Reset Email"
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                We'll send you a link to reset your password. Email verification is required for password reset.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
