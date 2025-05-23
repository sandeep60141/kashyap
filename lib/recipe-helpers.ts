/**
 * Safely parses recipe data from JSON string
 * @param recipeData - JSON string or null
 * @returns Parsed recipe object or null if invalid
 */
export function parseRecipeData(recipeData: string | null): any {
  if (!recipeData) return null

  try {
    // Try to parse the JSON
    const parsedRecipe = JSON.parse(recipeData)

    // Ensure required fields exist
    return {
      title: parsedRecipe.title || "Recipe",
      description: parsedRecipe.description || "A delicious recipe",
      ingredients: ensureArray(parsedRecipe.ingredients),
      instructions: ensureArray(parsedRecipe.instructions),
      prepTime: parsedRecipe.prepTime || "N/A",
      cookTime: parsedRecipe.cookTime || "N/A",
      totalTime: parsedRecipe.totalTime || "N/A",
      servings: parsedRecipe.servings || "4",
      difficulty: parsedRecipe.difficulty || "Medium",
      cuisine: parsedRecipe.cuisine || "Mixed",
      nutritionalInfo: parsedRecipe.nutritionalInfo || {
        calories: "N/A",
        protein: "N/A",
        carbs: "N/A",
        fat: "N/A",
      },
      equipment: ensureArray(parsedRecipe.equipment),
      foodSafetyTips: ensureArray(parsedRecipe.foodSafetyTips) || [
        "Always wash hands before handling food",
        "Cook proteins to safe internal temperatures",
        "Store leftovers properly",
        "Use separate cutting boards for raw meat and vegetables",
      ],
      allergenWarnings: ensureArray(parsedRecipe.allergenWarnings),
      dietaryClassifications: ensureArray(parsedRecipe.dietaryClassifications),
      tips: ensureArray(parsedRecipe.tips),
      storage: parsedRecipe.storage || "Store in an airtight container in the refrigerator",
      reheating: parsedRecipe.reheating || "Reheat thoroughly before serving",
      pairingRecommendations: parsedRecipe.pairingRecommendations || "",
      costEstimate: parsedRecipe.costEstimate || "Medium",
    }
  } catch (error) {
    console.error("Error parsing recipe data:", error)

    // If parsing fails, try to create a basic recipe object
    if (typeof recipeData === "string") {
      return {
        title: "Recipe",
        description: recipeData.substring(0, 100) + "...",
        ingredients: [],
        instructions: [],
        prepTime: "N/A",
        cookTime: "N/A",
        totalTime: "N/A",
        servings: "4",
        difficulty: "Medium",
        foodSafetyTips: [
          "Always wash hands before handling food",
          "Cook proteins to safe internal temperatures",
          "Store leftovers properly",
          "Use separate cutting boards for raw meat and vegetables",
        ],
      }
    }

    return null
  }
}

/**
 * Ensures a value is an array
 * @param value - Value to check
 * @returns Array version of the value or empty array
 */
function ensureArray(value: any): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "string") return [value]
  return []
}
