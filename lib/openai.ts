"use server"

import { OpenAI } from "openai"

// Helper function to extract JSON from a string that might contain markdown code blocks
function extractJsonFromString(text: string): string {
  console.log("Extracting JSON from:", text.substring(0, 100) + "...")

  // Check if the text contains markdown code blocks
  const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
  const match = text.match(jsonRegex)

  if (match && match[1]) {
    // Return the content inside the code block
    console.log("Found JSON in code block")
    return match[1]
  }

  // If no code blocks found, try to find JSON directly
  try {
    // Check if the text is already valid JSON
    JSON.parse(text)
    console.log("Text is already valid JSON")
    return text
  } catch (e) {
    // Try to extract JSON-like content
    const possibleJson = text.match(/(\{[\s\S]*\})/)
    if (possibleJson && possibleJson[1]) {
      console.log("Found possible JSON content")
      try {
        JSON.parse(possibleJson[1])
        return possibleJson[1]
      } catch (e) {
        console.log("Extracted content is not valid JSON")
      }
    }
  }

  // If no JSON found, return the original text
  console.log("No JSON found, returning original text")
  return text
}

export async function generateRecipe(prompt: string, modelInfo = { provider: "openai", value: "gpt-4o" }) {
  console.log("Generating recipe with prompt:", prompt)
  console.log("Using model:", modelInfo)

  // Enhanced system prompt for accuracy
  let systemPrompt = `You are ChefGPT, an AI assistant specialized in creating accurate, safe, and delicious recipes. 
  Your primary goal is to provide 100% accurate culinary information. Follow these guidelines:
  
  1. Only include ingredients that are safe for human consumption
  2. Provide accurate cooking times and temperatures to ensure food safety
  3. Include allergen warnings for common allergens (nuts, dairy, gluten, shellfish, etc.)
  4. Ensure nutritional information is realistic and accurate
  5. Provide clear, step-by-step instructions that are easy to follow
  6. Double-check that ingredient quantities are appropriate and realistic
  7. Include food safety tips where relevant (e.g., internal cooking temperatures for meat)
  
  Return ONLY the JSON without any markdown formatting, code blocks, or additional text.`

  if (prompt.includes("meal plan")) {
    console.log("Detected meal plan request")
    systemPrompt += `
    Format your response as JSON with the following structure:
    {
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
  } else if (prompt.includes("pairing") || prompt.includes("drink")) {
    console.log("Detected pairing request")
    systemPrompt += `
    Format your response as JSON with the following structure:
    {
      "title": "Pairing Title",
      "description": "Brief description of the pairing",
      "pairing": "The recommended drink",
      "pairingNotes": "Detailed notes about why this pairing works well",
      "flavorProfile": "Description of the flavor profile and how it complements the food",
      "alcoholContent": "Alcohol content if applicable, or mark as Non-Alcoholic",
      "ingredients": [
        { "name": "Ingredient name", "amount": "Amount with unit", "allergens": ["List allergens if any"] }
      ],
      "instructions": [
        "Step 1 instruction",
        "Step 2 instruction"
      ],
      "servingTemperature": "Recommended serving temperature",
      "glassware": "Recommended glassware",
      "garnish": "Recommended garnish",
      "tips": [
        "Optional serving tip"
      ],
      "alternatives": ["Non-alcoholic alternatives", "Similar options"]
    }`
  } else if (prompt.includes("cocktail")) {
    console.log("Detected cocktail request")
    systemPrompt += `
    Format your response as JSON with the following structure:
    {
      "title": "Cocktail Name",
      "description": "Brief description of the cocktail",
      "alcoholContent": "Approximate alcohol content (ABV)",
      "prepTime": "Preparation time in minutes",
      "difficulty": "Easy/Medium/Hard",
      "ingredients": [
        { "name": "Ingredient name", "amount": "Amount with unit", "allergens": ["List allergens if any"] }
      ],
      "instructions": [
        "Step 1 instruction",
        "Step 2 instruction"
      ],
      "mixingTechnique": "Shaken/Stirred/Built/Blended",
      "glassware": "Type of glass to serve in",
      "ice": "Type of ice recommended",
      "garnish": "Garnish description",
      "flavorProfile": "Sweet/Sour/Bitter/Herbal/etc.",
      "tips": [
        "Optional mixing tip"
      ],
      "nonAlcoholicVersion": "How to make this drink without alcohol",
      "nutritionalInfo": {
        "calories": "Approximate calories",
        "sugar": "Sugar content estimate"
      }
    }`
  } else {
    console.log("Detected standard recipe request")
    systemPrompt += `
    Format your response as JSON with the following structure:
    {
      "title": "Recipe Title",
      "description": "Brief description of the dish",
      "cuisine": "Cuisine type (Italian, Mexican, etc.)",
      "difficulty": "Easy/Medium/Hard",
      "prepTime": "Preparation time in minutes",
      "cookTime": "Cooking time in minutes",
      "totalTime": "Total time in minutes",
      "servings": "Number of servings",
      "costEstimate": "Budget/Moderate/Expensive",
      "ingredients": [
        { "name": "Ingredient name", "amount": "Amount with unit", "allergens": ["List allergens if any"], "substitutes": "Possible substitutions" }
      ],
      "equipment": ["Required kitchen tools"],
      "instructions": [
        { "step": 1, "description": "Step 1 instruction", "timingTip": "Any timing guidance", "safetyTip": "Any safety tips" }
      ],
      "nutritionalInfo": {
        "calories": "Calories per serving",
        "protein": "Protein in grams",
        "carbs": "Carbohydrates in grams",
        "fat": "Fat in grams",
        "fiber": "Fiber in grams",
        "sugar": "Sugar in grams",
        "sodium": "Sodium in mg"
      },
      "allergenWarnings": ["List all potential allergens"],
      "dietaryClassifications": ["Vegetarian", "Vegan", "Gluten-Free", etc.],
      "tips": [
        "Optional cooking tip"
      ],
      "storage": "Storage instructions and shelf life",
      "reheating": "Reheating instructions if applicable",
      "pairingRecommendations": "Recommended side dishes or drinks"
    }`
  }

  try {
    console.log("Calling AI API...")

    // Initialize the appropriate client based on the provider
    let client
    if (modelInfo.provider === "deepseek") {
      client = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY || "",
        baseURL: "https://api.deepseek.com/v1",
      })
    } else {
      client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
      })
    }

    // Call the API with the appropriate model
    const response = await client.chat.completions.create({
      model: modelInfo.value,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5, // Lower temperature for more accurate results
      max_tokens: 4000, // Increased from 2000 to 4000 for longer meal plans
    })

    // Extract the response text
    const text = response.choices[0].message.content || ""
    console.log("Received response from AI:", text.substring(0, 100) + "...")

    // Extract JSON from the response in case it's wrapped in markdown code blocks
    const cleanedJson = extractJsonFromString(text)
    console.log("Cleaned JSON:", cleanedJson.substring(0, 100) + "...")

    // Validate that it's proper JSON by parsing and stringifying it
    try {
      const parsedJson = JSON.parse(cleanedJson)

      // Validate the recipe data for safety and accuracy
      validateRecipeData(parsedJson)

      return JSON.stringify(parsedJson)
    } catch (error) {
      console.error("Error parsing JSON:", error)
      console.log("Attempting to fix malformed JSON...")

      // Try to fix common JSON issues
      const fixedJson = cleanedJson
        .replace(/(\w+):/g, '"$1":') // Convert unquoted keys to quoted keys
        .replace(/'/g, '"') // Replace single quotes with double quotes

      try {
        const parsedJson = JSON.parse(fixedJson)

        // Validate the recipe data for safety and accuracy
        validateRecipeData(parsedJson)

        return JSON.stringify(parsedJson)
      } catch (error) {
        console.error("Failed to fix JSON:", error)
        throw new Error("Failed to parse recipe JSON")
      }
    }
  } catch (error) {
    console.error("Error generating recipe:", error)

    // Check if it's a token limit error
    if (
      error.message &&
      (error.message.includes("maximum context length") ||
        error.message.includes("token") ||
        error.message.includes("too large"))
    ) {
      throw new Error(
        "The meal plan is too complex. Please try reducing the number of days or simplifying your requirements.",
      )
    }

    // Return a fallback recipe in case of error
    return JSON.stringify({
      title: "Recipe Generation Error",
      description: "We encountered an error while generating your recipe. Please try again.",
      prepTime: "N/A",
      cookTime: "N/A",
      servings: "N/A",
      ingredients: [],
      instructions: ["Please try again with different inputs."],
      nutritionalInfo: {
        calories: "N/A",
        protein: "N/A",
        carbs: "N/A",
        fat: "N/A",
      },
      tips: ["Try refreshing the page or using different inputs."],
    })
  }
}

// Add enhanced validation function at the end of the file
function validateRecipeData(recipe: any) {
  // Check for missing essential fields
  if (!recipe.title) {
    recipe.title = "Untitled Recipe"
  }

  if (!recipe.description) {
    recipe.description = "A delicious recipe created with care."
  }

  // Ensure ingredients array exists and is properly formatted
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    recipe.ingredients = []
  }

  // Validate and enhance ingredients
  recipe.ingredients = recipe.ingredients.map((ingredient: any) => {
    if (typeof ingredient === "string") {
      return {
        name: ingredient,
        amount: "as needed",
        allergens: [],
        substitutes: "",
      }
    }

    // Ensure ingredient object has required fields
    return {
      name: ingredient.name || "Unknown ingredient",
      amount: ingredient.amount || "as needed",
      allergens: Array.isArray(ingredient.allergens) ? ingredient.allergens : [],
      substitutes: ingredient.substitutes || "",
    }
  })

  // Ensure instructions array exists and is properly formatted
  if (!recipe.instructions || !Array.isArray(recipe.instructions)) {
    recipe.instructions = []
  }

  // Validate and enhance instructions
  recipe.instructions = recipe.instructions.map((instruction: any, index: number) => {
    if (typeof instruction === "string") {
      return {
        step: index + 1,
        description: instruction,
        timingTip: "",
        safetyTip: "",
      }
    }

    return {
      step: instruction.step || index + 1,
      description: instruction.description || `Step ${index + 1}`,
      timingTip: instruction.timingTip || "",
      safetyTip: instruction.safetyTip || "",
    }
  })

  // Ensure nutritional info exists
  if (!recipe.nutritionalInfo) {
    recipe.nutritionalInfo = {
      calories: "Not calculated",
      protein: "Not calculated",
      carbs: "Not calculated",
      fat: "Not calculated",
      fiber: "Not calculated",
      sodium: "Not calculated",
    }
  }

  // Enhanced food safety tips with more comprehensive coverage
  if (!recipe.foodSafetyTips || !Array.isArray(recipe.foodSafetyTips) || recipe.foodSafetyTips.length === 0) {
    recipe.foodSafetyTips = [
      "Always wash hands thoroughly with soap and warm water for at least 20 seconds before handling food",
      "Cook proteins to safe internal temperatures: 165°F (74°C) for poultry, 160°F (71°C) for ground meat, 145°F (63°C) for whole cuts of beef/pork/lamb",
      "Store leftovers in refrigerator within 2 hours of cooking (1 hour if temperature is above 90°F)",
      "Use separate cutting boards for raw meat and vegetables to prevent cross-contamination",
      "Keep hot foods hot (above 140°F/60°C) and cold foods cold (below 40°F/4°C)",
      "When in doubt, throw it out - don't risk foodborne illness with questionable ingredients",
    ]
  }

  // Add ingredient-specific safety tips
  const hasRawMeat = recipe.ingredients.some((ing: any) => {
    const name = (ing.name || "").toLowerCase()
    return (
      name.includes("chicken") ||
      name.includes("beef") ||
      name.includes("pork") ||
      name.includes("turkey") ||
      name.includes("fish") ||
      name.includes("seafood")
    )
  })

  const hasEggs = recipe.ingredients.some((ing: any) => {
    const name = (ing.name || "").toLowerCase()
    return name.includes("egg")
  })

  const hasDairy = recipe.ingredients.some((ing: any) => {
    const name = (ing.name || "").toLowerCase()
    return name.includes("milk") || name.includes("cream") || name.includes("cheese") || name.includes("yogurt")
  })

  // Add specific safety tips based on ingredients
  if (hasRawMeat) {
    recipe.foodSafetyTips.push(
      "Thaw frozen meat safely in the refrigerator, never at room temperature",
      "Use a food thermometer to ensure meat reaches safe internal temperatures",
      "Marinate meat in the refrigerator, not on the counter",
    )
  }

  if (hasEggs) {
    recipe.foodSafetyTips.push(
      "Use pasteurized eggs for recipes that call for raw or undercooked eggs",
      "Cook eggs until both yolk and white are firm",
    )
  }

  if (hasDairy) {
    recipe.foodSafetyTips.push(
      "Check expiration dates on dairy products before use",
      "Keep dairy products refrigerated at all times when not in use",
    )
  }

  // Ensure allergen warnings exist and are comprehensive
  if (!recipe.allergenWarnings) {
    recipe.allergenWarnings = []
  }

  // Auto-detect common allergens from ingredients
  const commonAllergens = {
    nuts: ["nuts", "peanuts", "almonds", "walnuts", "cashews", "pecans", "hazelnuts", "pistachios"],
    dairy: ["milk", "cheese", "butter", "cream", "yogurt", "whey", "casein"],
    eggs: ["egg", "eggs"],
    wheat: ["wheat", "flour", "bread", "pasta"],
    soy: ["soy", "tofu", "tempeh", "soy sauce"],
    fish: ["fish", "salmon", "tuna", "cod", "halibut"],
    shellfish: ["shrimp", "crab", "lobster", "clams", "mussels", "oysters"],
    sesame: ["sesame", "tahini"],
  }

  Object.entries(commonAllergens).forEach(([allergen, keywords]) => {
    const hasAllergen = recipe.ingredients.some((ing: any) => {
      const name = (ing.name || "").toLowerCase()
      return keywords.some((keyword) => name.includes(keyword))
    })

    if (hasAllergen && !recipe.allergenWarnings.includes(allergen)) {
      recipe.allergenWarnings.push(allergen)
    }
  })

  // Ensure dietary classifications exist
  if (!recipe.dietaryClassifications) {
    recipe.dietaryClassifications = []
  }

  // Auto-detect dietary classifications
  const hasAnimalProducts = recipe.ingredients.some((ing: any) => {
    const name = (ing.name || "").toLowerCase()
    return (
      name.includes("meat") ||
      name.includes("chicken") ||
      name.includes("beef") ||
      name.includes("pork") ||
      name.includes("fish") ||
      name.includes("seafood") ||
      name.includes("milk") ||
      name.includes("cheese") ||
      name.includes("butter") ||
      name.includes("cream") ||
      name.includes("egg")
    )
  })

  const hasGluten = recipe.ingredients.some((ing: any) => {
    const name = (ing.name || "").toLowerCase()
    return (
      name.includes("wheat") ||
      name.includes("flour") ||
      name.includes("bread") ||
      name.includes("pasta") ||
      name.includes("soy sauce")
    )
  })

  if (!hasAnimalProducts) {
    if (!recipe.dietaryClassifications.includes("Vegetarian")) {
      recipe.dietaryClassifications.push("Vegetarian")
    }

    const hasDairy = recipe.ingredients.some((ing: any) => {
      const name = (ing.name || "").toLowerCase()
      return (
        name.includes("milk") ||
        name.includes("cheese") ||
        name.includes("butter") ||
        name.includes("cream") ||
        name.includes("yogurt")
      )
    })

    const hasEggs = recipe.ingredients.some((ing: any) => {
      const name = (ing.name || "").toLowerCase()
      return name.includes("egg")
    })

    if (!hasDairy && !hasEggs && !recipe.dietaryClassifications.includes("Vegan")) {
      recipe.dietaryClassifications.push("Vegan")
    }
  }

  if (!hasGluten && !recipe.dietaryClassifications.includes("Gluten-Free")) {
    recipe.dietaryClassifications.push("Gluten-Free")
  }

  // Ensure cooking times are realistic
  if (!recipe.prepTime || recipe.prepTime === "N/A") {
    recipe.prepTime = "15 minutes"
  }

  if (!recipe.cookTime || recipe.cookTime === "N/A") {
    recipe.cookTime = "20 minutes"
  }

  if (!recipe.totalTime || recipe.totalTime === "N/A") {
    // Calculate total time from prep and cook time
    const prepMinutes = Number.parseInt(recipe.prepTime) || 15
    const cookMinutes = Number.parseInt(recipe.cookTime) || 20
    recipe.totalTime = `${prepMinutes + cookMinutes} minutes`
  }

  // Ensure servings is realistic
  if (!recipe.servings || recipe.servings === "N/A") {
    recipe.servings = "4"
  }

  // Ensure difficulty is set
  if (!recipe.difficulty) {
    recipe.difficulty = "Medium"
  }

  // Add storage and reheating instructions if missing
  if (!recipe.storage) {
    recipe.storage = "Store leftovers in an airtight container in the refrigerator for up to 3-4 days"
  }

  if (!recipe.reheating) {
    recipe.reheating =
      "Reheat thoroughly to 165°F (74°C) before serving. Microwave in 30-second intervals, stirring between, or reheat in oven at 350°F until heated through"
  }

  return recipe
}
