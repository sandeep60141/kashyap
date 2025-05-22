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
    // Construct the prompt based on the provided options
    let prompt = ""

    if (options.type === "mealPlan") {
      prompt = `Create a meal plan for ${options.days || 3} days with these details:
- Daily calories: ${options.calories || 2000}
${options.preferences ? `- Preferences: ${options.preferences}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- Dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

Include breakfast, lunch, and dinner for each day. Keep recipes simple with minimal instructions.
This is a meal plan request.`
    } else if (options.type === "pairing") {
      prompt = `Suggest the perfect ${options.pairingType || "wine"} pairing for this dish: ${options.dish || "a general meal"}.
${options.preferences ? `Preferences: ${options.preferences}` : ""}

Please provide detailed information about why this pairing works well, including flavor notes, 
complementary elements, and any serving suggestions.`
    } else if (options.type === "cocktail") {
      prompt = `Create a ${options.alcoholic === false ? "non-alcoholic " : ""}cocktail recipe with these ingredients: ${options.ingredients || "common bar ingredients"}.
${options.preferences ? `Preferences: ${options.preferences}` : ""}

Please provide a creative name for the cocktail, detailed ingredients with measurements, 
step-by-step preparation instructions, and garnish suggestions.`
    } else if (options.macros) {
      prompt = `Create a recipe for a ${options.mealType || "meal"} with these macronutrient targets:
- Protein: ${options.macros.protein}%
- Carbs: ${options.macros.carbs}%
- Fat: ${options.macros.fat}%
- Total calories: ${options.macros.calories}
${options.preferences ? `- Preferences: ${options.preferences}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- Dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}`
    } else if (options.recipeName) {
      prompt = `Create a recipe for: ${options.recipeName}.
${options.cuisine ? `Cuisine: ${options.cuisine}` : ""}
${options.difficulty ? `Difficulty: ${options.difficulty}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `Dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}`
    } else {
      prompt = `Create a recipe with these ingredients: ${options.ingredients || "common ingredients"}.
${options.preferences ? `Preferences: ${options.preferences}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `Dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}`
    }

    // Use the existing generateRecipeClient function with the constructed prompt
    const modelInfo = {
      provider: "openai",
      value: options.model || "gpt-4o",
    }

    const recipe = await generateRecipeClient(prompt, modelInfo)

    // Parse the recipe JSON
    try {
      return JSON.parse(recipe)
    } catch (e) {
      // If parsing fails, return the raw text
      return {
        title: "Generated Recipe",
        description: recipe,
        ingredients: [],
        instructions: [],
      }
    }
  } catch (error) {
    console.error("Error in generateRecipe:", error)
    throw error
  }
}

export async function generateRecipeClient(prompt: string, modelInfo = { provider: "openai", value: "gpt-4o" }) {
  try {
    // Set a longer timeout for larger meal plans
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60-second timeout

    const response = await fetch("/api/generate-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, modelInfo }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data.recipe
  } catch (error) {
    console.error("Error in generateRecipeClient:", error)

    if (error.name === "AbortError") {
      throw new Error("Request timed out. The meal plan may be too complex. Try reducing the number of days.")
    }

    throw error
  }
}
