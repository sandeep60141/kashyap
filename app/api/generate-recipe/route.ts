import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ingredients,
      cuisine,
      dietaryRestrictions,
      cookingTime,
      servings,
      difficulty,
      tool = "pantryChef",
      modelInfo = { provider: "openai", value: "gpt-4o" },
      prompt,
      fullPrompt,
    } = body

    console.log("Recipe generation request:", {
      ingredients,
      cuisine,
      dietaryRestrictions,
      cookingTime,
      servings,
      difficulty,
      tool,
      modelInfo,
      hasPrompt: !!prompt,
      hasFullPrompt: !!fullPrompt,
    })

    // Use the full prompt if provided (from homepage), otherwise construct one
    let finalPrompt = ""

    if (fullPrompt) {
      // This is from the homepage form - use the enhanced prompt directly
      finalPrompt = `You are ChefGPT, an expert culinary AI assistant. ${fullPrompt}

IMPORTANT: You MUST include food safety tips for every recipe. Always consider:
- Proper cooking temperatures for proteins
- Safe food handling practices
- Storage guidelines
- Cross-contamination prevention
- Allergen warnings

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just the JSON):`
    } else {
      // This is from the individual tool pages - use the original logic
      finalPrompt = `You are ChefGPT, an expert culinary AI assistant. Create a detailed recipe based on the following requirements:

Ingredients: ${ingredients || "common pantry ingredients"}
Cuisine: ${cuisine || "Any"}
Dietary Restrictions: ${dietaryRestrictions || "None"}
Cooking Time: ${cookingTime || "Any"}
Servings: ${servings || "4"}
Difficulty: ${difficulty || "Medium"}

IMPORTANT: You MUST include food safety tips for every recipe. Always consider:
- Proper cooking temperatures for proteins
- Safe food handling practices
- Storage guidelines
- Cross-contamination prevention
- Allergen warnings

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just the JSON):`
    }

    // Determine the response structure based on the prompt content
    let responseStructure = ""

    if (fullPrompt && fullPrompt.includes("meal plan")) {
      responseStructure = `{
  "title": "Meal Plan Title",
  "description": "Brief description of the meal plan",
  "calorieTarget": "Daily calorie target based on provided information",
  "nutritionNotes": "Important notes about the nutritional balance of this plan",
  "allergenWarning": "List any potential allergens in this meal plan",
  "days": [
    {
      "dayNumber": 1,
      "meals": [
        {
          "name": "Breakfast/Lunch/Dinner",
          "description": "Detailed meal description",
          "prepTime": "Preparation time in minutes",
          "cookTime": "Cooking time in minutes",
          "ingredients": [
            { "name": "Ingredient name", "amount": "Amount with unit", "allergens": ["List allergens if any"] }
          ],
          "instructions": ["Step 1", "Step 2"],
          "nutritionalInfo": {
            "calories": "Calories per serving",
            "protein": "Protein in grams",
            "carbs": "Carbohydrates in grams",
            "fat": "Fat in grams",
            "fiber": "Fiber in grams",
            "sugar": "Sugar in grams"
          },
          "foodSafetyTips": ["Any relevant food safety tips"]
        }
      ],
      "dailyNutritionTotals": {
        "calories": "Total calories for the day",
        "protein": "Total protein in grams",
        "carbs": "Total carbs in grams",
        "fat": "Total fat in grams"
      }
    }
  ],
  "tips": ["Meal prep tips", "Storage recommendations", "Substitution suggestions"]
}`
    } else if (fullPrompt && fullPrompt.includes("cooking question")) {
      responseStructure = `{
  "title": "Cooking Advice",
  "description": "Brief summary of the advice",
  "answer": "Detailed answer to the cooking question",
  "tips": ["Additional helpful tips"],
  "techniques": ["Specific cooking techniques mentioned"],
  "ingredients": [
    { "name": "Ingredient mentioned", "purpose": "Why it's used", "alternatives": "Possible substitutes" }
  ],
  "equipment": ["Any kitchen tools mentioned"],
  "foodSafetyTips": ["Relevant safety advice"],
  "difficulty": "Easy/Medium/Hard",
  "estimatedTime": "Time needed if applicable"
}`
    } else {
      responseStructure = `{
  "title": "Recipe Name",
  "description": "Brief description",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "quantity and unit",
      "allergens": ["list", "of", "allergens"],
      "substitutes": "alternative ingredients if any"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "description": "detailed instruction",
      "timingTip": "timing guidance if applicable",
      "safetyTip": "safety note if applicable"
    }
  ],
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "totalTime": "45 minutes",
  "servings": "4",
  "difficulty": "Medium",
  "cuisine": "${cuisine || "Mixed"}",
  "nutritionalInfo": {
    "calories": "per serving",
    "protein": "grams",
    "carbs": "grams",
    "fat": "grams",
    "fiber": "grams",
    "sodium": "mg"
  },
  "equipment": ["required", "cooking", "equipment"],
  "foodSafetyTips": [
    "Always wash hands before handling food",
    "Cook proteins to safe internal temperatures",
    "Store leftovers in refrigerator within 2 hours",
    "Use separate cutting boards for raw meat and vegetables"
  ],
  "allergenWarnings": ["common", "allergens", "present"],
  "dietaryClassifications": ["vegetarian", "gluten-free", "etc"],
  "tips": ["helpful", "cooking", "tips"],
  "storage": "Storage instructions and shelf life",
  "reheating": "Reheating instructions if applicable",
  "pairingRecommendations": "What goes well with this dish",
  "costEstimate": "Low/Medium/High"
}`
    }

    const completePrompt = finalPrompt + "\n\n" + responseStructure

    console.log("Using prompt:", completePrompt.substring(0, 300) + "...")

    // Use the appropriate model based on the provider
    let model
    if (modelInfo.provider === "deepseek") {
      if (!process.env.DEEPSEEK_API_KEY) {
        console.error("DeepSeek API key not configured")
        return NextResponse.json(
          {
            error: "DeepSeek API key not configured",
            recipe: JSON.stringify({
              title: "API Key Missing",
              description: "The DeepSeek API key is not configured.",
              foodSafetyTips: [
                "Always wash hands before handling food",
                "Cook proteins to safe internal temperatures",
                "Store leftovers properly",
              ],
            }),
          },
          { status: 400 },
        )
      }
      model = openai(modelInfo.value, { apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com/v1" })
    } else {
      model = openai(modelInfo.value)
    }

    console.log("Generating recipe with model:", modelInfo.value)

    // Generate the recipe using the AI SDK
    const { text } = await generateText({
      model,
      prompt: completePrompt,
      temperature: 0.7,
      maxTokens: 3000, // Increased for meal plans and detailed responses
    })

    console.log("AI response received, length:", text.length)
    console.log("Response preview:", text.substring(0, 200) + "...")

    // Parse the JSON response
    let recipe
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        console.log("JSON match found, attempting to parse")
        recipe = JSON.parse(jsonMatch[0])
      } else {
        console.error("No JSON found in response")
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Error parsing recipe JSON:", parseError)
      console.log("Attempting to fix malformed JSON...")

      // Try to fix common JSON issues
      try {
        // Replace single quotes with double quotes
        const fixedText = text.replace(/'/g, '"')
        // Try to extract JSON again
        const jsonMatch = fixedText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          recipe = JSON.parse(jsonMatch[0])
          console.log("Successfully parsed JSON after fixing")
        } else {
          throw new Error("Still no valid JSON found")
        }
      } catch (fixError) {
        console.error("Failed to fix JSON:", fixError)

        // Create a fallback recipe
        recipe = {
          title: "Generated Response",
          description: "Here's the response to your request.",
          answer: text, // For cooking questions
          ingredients: ingredients
            ? ingredients.split(",").map((item) => ({
                name: item.trim(),
                amount: "as needed",
                allergens: [],
              }))
            : [{ name: "Ingredients not specified", amount: "", allergens: [] }],
          instructions: [
            {
              step: 1,
              description: "Follow the guidance provided in the response.",
            },
          ],
          prepTime: "15 minutes",
          cookTime: "30 minutes",
          totalTime: "45 minutes",
          servings: servings || "4",
          difficulty: difficulty || "Medium",
          cuisine: cuisine || "Mixed",
          nutritionalInfo: {
            calories: "Varies",
            protein: "Varies",
            carbs: "Varies",
            fat: "Varies",
          },
          foodSafetyTips: [
            "Always wash hands before handling food",
            "Cook proteins to safe internal temperatures (165°F for poultry, 160°F for ground meat, 145°F for whole cuts)",
            "Store leftovers in refrigerator within 2 hours of cooking",
            "Use separate cutting boards for raw meat and vegetables to prevent cross-contamination",
            "Keep hot foods hot (above 140°F) and cold foods cold (below 40°F)",
          ],
        }
      }
    }

    // Ensure food safety tips are always present
    if (!recipe.foodSafetyTips || !Array.isArray(recipe.foodSafetyTips) || recipe.foodSafetyTips.length === 0) {
      recipe.foodSafetyTips = [
        "Always wash hands thoroughly before handling food",
        "Cook proteins to safe internal temperatures (165°F for poultry, 160°F for ground meat, 145°F for whole cuts)",
        "Store leftovers in refrigerator within 2 hours of cooking",
        "Use separate cutting boards for raw meat and vegetables to prevent cross-contamination",
        "Keep hot foods hot (above 140°F) and cold foods cold (below 40°F)",
      ]
    }

    // Ensure ingredients is an array
    if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      recipe.ingredients = ingredients
        ? ingredients.split(",").map((item) => ({
            name: item.trim(),
            amount: "as needed",
            allergens: [],
          }))
        : [{ name: "Ingredients not specified", amount: "", allergens: [] }]
    }

    // Ensure instructions is an array
    if (!recipe.instructions || !Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
      recipe.instructions = [
        {
          step: 1,
          description: "Follow the provided guidance or recipe steps.",
        },
      ]
    }

    console.log("Successfully generated recipe:", recipe.title)
    return NextResponse.json({ recipe: JSON.stringify(recipe) })
  } catch (error) {
    console.error("Error generating recipe:", error)

    // Create a fallback recipe for any error case
    const fallbackRecipe = {
      title: "Simple Recipe",
      description: "We encountered an error while generating your recipe. Here's a simple alternative.",
      ingredients: [{ name: "Your favorite ingredients", amount: "as needed", allergens: [] }],
      instructions: [
        { step: 1, description: "Combine ingredients according to your preference." },
        { step: 2, description: "Cook to your desired doneness." },
      ],
      prepTime: "15 minutes",
      cookTime: "30 minutes",
      totalTime: "45 minutes",
      servings: "4",
      difficulty: "Medium",
      foodSafetyTips: [
        "Always wash hands before handling food",
        "Cook proteins to safe internal temperatures",
        "Store leftovers properly",
      ],
    }

    return NextResponse.json({ recipe: JSON.stringify(fallbackRecipe) }, { status: 200 })
  }
}
