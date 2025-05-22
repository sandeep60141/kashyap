import { OpenAI } from "openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt, recipeName } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    })

    // Use a more efficient model with lower max tokens for faster responses
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using a faster model
      messages: [
        {
          role: "system",
          content: `You are ChefGPT, a helpful cooking assistant. Answer questions about recipes directly and concisely.
          Do NOT return recipe JSON or code blocks. Only provide plain text answers to cooking questions.
          The user is asking about a recipe called "${recipeName}".`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150, // Limiting token count for faster responses
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
