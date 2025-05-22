// Helper functions for recipe data handling

/**
 * Safely parses a recipe string from localStorage
 * Prevents the React error #31 that occurs when trying to render objects directly
 */
export function parseRecipeData(recipeString: string | null) {
  if (!recipeString) return null

  try {
    // Parse the recipe JSON
    const recipe = JSON.parse(recipeString)

    // Ensure all expected properties exist to prevent rendering errors
    return {
      title: recipe.title || "Recipe",
      description: recipe.description || "A delicious recipe",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      prepTime: recipe.prepTime || "N/A",
      cookTime: recipe.cookTime || "N/A",
      totalTime: recipe.totalTime || "N/A",
      servings: recipe.servings || "N/A",
      difficulty: recipe.difficulty || "Medium",
      cuisine: recipe.cuisine || "N/A",
      nutritionalInfo: recipe.nutritionalInfo || {},
      equipment: Array.isArray(recipe.equipment) ? recipe.equipment : [],
      foodSafetyTips: Array.isArray(recipe.foodSafetyTips)
        ? recipe.foodSafetyTips
        : [
            "Always wash hands before and after handling food",
            "Cook meats to proper internal temperatures",
            "Refrigerate leftovers within 2 hours",
          ],
      allergenWarnings: Array.isArray(recipe.allergenWarnings) ? recipe.allergenWarnings : [],
      dietaryClassifications: Array.isArray(recipe.dietaryClassifications) ? recipe.dietaryClassifications : [],
      tips: Array.isArray(recipe.tips) ? recipe.tips : [],
      storage: recipe.storage || "Store in an airtight container in the refrigerator",
      reheating: recipe.reheating || "Reheat thoroughly before serving",
      pairingRecommendations: recipe.pairingRecommendations || "Pairs well with your favorite sides",
      costEstimate: recipe.costEstimate || "Moderate",
    }
  } catch (error) {
    console.error("Error parsing recipe data:", error)
    return null
  }
}

/**
 * Safely stores recipe data in localStorage
 */
export function storeRecipeData(recipeData: any) {
  try {
    // Convert the recipe to a string before storing
    const recipeString = typeof recipeData === "string" ? recipeData : JSON.stringify(recipeData)

    localStorage.setItem("generatedRecipe", recipeString)
    return true
  } catch (error) {
    console.error("Error storing recipe data:", error)
    return false
  }
}
