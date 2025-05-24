import { OpenAI } from "openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt, recipeName, recipeData } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("Received prompt:", prompt)

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    })

    // Optimized system prompt - much more concise to save tokens
    let systemPrompt = ""

    if (recipeData && recipeName && recipeName !== "General Cooking Question") {
      // Minimal recipe context to save tokens
      const ingredients =
        recipeData?.ingredients
          ?.slice(0, 5)
          ?.map((ing: any) => (typeof ing === "string" ? ing : `${ing.amount} ${ing.name}`))
          .join(", ") || "Not available"

      systemPrompt = `You are ChefGPT. Answer about this recipe: ${recipeName}

Ingredients: ${ingredients}
Prep: ${recipeData?.prepTime || "N/A"} | Cook: ${recipeData?.cookTime || "N/A"}

Answer directly, 2-3 sentences max.`
    } else {
      // General cooking question - very concise
      systemPrompt = `You are ChefGPT. Answer cooking questions directly in 2-3 sentences. Include safety tips when relevant.`
    }

    console.log("Sending request to OpenAI")

    // Use GPT-3.5-turbo for simple Q&A to save significant tokens
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Much cheaper than GPT-4
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
      max_tokens: 150, // Reduced from 300 to 150 tokens
    })

    // Log token usage for monitoring
    const usage = response.usage
    if (usage) {
      console.log(
        `Ask ChefGPT Token usage - Prompt: ${usage.prompt_tokens}, Completion: ${usage.completion_tokens}, Total: ${usage.total_tokens}`,
      )
    }

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
