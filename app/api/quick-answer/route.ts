import { OpenAI } from "openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt, recipeName, recipeData } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Log the received data for debugging
    console.log("Received prompt:", prompt)
    console.log("Recipe name:", recipeName)
    console.log("Recipe data sample:", JSON.stringify(recipeData).substring(0, 200) + "...")

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    })

    // Format ingredients for better readability
    let ingredientsList = "Not available"
    if (recipeData && recipeData.ingredients) {
      if (Array.isArray(recipeData.ingredients)) {
        ingredientsList = recipeData.ingredients
          .map((ing: any) => {
            if (typeof ing === "string") return ing
            return `${ing.amount || ""} ${ing.name || ""}${ing.substitutes ? ` (substitute: ${ing.substitutes})` : ""}`
          })
          .join("\n- ")
        if (ingredientsList) ingredientsList = "- " + ingredientsList
      }
    }

    // Format instructions for better readability
    let instructionsList = "Not available"
    if (recipeData && recipeData.instructions) {
      if (Array.isArray(recipeData.instructions)) {
        instructionsList = recipeData.instructions
          .map((inst: any, i: number) => {
            if (typeof inst === "string") return `${i + 1}. ${inst}`
            if (typeof inst === "object" && inst.description) return `${i + 1}. ${inst.description}`
            return null
          })
          .filter(Boolean)
          .join("\n")
      } else if (typeof recipeData.instructions === "string") {
        instructionsList = recipeData.instructions
      }
    }

    // Create a detailed system prompt with recipe information
    const systemPrompt = `You are ChefGPT, a helpful cooking assistant specializing in answering questions about recipes.
    
The user is asking about this specific recipe:

RECIPE: ${recipeName || "Unknown Recipe"}

INGREDIENTS:
${ingredientsList}

INSTRUCTIONS:
${instructionsList}

COOKING DETAILS:
- Prep Time: ${recipeData?.prepTime || "Not specified"}
- Cook Time: ${recipeData?.cookTime || "Not specified"}
- Total Time: ${recipeData?.totalTime || "Not specified"}
- Difficulty: ${recipeData?.difficulty || "Not specified"}
- Servings: ${recipeData?.servings || "Not specified"}

DIETARY INFO:
${recipeData?.dietaryClassifications ? "- " + recipeData.dietaryClassifications.join("\n- ") : "Not specified"}

NUTRITION (per serving):
${
  recipeData?.nutritionalInfo
    ? Object.entries(recipeData.nutritionalInfo)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n")
    : "Not specified"
}

IMPORTANT INSTRUCTIONS:
1. Answer the user's question specifically about THIS recipe.
2. Do NOT give generic cooking advice unless it directly relates to this recipe.
3. If you don't know something specific about this recipe, say so clearly.
4. Keep your answer concise but informative.
5. Do NOT repeat the recipe back to the user.
6. Do NOT start with "I'm glad you asked" or similar phrases.
7. Do NOT ask if they need more help at the end.
8. Just answer their specific question directly.
9. If they ask about substitutions, suggest options that would work well in THIS specific recipe.
10. If they ask about cooking techniques, explain how to apply them to THIS specific recipe.
`

    console.log("Sending system prompt to OpenAI")

    // Use a more efficient model with lower max tokens for faster responses
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using a more capable model for better answers
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300, // Increased token count for more detailed responses
    })

    const answer = response.choices[0].message.content || "I'm sorry, I couldn't generate an answer."

    console.log("Received answer from OpenAI:", answer.substring(0, 100) + "...")

    return NextResponse.json({ answer })
  } catch (error) {
    console.error("Error in quick-answer API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
