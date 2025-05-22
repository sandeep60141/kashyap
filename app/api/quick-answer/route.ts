import { OpenAI } from "openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt, recipeName, recipeData } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    })

    // Create a detailed system prompt with recipe information
    const recipeInfo = recipeData
      ? `
Recipe: ${recipeData.title || recipeName}
Ingredients: ${
          Array.isArray(recipeData.ingredients)
            ? recipeData.ingredients
                .map((ing) => (typeof ing === "string" ? ing : `${ing.amount || ""} ${ing.name}`))
                .join(", ")
            : "Not specified"
        }
Instructions: ${
          Array.isArray(recipeData.instructions)
            ? recipeData.instructions
                .map((inst, i) => `${i + 1}. ${typeof inst === "string" ? inst : inst.description}`)
                .join(" ")
            : typeof recipeData.instructions === "string"
              ? recipeData.instructions
              : "Not specified"
        }
Cook Time: ${recipeData.cookTime || "Not specified"}
Prep Time: ${recipeData.prepTime || "Not specified"}
Difficulty: ${recipeData.difficulty || "Not specified"}
`
      : `Recipe: ${recipeName}`

    // Use a more efficient model with lower max tokens for faster responses
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are ChefGPT, a helpful cooking assistant. Answer questions about recipes directly and concisely.
          Do NOT return recipe JSON or code blocks. Only provide plain text answers to cooking questions.
          The user is asking about the following recipe:
          ${recipeInfo}
          
          Provide accurate, helpful cooking advice based on this recipe. If you don't know something specific about this recipe, 
          provide general cooking advice that would be applicable. Keep answers concise but informative.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 250, // Increased token count for more detailed responses
    })

    const answer = response.choices[0].message.content || "I'm sorry, I couldn't generate an answer."

    return NextResponse.json({ answer })
  } catch (error) {
    console.error("Error in quick-answer API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
