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
      tool = "pantryChef", // Default tool
      modelInfo = { provider: "openai", value: "gpt-4o" },
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
    })

    // Enhanced prompt that ensures food safety tips are always included
    const getPromptForTool = (tool: string) => {
      const basePrompt = `You are ChefGPT, an expert culinary AI assistant. Create a detailed recipe based on the following requirements:

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

      const commonStructure = `{
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
  "storage": "How to store leftovers",
  "reheating": "How to reheat safely",
  "pairingRecommendations": "What goes well with this dish",
  "costEstimate": "Low/Medium/High"
}`

      switch (tool) {
        case "masterChef":
          return `${basePrompt}
          
Focus on creating an authentic, restaurant-quality ${cuisine || "international"} recipe with professional techniques and presentation tips.

${commonStructure}`

        case "pantryChef":
          return `${basePrompt}
          
Focus on using common pantry ingredients and creating a practical, home-friendly recipe.

${commonStructure}`

        case "macrosChef":
          return `${basePrompt}
          
Focus on nutritional balance and macro tracking. Include detailed nutritional information and portion control guidance.

${commonStructure}`

        case "mealPlanChef":
          return `${basePrompt}
          
Create a recipe that's perfect for meal planning with make-ahead tips and batch cooking guidance.

${commonStructure}`

        case "pairPerfect":
          return `${basePrompt}
          
Focus on flavor pairing and complementary dishes. Include detailed pairing recommendations.

${commonStructure}`

        case "mixologyMaestro":
          return `${basePrompt}
          
Create a beverage recipe with proper mixing techniques and garnish suggestions. Include responsible serving guidelines.

{
  "title": "Drink Name",
  "description": "Brief description",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "quantity and unit",
      "type": "spirit/mixer/garnish"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "description": "detailed instruction",
      "technique": "mixing technique"
    }
  ],
  "prepTime": "5 minutes",
  "servings": "1",
  "difficulty": "Easy",
  "glassware": "recommended glass",
  "garnish": "garnish suggestions",
  "alcoholContent": "approximate ABV",
  "foodSafetyTips": [
    "Always use fresh ingredients",
    "Keep perishable mixers refrigerated",
    "Serve responsibly and check IDs",
    "Clean bar tools between uses"
  ],
  "tips": ["mixing", "tips"],
  "variations": "recipe variations"
}`

        default:
          return `${basePrompt}

${commonStructure}`
      }
    }

    const prompt = getPromptForTool(tool)
    console.log("Using prompt:", prompt.substring(0, 200) + "...")

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
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
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
          title: "Simple Recipe",
          description: "We couldn't generate a detailed recipe, but here's a simple one based on your ingredients.",
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
              description: "Combine all ingredients in a suitable cooking vessel.",
            },
            {
              step: 2,
              description: "Cook until done to your preference.",
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

    // Add tool-specific food safety tips
    const toolSpecificSafetyTips = {
      masterChef: [
        "When using advanced techniques, ensure proper temperature control",
        "Taste dishes safely using clean utensils",
      ],
      pantryChef: ["Check expiration dates on pantry items", "Store opened canned goods in refrigerator"],
      macrosChef: ["Weigh portions accurately for food safety", "Monitor caloric density of ingredients"],
      mealPlanChef: ["Label and date meal prep containers", "Reheat foods to 165°F before consuming"],
      pairPerfect: [
        "Consider food allergies when pairing dishes",
        "Serve complementary foods at appropriate temperatures",
      ],
      mixologyMaestro: [
        "Use fresh citrus and mixers",
        "Keep alcoholic beverages away from minors",
        "Serve responsibly",
      ],
    }

    if (toolSpecificSafetyTips[tool]) {
      recipe.foodSafetyTips = [...recipe.foodSafetyTips, ...toolSpecificSafetyTips[tool]]
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
          description: "Combine all ingredients in a suitable cooking vessel.",
        },
        {
          step: 2,
          description: "Cook until done to your preference.",
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
