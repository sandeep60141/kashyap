"use server"

export async function generateRecipeAction(prompt: string, modelInfo: { provider: string; value: string }) {
  try {
    // Call the API route instead of directly using OpenAI
    const response = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/generate-recipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, modelInfo }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data.recipe
  } catch (error) {
    console.error("Error in generateRecipeAction:", error)
    throw new Error("Failed to generate recipe. Please try again.")
  }
}
