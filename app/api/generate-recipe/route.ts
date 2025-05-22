import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

// Helper function to extract JSON from a string that might contain markdown code blocks
function extractJsonFromString(text: string): string {
  // Check if the text contains markdown code blocks
  const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
  const match = text.match(jsonRegex)

  if (match && match[1]) {
    // Return the content inside the code block
    return match[1]
  }

  // If no code blocks found, try to find JSON directly
  try {
    // Check if the text is already valid JSON
    JSON.parse(text)
    return text
  } catch (e) {
    // Try to extract JSON-like content
    const possibleJson = text.match(/(\{[\s\S]*\})/)
    if (possibleJson && possibleJson[1]) {
      try {
        JSON.parse(possibleJson[1])
        return possibleJson[1]
      } catch (e) {
        console.log("Extracted content is not valid JSON")
      }
    }
  }

  // If no JSON found, return the original text
  return text
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

  // For meal plans, ensure days array exists
  if (recipe.days && !Array.isArray(recipe.days)) {
    recipe.days = []
  }

  // If it's a meal plan but doesn't have the days array, create a simple structure
  if (recipe.title && recipe.title.toLowerCase().includes("meal plan") && !recipe.days) {
    recipe.days = [
      {
        dayNumber: 1,
        meals: [
          {
            name: "Breakfast",
            description: "Simple breakfast option",
            ingredients: [],
            instructions: [],
          },
          {
            name: "Lunch",
            description: "Simple lunch option",
            ingredients: [],
            instructions: [],
          },
          {
            name: "Dinner",
            description: "Simple dinner option",
            ingredients: [],
            instructions: [],
          },
        ],
      },
    ]
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

export async function POST(request: NextRequest) {
  try {
    const { prompt, modelInfo } = await request.json()

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

    // Simplified meal plan structure for better reliability
    if (prompt.toLowerCase().includes("meal plan")) {
      systemPrompt += `
      Format your response as JSON with the following structure:
      {
        "title": "Meal Plan Title",
        "description": "Brief description of the meal plan",
        "days": [
          {
            "dayNumber": 1,
            "meals": [
              {
                "name": "Breakfast",
                "description": "Detailed meal description",
                "ingredients": [
                  { "name": "Ingredient name", "amount": "Amount with unit" }
                ],
                "instructions": ["Step 1", "Step 2"]
              },
              {
                "name": "Lunch",
                "description": "Detailed meal description",
                "ingredients": [
                  { "name": "Ingredient name", "amount": "Amount with unit" }
                ],
                "instructions": ["Step 1", "Step 2"]
              },
              {
                "name": "Dinner",
                "description": "Detailed meal description",
                "ingredients": [
                  { "name": "Ingredient name", "amount": "Amount with unit" }
                ],
                "instructions": ["Step 1", "Step 2"]
              }
            ]
          }
        ],
        "tips": ["Meal prep tips", "Storage recommendations", "Substitution suggestions"]
      }`
    } else if (prompt.includes("pairing") || prompt.includes("drink")) {
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
          { "name": "Ingredient name", "amount": "Amount with unit" }
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
      systemPrompt += `
      Format your response as JSON with the following structure:
      {
        "title": "Cocktail Name",
        "description": "Brief description of the cocktail",
        "alcoholContent": "Approximate alcohol content (ABV)",
        "prepTime": "Preparation time in minutes",
        "difficulty": "Easy/Medium/Hard",
        "ingredients": [
          { "name": "Ingredient name", "amount": "Amount with unit" }
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
          { "name": "Ingredient name", "amount": "Amount with unit" }
        ],
        "equipment": ["Required kitchen tools"],
        "instructions": [
          { "step": 1, "description": "Step 1 instruction" }
        ],
        "nutritionalInfo": {
          "calories": "Calories per serving",
          "protein": "Protein in grams",
          "carbs": "Carbohydrates in grams",
          "fat": "Fat in grams"
        },
        "allergenWarnings": ["List all potential allergens"],
        "dietaryClassifications": ["Vegetarian", "Vegan", "Gluten-Free", etc.],
        "tips": [
          "Optional cooking tip"
        ],
        "storage": "Storage instructions and shelf life",
        "reheating": "Reheating instructions if applicable"
      }`
    }

    // Check if we have the API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // Return a mock recipe if no API key is available
      if (prompt.toLowerCase().includes("meal plan")) {
        return NextResponse.json({
          recipe: JSON.stringify({
            title: "Sample Meal Plan (API Key Missing)",
            description: "This is a mock meal plan because the OpenAI API key is not configured.",
            days: [
              {
                dayNumber: 1,
                meals: [
                  {
                    name: "Breakfast",
                    description: "Simple breakfast option",
                    ingredients: [
                      { name: "Eggs", amount: "2 large" },
                      { name: "Bread", amount: "2 slices" },
                    ],
                    instructions: ["Cook eggs as desired", "Toast bread", "Serve together"],
                  },
                  {
                    name: "Lunch",
                    description: "Simple lunch option",
                    ingredients: [
                      { name: "Chicken breast", amount: "1 medium" },
                      { name: "Mixed greens", amount: "2 cups" },
                    ],
                    instructions: ["Cook chicken", "Prepare salad", "Combine and serve"],
                  },
                  {
                    name: "Dinner",
                    description: "Simple dinner option",
                    ingredients: [
                      { name: "Salmon fillet", amount: "1 piece" },
                      { name: "Brown rice", amount: "1/2 cup" },
                      { name: "Broccoli", amount: "1 cup" },
                    ],
                    instructions: ["Cook salmon", "Prepare rice and broccoli", "Serve together"],
                  },
                ],
              },
            ],
            tips: ["This is a mock meal plan due to missing API key configuration."],
          }),
        })
      } else {
        return NextResponse.json({
          recipe: JSON.stringify({
            title: "API Key Missing",
            description: "This is a mock recipe because the OpenAI API key is not configured.",
            prepTime: "10 minutes",
            cookTime: "20 minutes",
            totalTime: "30 minutes",
            servings: "4",
            ingredients: [
              { name: "Ingredient 1", amount: "1 cup" },
              { name: "Ingredient 2", amount: "2 tablespoons" },
            ],
            instructions: [
              "This is a mock recipe. Please configure the OpenAI API key to generate real recipes.",
              "Contact the administrator to set up the API key.",
            ],
            nutritionalInfo: {
              calories: "N/A",
              protein: "N/A",
              carbs: "N/A",
              fat: "N/A",
            },
            tips: ["This is a mock recipe due to missing API key configuration."],
          }),
        })
      }
    }

    // Initialize the appropriate client based on the provider
    let client
    if (modelInfo?.provider === "deepseek") {
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY
      if (!deepseekApiKey) {
        return NextResponse.json({
          recipe: JSON.stringify({
            title: "DeepSeek API Key Missing",
            description: "This is a mock recipe because the DeepSeek API key is not configured.",
            instructions: ["Please configure the DeepSeek API key to use this model."],
          }),
        })
      }

      client = new OpenAI({
        apiKey: deepseekApiKey,
        baseURL: "https://api.deepseek.com/v1",
      })
    } else {
      client = new OpenAI({
        apiKey,
      })
    }

    // Call the API with the appropriate model
    const response = await client.chat.completions.create({
      model: modelInfo?.value || "gpt-4o",
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

    // Extract JSON from the response in case it's wrapped in markdown code blocks
    const cleanedJson = extractJsonFromString(text)

    // Validate that it's proper JSON by parsing and stringifying it
    try {
      const parsedJson = JSON.parse(cleanedJson)

      // Validate the recipe data for safety and accuracy
      validateRecipeData(parsedJson)

      return NextResponse.json({ recipe: JSON.stringify(parsedJson) })
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

        return NextResponse.json({ recipe: JSON.stringify(parsedJson) })
      } catch (error) {
        console.error("Failed to fix JSON:", error)

        // Return a simplified meal plan as fallback
        if (prompt.toLowerCase().includes("meal plan")) {
          return NextResponse.json({
            recipe: JSON.stringify({
              title: "Simple Meal Plan",
              description: "A basic meal plan generated as a fallback due to an error in processing your request.",
              days: [
                {
                  dayNumber: 1,
                  meals: [
                    {
                      name: "Breakfast",
                      description: "Simple breakfast option",
                      ingredients: [
                        { name: "Oatmeal", amount: "1 cup" },
                        { name: "Berries", amount: "1/2 cup" },
                      ],
                      instructions: ["Prepare oatmeal according to package instructions", "Top with berries"],
                    },
                    {
                      name: "Lunch",
                      description: "Simple lunch option",
                      ingredients: [
                        { name: "Chicken breast", amount: "1 medium" },
                        { name: "Mixed greens", amount: "2 cups" },
                      ],
                      instructions: ["Cook chicken", "Prepare salad", "Combine and serve"],
                    },
                    {
                      name: "Dinner",
                      description: "Simple dinner option",
                      ingredients: [
                        { name: "Salmon fillet", amount: "1 piece" },
                        { name: "Brown rice", amount: "1/2 cup" },
                        { name: "Broccoli", amount: "1 cup" },
                      ],
                      instructions: ["Cook salmon", "Prepare rice and broccoli", "Serve together"],
                    },
                  ],
                },
              ],
              tips: ["This is a simplified meal plan due to an error in processing your request."],
            }),
          })
        }

        return NextResponse.json({ error: "Failed to parse recipe JSON" }, { status: 500 })
      }
    }
  } catch (error) {
    console.error("Error generating recipe:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    // Return a fallback recipe in case of error
    const fallbackRecipe = {
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
    }

    return NextResponse.json({ recipe: JSON.stringify(fallbackRecipe) }, { status: 500 })
  }
}
