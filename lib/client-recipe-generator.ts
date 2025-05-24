export async function generateRecipe(options: {
  ingredients?: string
  preferences?: string
  dietaryRequirements?: string[]
  recipeName?: string
  cuisine?: string
  difficulty?: string
  macros?: {
    protein: number
    carbs: number
    fat: number
    calories: number
  }
  mealType?: string
  alcoholic?: boolean
  type?: string
  dish?: string
  pairingType?: string
  days?: number
  calories?: number
  model?: string
}) {
  try {
    // Construct a detailed prompt based on the provided options
    let prompt = ""

    if (options.type === "mealPlan") {
      prompt = `Create a detailed meal plan for ${options.days || 3} days with these specifications:
- Daily calorie target: ${options.calories || 2000} calories
- Preferences: ${options.preferences || "balanced, healthy meals"}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- Dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

Please provide a complete meal plan with breakfast, lunch, and dinner for each day. Include detailed recipes with ingredients, instructions, cooking times, and nutritional information for each meal.

This is a meal plan request.`
    } else if (options.type === "pairing") {
      prompt = `Suggest the perfect ${options.pairingType || "wine"} pairing for this dish: ${options.dish || "a general meal"}.
${options.preferences ? `Additional preferences: ${options.preferences}` : ""}

Please provide detailed information about why this pairing works well, including flavor notes, complementary elements, and serving suggestions.`
    } else if (options.type === "cocktail") {
      prompt = `Create a detailed ${options.alcoholic === false ? "non-alcoholic " : ""}cocktail recipe using these ingredients: ${options.ingredients || "common bar ingredients"}.
${options.preferences ? `Style preferences: ${options.preferences}` : ""}

Please provide a complete cocktail recipe with exact measurements, step-by-step preparation instructions, garnish suggestions, and serving recommendations.`
    } else if (options.macros) {
      prompt = `Create a detailed recipe for a ${options.mealType || "meal"} with these specific macronutrient targets:
- Protein: ${options.macros.protein}%
- Carbohydrates: ${options.macros.carbs}%
- Fat: ${options.macros.fat}%
- Total calories: ${options.macros.calories}
${options.preferences ? `Additional preferences: ${options.preferences}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- Dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

Please provide a complete recipe with detailed ingredients list, step-by-step cooking instructions, exact cooking times and temperatures, and accurate nutritional information.`
    } else if (options.recipeName) {
      prompt = `Create a detailed and complete recipe for: ${options.recipeName}.

Recipe specifications:
${options.cuisine ? `- Cuisine style: ${options.cuisine}` : ""}
${options.difficulty ? `- Difficulty level: ${options.difficulty}` : ""}
${options.preferences ? `- Additional preferences: ${options.preferences}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- Dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

Please provide a COMPLETE recipe including:
1. Detailed ingredients list with exact measurements
2. Step-by-step cooking instructions
3. Preparation and cooking times
4. Serving size information
5. Nutritional information
6. Food safety tips
7. Cooking tips and techniques
8. Equipment needed
9. Storage and reheating instructions

Make sure this is a full, detailed recipe that someone can actually cook from, not just a description.`
    } else {
      prompt = `Create a detailed and complete recipe using these ingredients: ${options.ingredients || "common pantry ingredients"}.

Additional details:
${options.preferences ? `- Cooking preferences: ${options.preferences}` : ""}
${options.cuisine ? `- Cuisine style: ${options.cuisine}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- Dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

Please provide a COMPLETE recipe including:
1. Detailed ingredients list with exact measurements
2. Step-by-step cooking instructions
3. Preparation and cooking times
4. Serving size information
5. Nutritional information
6. Food safety tips
7. Cooking tips and techniques
8. Equipment needed
9. Storage and reheating instructions

Make sure this is a full, detailed recipe that someone can actually cook from, not just a description.`
    }

    console.log("Generating recipe with detailed prompt:", prompt.substring(0, 200) + "...")

    // Use the existing generateRecipeClient function with the constructed prompt
    const modelInfo = {
      provider: "openai",
      value: options.model || "gpt-4o",
    }

    const recipeJson = await generateRecipeClient(prompt, modelInfo)

    // Parse the recipe JSON and validate it
    try {
      const recipe = JSON.parse(recipeJson)

      // Validate that we have a complete recipe
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        throw new Error("Recipe missing ingredients")
      }

      if (!recipe.instructions || !Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
        throw new Error("Recipe missing instructions")
      }

      // Ensure we have essential recipe data
      if (!recipe.title || recipe.title === "Generated Recipe") {
        recipe.title = options.recipeName || "Custom Recipe"
      }

      if (!recipe.prepTime || recipe.prepTime === "N/A") {
        recipe.prepTime = "15 minutes"
      }

      if (!recipe.cookTime || recipe.cookTime === "N/A") {
        recipe.cookTime = "20 minutes"
      }

      if (!recipe.servings || recipe.servings === "N/A") {
        recipe.servings = "4"
      }

      console.log("Generated complete recipe:", {
        title: recipe.title,
        ingredientsCount: recipe.ingredients?.length || 0,
        instructionsCount: recipe.instructions?.length || 0,
        hasNutrition: !!recipe.nutritionalInfo,
        hasSafetyTips: !!recipe.foodSafetyTips,
      })

      return recipe
    } catch (parseError) {
      console.error("Error parsing recipe JSON:", parseError)
      console.log("Raw recipe response:", recipeJson.substring(0, 500))

      // If parsing fails, try to create a structured recipe from the text
      return createFallbackRecipe(recipeJson, options)
    }
  } catch (error) {
    console.error("Error in generateRecipe:", error)

    // Return a more detailed fallback recipe
    return createFallbackRecipe("", options, error.message)
  }
}

function createFallbackRecipe(rawText: string, options: any, errorMessage?: string) {
  return {
    title: options.recipeName || "Custom Recipe",
    description: rawText || "A delicious recipe created based on your preferences.",
    cuisine: options.cuisine || "International",
    difficulty: options.difficulty || "Medium",
    prepTime: "15 minutes",
    cookTime: "25 minutes",
    totalTime: "40 minutes",
    servings: "4",
    costEstimate: "Moderate",
    ingredients: [
      { name: "Main ingredients", amount: "as specified", allergens: [], substitutes: "See recipe notes" },
      { name: "Seasonings", amount: "to taste", allergens: [], substitutes: "Adjust to preference" },
    ],
    equipment: ["Basic kitchen tools", "Stove or oven", "Mixing bowls"],
    instructions: [
      {
        step: 1,
        description: "Prepare all ingredients according to the recipe requirements.",
        timingTip: "Prep time: 15 minutes",
        safetyTip: "Wash hands before handling food",
      },
      {
        step: 2,
        description: "Follow cooking method appropriate for your chosen recipe.",
        timingTip: "Cook time: 25 minutes",
        safetyTip: "Cook to safe internal temperatures",
      },
      {
        step: 3,
        description: "Season to taste and serve hot.",
        timingTip: "Serve immediately",
        safetyTip: "Check temperature before serving",
      },
    ],
    nutritionalInfo: {
      calories: "350 per serving",
      protein: "20g",
      carbs: "45g",
      fat: "12g",
      fiber: "5g",
      sugar: "8g",
      sodium: "600mg",
    },
    allergenWarnings: options.dietaryRequirements?.includes("gluten-free") ? [] : ["May contain gluten"],
    dietaryClassifications: options.dietaryRequirements || [],
    tips: [
      "Adjust seasonings to your taste preference",
      "Fresh ingredients will give the best flavor",
      "Don't overcook to maintain texture",
    ],
    storage: "Store leftovers in refrigerator for up to 3 days",
    reheating: "Reheat gently to maintain texture and flavor",
    pairingRecommendations: "Pairs well with a fresh salad and your favorite beverage",
    foodSafetyTips: [
      "Always wash hands before handling food",
      "Cook proteins to safe internal temperatures",
      "Store leftovers properly in refrigerator",
      "Use clean utensils and cutting boards",
    ],
    error: errorMessage ? `Generation error: ${errorMessage}. Please try again.` : undefined,
  }
}

export async function generateRecipeClient(prompt: string, modelInfo = { provider: "openai", value: "gpt-4o" }) {
  try {
    console.log("Calling recipe API with prompt:", prompt.substring(0, 100) + "...")

    // Set a longer timeout for complex recipes
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90-second timeout

    const response = await fetch("/api/generate-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        modelInfo: modelInfo,
        // Include additional context for better recipe generation
        requireCompleteRecipe: true,
        includeNutrition: true,
        includeSafetyTips: true,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("API Error:", errorData)
      throw new Error(errorData.error || `API request failed with status ${response.status}`)
    }

    const data = await response.json()
    console.log("API Response received:", data.recipe ? "Recipe data present" : "No recipe data")

    return data.recipe
  } catch (error) {
    console.error("Error in generateRecipeClient:", error)

    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try with a simpler recipe request.")
    }

    throw error
  }
}
