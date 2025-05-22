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
    } = body

    // Enhanced prompt that ensures food safety tips are always included
    const getPromptForTool = (tool: string) => {
      const basePrompt = `You are ChefGPT, an expert culinary AI assistant. Create a detailed recipe based on the following requirements:

Ingredients: ${ingredients}
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

Return a JSON object with this exact structure:`

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
          
Focus on creating an authentic, restaurant-quality ${cuisine} recipe with professional techniques and presentation tips.

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

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse the JSON response
    let recipe
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Error parsing recipe JSON:", parseError)
      // Fallback response with food safety tips
      recipe = {
        title: "Recipe Generation Error",
        description: "There was an error generating your recipe. Please try again.",
        ingredients: [],
        instructions: [],
        foodSafetyTips: [
          "Always wash hands before handling food",
          "Cook proteins to safe internal temperatures",
          "Store leftovers in refrigerator within 2 hours",
          "Use separate cutting boards for raw meat and vegetables",
        ],
        error: true,
      }
    }

    // Ensure food safety tips are always present
    if (!recipe.foodSafetyTips || recipe.foodSafetyTips.length === 0) {
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

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error("Error generating recipe:", error)
    return NextResponse.json(
      {
        error: "Failed to generate recipe",
        recipe: {
          title: "Error",
          description: "Failed to generate recipe. Please try again.",
          foodSafetyTips: [
            "Always wash hands before handling food",
            "Cook proteins to safe internal temperatures",
            "Store leftovers properly",
          ],
        },
      },
      { status: 500 },
    )
  }
}
