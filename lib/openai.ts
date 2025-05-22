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

// Function to validate recipe data for safety and accuracy
function validateRecipeData(recipe: any) {
  // Check for missing essential fields
  if (!recipe.title) {
    recipe.title = "Untitled Recipe"
  }

  if (!recipe.description) {
    recipe.description = "No description provided."
  }

  // Ensure ingredients array exists
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    recipe.ingredients = []
  }

  // Ensure instructions array exists
  if (!recipe.instructions || !Array.isArray(recipe.instructions)) {
    recipe.instructions = []
  }

  // Add allergen warnings if not present
  if (!recipe.allergenWarnings && recipe.ingredients) {
    const allergens = new Set<string>()
    const commonAllergens = [
      "nuts",
      "peanuts",
      "almonds",
      "walnuts",
      "cashews",
      "dairy",
      "milk",
      "cheese",
      "butter",
      "cream",
      "eggs",
      "wheat",
      "gluten",
      "soy",
      "fish",
      "shellfish",
      "sesame",
      "mustard",
      "celery",
      "lupin",
      "molluscs",
      "sulphites",
    ]

    recipe.ingredients.forEach((ingredient: any) => {
      if (ingredient.name) {
        const lowerName = ingredient.name.toLowerCase()
        commonAllergens.forEach((allergen) => {
          if (lowerName.includes(allergen)) {
            allergens.add(allergen)
          }
        })
      }

      if (ingredient.allergens && Array.isArray(ingredient.allergens)) {
        ingredient.allergens.forEach((allergen: string) => allergens.add(allergen))
      }
    })

    recipe.allergenWarnings = Array.from(allergens)
  }

  // Ensure nutritional info exists
  if (!recipe.nutritionalInfo) {
    recipe.nutritionalInfo = {
      calories: "Not available",
      protein: "Not available",
      carbs: "Not available",
      fat: "Not available",
    }
  }

  // Add food safety tips if not present
  if (!recipe.foodSafetyTips && recipe.ingredients) {
    const hasMeat = recipe.ingredients.some((ingredient: any) => {
      const name = ingredient.name ? ingredient.name.toLowerCase() : ""
      return (
        name.includes("chicken") ||
        name.includes("beef") ||
        name.includes("pork") ||
        name.includes("fish") ||
        name.includes("meat") ||
        name.includes("turkey")
      )
    })

    if (hasMeat && !recipe.foodSafetyTips) {
      recipe.foodSafetyTips = [
        "Ensure meat is cooked to a safe internal temperature: 165°F (74°C) for chicken/poultry, 145°F (63°C) for fish, 160°F (71°C) for ground meats, and 145°F (63°C) with a 3-minute rest for whole cuts of beef/pork/lamb.",
        "Always wash hands and surfaces after handling raw meat.",
        "Use separate cutting boards for raw meat and other ingredients.",
      ]
    }
  }

  return recipe
}
