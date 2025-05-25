import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export async function createCheckoutSession(priceId: string, customerId?: string) {
  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      priceId,
      customerId,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create checkout session")
  }

  const { sessionId } = await response.json()

  const stripe = await stripePromise
  if (!stripe) throw new Error("Stripe failed to load")

  const { error } = await stripe.redirectToCheckout({ sessionId })
  if (error) throw error
}

export async function createPortalSession() {
  const response = await fetch("/api/create-portal-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to create portal session")
  }

  const { url } = await response.json()
  window.location.href = url
}
