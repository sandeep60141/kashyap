import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { ingredients, cuisine, dietaryRestrictions, cookingTime, servings, difficulty, tool, modelInfo } =
      await request.json()

    // Construct the prompt based on the tool and inputs
    let systemPrompt = `You are ChefGPT, an expert AI chef. Generate a detailed recipe based on the following information.
    Always include food safety tips specific to the ingredients and cooking methods.
    Format your response as a valid JSON object with the following structure:
    {
      "title": "Recipe Title",
      "description": "Brief description",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "prepTime": "preparation time",
      "cookTime": "cooking time",
      "totalTime": "total time",
      "servings": "number of servings",
      "difficulty": "difficulty level",
      "cuisine": "cuisine type",
      "nutritionalInfo": {
        "calories": "amount",
        "protein": "amount",
        "carbs": "amount",
        "fat": "amount"
      },
      "equipment": ["equipment 1", "equipment 2", ...],
      "foodSafetyTips": ["safety tip 1", "safety tip 2", ...],
      "allergenWarnings": ["allergen 1", "allergen 2", ...],
      "dietaryClassifications": ["classification 1", "classification 2", ...],
      "tips": ["tip 1", "tip 2", ...],
      "storage": "storage instructions",
      "reheating": "reheating instructions",
      "pairingRecommendations": "pairing suggestions",
      "costEstimate": "estimated cost"
    }`

    // Add tool-specific instructions
    if (tool === "pantryChef") {
      systemPrompt += `\nYou are using the Pantry Chef tool. Create a recipe using ONLY the ingredients provided. Be creative with limited ingredients.`
    } else if (tool === "masterChef") {
      systemPrompt += `\nYou are using the Master Chef tool. Create a gourmet, restaurant-quality recipe.`
    } else if (tool === "macrosChef") {
      systemPrompt += `\nYou are using the Macros Chef tool. Create a nutrition-focused recipe with detailed macronutrient information.`
    } else if (tool === "mealPlanChef") {
      systemPrompt += `\nYou are using the Meal Plan Chef tool. Create a recipe suitable for meal prepping and batch cooking.`
    } else if (tool === "pairPerfect") {
      systemPrompt += `\nYou are using the Pair Perfect tool. Create a recipe with perfect flavor pairings and suggest complementary dishes.`
    } else if (tool === "mixologyMaestro") {
      systemPrompt += `\nYou are using the Mixology Maestro tool. Create a cocktail or beverage recipe. Include both alcoholic and non-alcoholic versions if appropriate.`
    }

    // Add food safety emphasis
    systemPrompt += `\nIMPORTANT: Always include comprehensive food safety tips specific to the ingredients and cooking methods in your recipe. This is critical for user safety.`

    // Construct the user prompt
    let userPrompt = `Create a recipe with these ingredients: ${ingredients}`

    if (cuisine) {
      userPrompt += `\nCuisine style: ${cuisine}`
    }

    if (dietaryRestrictions) {
      userPrompt += `\nDietary restrictions: ${dietaryRestrictions}`
    }

    if (cookingTime) {
      userPrompt += `\nCooking time: ${cookingTime}`
    }

    if (servings) {
      userPrompt += `\nServings: ${servings}`
    }

    if (difficulty) {
      userPrompt += `\nDifficulty level: ${difficulty}`
    }

    // Generate the recipe using the AI SDK
    const { text } = await generateText({
      model: openai(modelInfo.value),
      system: systemPrompt,
      prompt: userPrompt,
    })

    // Parse the response to ensure it's valid JSON
    let recipe
    try {
      // Find JSON in the response (in case the model outputs additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No valid JSON found in response")
      }

      // Ensure food safety tips are included
      if (!recipe.foodSafetyTips || !Array.isArray(recipe.foodSafetyTips) || recipe.foodSafetyTips.length === 0) {
        recipe.foodSafetyTips = [
          "Always wash hands before and after handling food",
          "Cook meats to proper internal temperatures",
          "Keep raw and cooked foods separate to prevent cross-contamination",
          "Refrigerate leftovers within 2 hours",
          "Use a food thermometer to ensure safe cooking temperatures",
        ]
      }
    } catch (error) {
      console.error("Error parsing recipe JSON:", error)
      return NextResponse.json({ error: "Failed to generate a valid recipe. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ recipe: JSON.stringify(recipe) })
  } catch (error) {
    console.error("Error generating recipe:", error)
    return NextResponse.json({ error: "Failed to generate recipe. Please try again." }, { status: 500 })
  }
}
