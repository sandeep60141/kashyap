import { type NextRequest, NextResponse } from "next/server"
import { generateRecipe } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, modelInfo, requireCompleteRecipe, includeNutrition, includeSafetyTips } = body

    console.log("API Route - Generating recipe with:", {
      promptLength: prompt?.length || 0,
      modelInfo,
      requireCompleteRecipe,
      includeNutrition,
      includeSafetyTips,
    })

    // Enhanced prompt to ensure complete recipe generation
    let enhancedPrompt = prompt

    if (requireCompleteRecipe) {
      enhancedPrompt += `

IMPORTANT: Please provide a COMPLETE, DETAILED recipe with ALL of the following components:
- Complete ingredients list with exact measurements
- Detailed step-by-step cooking instructions
- Accurate preparation and cooking times
- Proper serving size information
- Nutritional information per serving
- Food safety tips and guidelines
- Equipment needed
- Storage and reheating instructions
- Cooking tips and techniques

Do not provide just a title and description. This must be a full recipe that someone can actually cook from.`
    }

    const recipe = await generateRecipe(enhancedPrompt, modelInfo)

    console.log("API Route - Recipe generated successfully")

    return NextResponse.json({
      recipe,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in generate-recipe API route:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate recipe",
        success: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
