"use server"

import { OpenAI } from "openai"

// Helper function to extract JSON from a string that might contain markdown code blocks
function extractJsonFromString(text: string): string {
  console.log("Extracting JSON from:", text.substring(0, 100) + "...")

  // Check if the text contains markdown code blocks
  const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
  const match = text.match(jsonRegex)

  if (match && match[1]) {
    console.log("Found JSON in code block")
    return match[1]
  }

  // If no code blocks found, try to find JSON directly
  try {
    JSON.parse(text)
    console.log("Text is already valid JSON")
    return text
  } catch (e) {
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

  console.log("No JSON found, returning original text")
  return text
}

export async function generateRecipe(prompt: string, modelInfo = { provider: "openai", value: "gpt-4o" }) {
  console.log("Generating recipe with prompt:", prompt)
  console.log("Using model:", modelInfo)

  // Enhanced system prompt for accuracy and relevance
  let systemPrompt = `You are ChefGPT, an AI assistant specialized in creating accurate, safe, and relevant recipes. 

CRITICAL REQUIREMENTS:
1. You MUST create a recipe that directly matches what the user requested
2. If user asks for "egg recipe" - create an EGG-based recipe (like scrambled eggs, omelet, etc.)
3. If user asks for "chicken recipe" - create a CHICKEN-based recipe
4. If user asks for "pasta recipe" - create a PASTA-based recipe
5. NEVER ignore the user's main ingredient or dish request
6. The recipe MUST be relevant to their specific request

ACCURACY GUIDELINES:
1. Only include ingredients that are safe for human consumption
2. Provide accurate cooking times and temperatures for food safety
3. Include allergen warnings for common allergens (nuts, dairy, gluten, shellfish, etc.)
4. Ensure nutritional information is realistic and accurate
5. Provide clear, step-by-step instructions that are easy to follow
6. Double-check that ingredient quantities are appropriate and realistic
7. Include food safety tips where relevant (e.g., internal cooking temperatures for meat)
8. Ensure the recipe title and ingredients match the user's request

Return ONLY the JSON without any markdown formatting, code blocks, or additional text.`

  // Check for meal plan requests more comprehensively
  if (
    prompt.includes("meal plan") ||
    prompt.includes("day meal") ||
    prompt.includes("days") ||
    prompt.includes("breakfast, lunch") ||
    prompt.includes("daily calories")
  ) {
    console.log("Detected meal plan request")
    systemPrompt += `
  
  Create a comprehensive meal plan that includes the types of foods the user specifically requested.
  
  Format your response as JSON with the following structure:
  {
    "title": "Meal Plan Title (must reflect user's dietary preferences and duration)",
    "description": "Brief description that matches user's request",
    "calorieTarget": "Daily calorie target based on provided information",
    "nutritionNotes": "Important notes about the nutritional balance of this plan",
    "allergenWarning": "List any potential allergens in this meal plan",
    "days": [
      {
        "dayNumber": 1,
        "meals": [
          {
            "name": "Breakfast",
            "description": "Detailed meal description that matches user preferences",
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
          },
          {
            "name": "Lunch",
            "description": "Detailed meal description that matches user preferences",
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
          },
          {
            "name": "Dinner",
            "description": "Detailed meal description that matches user preferences",
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
    "tips": ["Meal prep tips", "Storage recommendations", "Substitution suggestions"],
    "shoppingList": ["Consolidated ingredient list for all days"]
  }`
  } else if (prompt.includes("pairing") || prompt.includes("drink")) {
    console.log("Detected pairing request")
    systemPrompt += `
    
    Create a pairing that specifically complements the dish or food the user mentioned.
    
    Format your response as JSON with the following structure:
    {
      "title": "Pairing Title (must relate to user's specific dish)",
      "description": "Brief description of the pairing for the user's specific request",
      "pairing": "The recommended drink that pairs with their specific dish",
      "pairingNotes": "Detailed notes about why this pairing works well with their specific dish",
      "flavorProfile": "Description of how flavors complement the user's specific dish",
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
    
    Create a cocktail recipe that matches the user's specific request or ingredients mentioned.
    
    Format your response as JSON with the following structure:
    {
      "title": "Cocktail Name (must relate to user's request)",
      "description": "Brief description that matches what user asked for",
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
    
    CRITICAL: Analyze the user's request and create a recipe that EXACTLY matches what they asked for.
    
    Examples:
    - If they mention "egg" → Create an egg-based recipe (scrambled eggs, omelet, egg fried rice, etc.)
    - If they mention "chicken" → Create a chicken-based recipe
    - If they mention "pasta" → Create a pasta-based recipe
    - If they mention "vegetarian" → Create a vegetarian recipe with NO meat
    - If they mention specific ingredients → Use those ingredients as main components
    
    Format your response as JSON with the following structure:
    {
      "title": "Recipe Title (MUST match user's request - if they asked for eggs, this should be an egg recipe)",
      "description": "Brief description that confirms this recipe matches their request",
      "cuisine": "Cuisine type (Italian, Mexican, etc.)",
      "difficulty": "Easy/Medium/Hard",
      "prepTime": "Preparation time in minutes",
      "cookTime": "Cooking time in minutes",
      "totalTime": "Total time in minutes",
      "servings": "Number of servings",
      "costEstimate": "Budget/Moderate/Expensive",
      "ingredients": [
        { "name": "Ingredient name (MUST include user's requested main ingredients)", "amount": "Amount with unit", "allergens": ["List allergens if any"], "substitutes": "Possible substitutions" }
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
          content: `Create a recipe based on this request: ${prompt}
          
          IMPORTANT: Make sure the recipe directly relates to what I asked for. If I mentioned specific ingredients or dish types, the recipe MUST include those as main components.`,
        },
      ],
      temperature: 0.3, // Lower temperature for more accurate, focused results
      max_tokens: 4000,
    })

    // Extract the response text
    const text = response.choices[0].message.content || ""
    console.log("Received response from AI:", text.substring(0, 100) + "...")

    // Extract JSON from the response
    const cleanedJson = extractJsonFromString(text)
    console.log("Cleaned JSON:", cleanedJson.substring(0, 100) + "...")

    // Validate that it's proper JSON by parsing and stringifying it
    try {
      const parsedJson = JSON.parse(cleanedJson)

      // Validate the recipe data for safety and accuracy
      const validatedRecipe = validateRecipeRelevance(parsedJson, prompt)

      return JSON.stringify(validatedRecipe)
    } catch (error) {
      console.error("Error parsing JSON:", error)
      console.log("Attempting to fix malformed JSON...")

      // Try to fix common JSON issues
      const fixedJson = cleanedJson.replace(/(\w+):/g, '"$1":').replace(/'/g, '"')

      try {
        const parsedJson = JSON.parse(fixedJson)
        const validatedRecipe = validateRecipeRelevance(parsedJson, prompt)
        return JSON.stringify(validatedRecipe)
      } catch (error) {
        console.error("Failed to fix JSON:", error)
        throw new Error("Failed to parse recipe JSON")
      }
    }
  } catch (error) {
    console.error("Error generating recipe:", error)

    if (
      error.message &&
      (error.message.includes("maximum context length") ||
        error.message.includes("token") ||
        error.message.includes("too large"))
    ) {
      throw new Error(
        "The request is too complex. Please try reducing the complexity or simplifying your requirements.",
      )
    }

    // Return a fallback recipe that matches the user's request
    return JSON.stringify(createRelevantFallbackRecipe(prompt))
  }
}

// Function to validate recipe relevance to user request
function validateRecipeRelevance(recipe: any, originalPrompt: string) {
  console.log("Validating recipe relevance for prompt:", originalPrompt)

  // Extract key ingredients/terms from the user's prompt
  const promptLower = originalPrompt.toLowerCase()
  const keyIngredients = []

  // Common ingredients to check for
  const ingredientKeywords = [
    "egg",
    "eggs",
    "chicken",
    "beef",
    "pork",
    "fish",
    "salmon",
    "tuna",
    "pasta",
    "rice",
    "bread",
    "potato",
    "tomato",
    "cheese",
    "milk",
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
  ]

  ingredientKeywords.forEach((keyword) => {
    if (promptLower.includes(keyword)) {
      keyIngredients.push(keyword)
    }
  })

  console.log("Key ingredients found in prompt:", keyIngredients)

  // Check if recipe ingredients match the request
  if (keyIngredients.length > 0) {
    const recipeIngredients = recipe.ingredients || []
    const recipeIngredientsText = JSON.stringify(recipeIngredients).toLowerCase()
    const recipeTitleText = (recipe.title || "").toLowerCase()

    let hasMatchingIngredients = false

    keyIngredients.forEach((ingredient) => {
      if (recipeIngredientsText.includes(ingredient) || recipeTitleText.includes(ingredient)) {
        hasMatchingIngredients = true
      }
    })

    // If no matching ingredients found, this is likely an irrelevant recipe
    if (!hasMatchingIngredients) {
      console.log("Recipe doesn't match user request, creating relevant recipe")
      return createRelevantFallbackRecipe(originalPrompt)
    }
  }

  // Validate the recipe data for safety and accuracy
  return validateRecipeData(recipe)
}

// Function to create a relevant fallback recipe based on user request
function createRelevantFallbackRecipe(prompt: string) {
  const promptLower = prompt.toLowerCase()

  // Determine what type of recipe to create based on the prompt
  if (promptLower.includes("egg")) {
    return createEggRecipe()
  } else if (promptLower.includes("chicken")) {
    return createChickenRecipe()
  } else if (promptLower.includes("pasta")) {
    return createPastaRecipe()
  } else if (promptLower.includes("vegetarian")) {
    return createVegetarianRecipe()
  } else if (promptLower.includes("beef")) {
    return createBeefRecipe()
  } else if (promptLower.includes("fish") || promptLower.includes("salmon")) {
    return createFishRecipe()
  } else {
    return createGenericRecipe(prompt)
  }
}

function createEggRecipe() {
  return {
    title: "Classic Scrambled Eggs",
    description: "Perfectly creamy scrambled eggs made with butter and fresh herbs",
    cuisine: "American",
    difficulty: "Easy",
    prepTime: "5 minutes",
    cookTime: "5 minutes",
    totalTime: "10 minutes",
    servings: "2",
    costEstimate: "Budget",
    ingredients: [
      { name: "Large eggs", amount: "4", allergens: ["eggs"], substitutes: "Egg substitute for allergies" },
      { name: "Butter", amount: "2 tablespoons", allergens: ["dairy"], substitutes: "Olive oil or vegan butter" },
      { name: "Salt", amount: "1/4 teaspoon", allergens: [], substitutes: "" },
      { name: "Black pepper", amount: "1/8 teaspoon", allergens: [], substitutes: "" },
      { name: "Fresh chives", amount: "1 tablespoon chopped", allergens: [], substitutes: "Green onions" },
    ],
    equipment: ["Non-stick pan", "Whisk", "Spatula"],
    instructions: [
      {
        step: 1,
        description: "Crack eggs into a bowl and whisk with salt and pepper until well combined.",
        timingTip: "1 minute",
        safetyTip: "Use fresh eggs and check for cracks",
      },
      {
        step: 2,
        description: "Heat butter in a non-stick pan over medium-low heat until melted and foaming.",
        timingTip: "1 minute",
        safetyTip: "Keep heat at medium-low to prevent burning",
      },
      {
        step: 3,
        description: "Pour in eggs and let sit for 20 seconds, then gently stir with spatula.",
        timingTip: "20 seconds",
        safetyTip: "Don't rush the cooking process",
      },
      {
        step: 4,
        description: "Continue stirring gently every 20 seconds until eggs are just set but still creamy.",
        timingTip: "3-4 minutes",
        safetyTip: "Remove from heat while slightly underdone",
      },
      {
        step: 5,
        description: "Remove from heat, sprinkle with chives, and serve immediately.",
        timingTip: "Immediate",
        safetyTip: "Serve hot for best taste and safety",
      },
    ],
    nutritionalInfo: {
      calories: "280 per serving",
      protein: "24g",
      carbs: "2g",
      fat: "20g",
      fiber: "0g",
      sugar: "1g",
      sodium: "380mg",
    },
    allergenWarnings: ["eggs", "dairy"],
    dietaryClassifications: ["Vegetarian", "Gluten-Free"],
    tips: [
      "Use room temperature eggs for even cooking",
      "Keep heat low for creamiest texture",
      "Add cream cheese for extra richness",
    ],
    storage: "Best served immediately, store leftovers in refrigerator for 1 day",
    reheating: "Reheat gently in microwave for 15-20 seconds",
    pairingRecommendations: "Toast, bacon, fresh fruit, or coffee",
    foodSafetyTips: [
      "Always wash hands before handling eggs",
      "Cook eggs to 160°F (71°C) internal temperature",
      "Store eggs in refrigerator below 40°F (4°C)",
      "Use eggs within 3-5 weeks of purchase date",
    ],
  }
}

function createChickenRecipe() {
  return {
    title: "Herb-Roasted Chicken Breast",
    description: "Juicy chicken breast seasoned with herbs and roasted to perfection",
    cuisine: "American",
    difficulty: "Medium",
    prepTime: "10 minutes",
    cookTime: "25 minutes",
    totalTime: "35 minutes",
    servings: "4",
    costEstimate: "Moderate",
    ingredients: [
      { name: "Chicken breasts", amount: "4 (6 oz each)", allergens: [], substitutes: "Chicken thighs" },
      { name: "Olive oil", amount: "2 tablespoons", allergens: [], substitutes: "Vegetable oil" },
      { name: "Garlic powder", amount: "1 teaspoon", allergens: [], substitutes: "Fresh garlic" },
      { name: "Dried thyme", amount: "1 teaspoon", allergens: [], substitutes: "Fresh thyme" },
      { name: "Salt", amount: "1 teaspoon", allergens: [], substitutes: "" },
      { name: "Black pepper", amount: "1/2 teaspoon", allergens: [], substitutes: "" },
    ],
    equipment: ["Baking dish", "Meat thermometer", "Oven"],
    instructions: [
      {
        step: 1,
        description: "Preheat oven to 425°F (220°C).",
        timingTip: "10 minutes",
        safetyTip: "Ensure oven is fully preheated",
      },
      {
        step: 2,
        description: "Pat chicken breasts dry and rub with olive oil.",
        timingTip: "2 minutes",
        safetyTip: "Wash hands after handling raw chicken",
      },
      {
        step: 3,
        description: "Season both sides with garlic powder, thyme, salt, and pepper.",
        timingTip: "2 minutes",
        safetyTip: "Use separate cutting board for raw chicken",
      },
      {
        step: 4,
        description: "Place in baking dish and roast for 20-25 minutes until internal temperature reaches 165°F.",
        timingTip: "20-25 minutes",
        safetyTip: "Use meat thermometer to check temperature",
      },
      {
        step: 5,
        description: "Let rest for 5 minutes before slicing and serving.",
        timingTip: "5 minutes",
        safetyTip: "Resting helps retain juices",
      },
    ],
    nutritionalInfo: {
      calories: "320 per serving",
      protein: "54g",
      carbs: "1g",
      fat: "10g",
      fiber: "0g",
      sugar: "0g",
      sodium: "620mg",
    },
    allergenWarnings: [],
    dietaryClassifications: ["Gluten-Free", "Dairy-Free"],
    tips: [
      "Pound chicken to even thickness for uniform cooking",
      "Let chicken come to room temperature before cooking",
      "Don't overcook to keep meat juicy",
    ],
    storage: "Store in refrigerator for up to 3 days",
    reheating: "Reheat in oven at 350°F until heated through",
    pairingRecommendations: "Roasted vegetables, rice, or mashed potatoes",
    foodSafetyTips: [
      "Always wash hands after handling raw chicken",
      "Cook chicken to internal temperature of 165°F (74°C)",
      "Use separate cutting boards for raw chicken and other foods",
      "Store raw chicken in refrigerator below 40°F (4°C)",
    ],
  }
}

function createPastaRecipe() {
  return {
    title: "Classic Spaghetti Aglio e Olio",
    description: "Traditional Italian pasta with garlic, olive oil, and red pepper flakes",
    cuisine: "Italian",
    difficulty: "Easy",
    prepTime: "5 minutes",
    cookTime: "15 minutes",
    totalTime: "20 minutes",
    servings: "4",
    costEstimate: "Budget",
    ingredients: [
      { name: "Spaghetti", amount: "1 pound", allergens: ["gluten"], substitutes: "Gluten-free pasta" },
      { name: "Extra virgin olive oil", amount: "1/3 cup", allergens: [], substitutes: "" },
      { name: "Garlic cloves", amount: "6, thinly sliced", allergens: [], substitutes: "Garlic powder" },
      { name: "Red pepper flakes", amount: "1/2 teaspoon", allergens: [], substitutes: "Black pepper" },
      { name: "Fresh parsley", amount: "1/4 cup chopped", allergens: [], substitutes: "Dried parsley" },
      { name: "Parmesan cheese", amount: "1/2 cup grated", allergens: ["dairy"], substitutes: "Nutritional yeast" },
      { name: "Salt", amount: "to taste", allergens: [], substitutes: "" },
    ],
    equipment: ["Large pot", "Large skillet", "Colander"],
    instructions: [
      {
        step: 1,
        description: "Bring large pot of salted water to boil and cook spaghetti according to package directions.",
        timingTip: "8-10 minutes",
        safetyTip: "Be careful with boiling water",
      },
      {
        step: 2,
        description: "While pasta cooks, heat olive oil in large skillet over medium heat.",
        timingTip: "2 minutes",
        safetyTip: "Don't let oil smoke",
      },
      {
        step: 3,
        description: "Add sliced garlic and red pepper flakes, cook until garlic is golden.",
        timingTip: "2-3 minutes",
        safetyTip: "Watch carefully to prevent burning",
      },
      {
        step: 4,
        description: "Reserve 1 cup pasta water, then drain pasta.",
        timingTip: "1 minute",
        safetyTip: "Use oven mitts when handling hot pot",
      },
      {
        step: 5,
        description:
          "Add pasta to skillet with garlic oil, toss with parsley and cheese, adding pasta water as needed.",
        timingTip: "2 minutes",
        safetyTip: "Toss gently to avoid breaking pasta",
      },
    ],
    nutritionalInfo: {
      calories: "520 per serving",
      protein: "16g",
      carbs: "68g",
      fat: "22g",
      fiber: "3g",
      sugar: "3g",
      sodium: "380mg",
    },
    allergenWarnings: ["gluten", "dairy"],
    dietaryClassifications: ["Vegetarian"],
    tips: [
      "Save pasta water before draining - it helps bind the sauce",
      "Don't let garlic burn or it will taste bitter",
      "Serve immediately for best texture",
    ],
    storage: "Store leftovers in refrigerator for up to 2 days",
    reheating: "Reheat gently with a splash of water or broth",
    pairingRecommendations: "Simple green salad and Italian wine",
    foodSafetyTips: [
      "Always wash hands before handling food",
      "Cook pasta in rapidly boiling water",
      "Store leftovers in refrigerator within 2 hours",
      "Reheat leftovers to 165°F (74°C) before serving",
    ],
  }
}

function createVegetarianRecipe() {
  return {
    title: "Mediterranean Quinoa Bowl",
    description: "Healthy vegetarian bowl with quinoa, fresh vegetables, and tahini dressing",
    cuisine: "Mediterranean",
    difficulty: "Easy",
    prepTime: "15 minutes",
    cookTime: "15 minutes",
    totalTime: "30 minutes",
    servings: "4",
    costEstimate: "Moderate",
    ingredients: [
      { name: "Quinoa", amount: "1 cup", allergens: [], substitutes: "Brown rice" },
      { name: "Cucumber", amount: "1 large, diced", allergens: [], substitutes: "" },
      { name: "Cherry tomatoes", amount: "1 cup, halved", allergens: [], substitutes: "Regular tomatoes" },
      { name: "Red onion", amount: "1/4 cup, diced", allergens: [], substitutes: "Green onions" },
      { name: "Chickpeas", amount: "1 can, drained", allergens: [], substitutes: "White beans" },
      { name: "Feta cheese", amount: "1/2 cup crumbled", allergens: ["dairy"], substitutes: "Vegan feta" },
      { name: "Tahini", amount: "3 tablespoons", allergens: ["sesame"], substitutes: "Sunflower seed butter" },
      { name: "Lemon juice", amount: "2 tablespoons", allergens: [], substitutes: "Lime juice" },
      { name: "Olive oil", amount: "2 tablespoons", allergens: [], substitutes: "" },
    ],
    equipment: ["Medium saucepan", "Large bowl", "Whisk"],
    instructions: [
      {
        step: 1,
        description: "Rinse quinoa and cook according to package directions.",
        timingTip: "15 minutes",
        safetyTip: "Rinse quinoa to remove bitter coating",
      },
      {
        step: 2,
        description: "While quinoa cooks, prepare vegetables and drain chickpeas.",
        timingTip: "10 minutes",
        safetyTip: "Wash all vegetables thoroughly",
      },
      {
        step: 3,
        description: "Whisk together tahini, lemon juice, and olive oil for dressing.",
        timingTip: "2 minutes",
        safetyTip: "Add water if dressing is too thick",
      },
      {
        step: 4,
        description: "Fluff cooked quinoa and let cool slightly.",
        timingTip: "5 minutes",
        safetyTip: "Let quinoa cool to prevent wilting vegetables",
      },
      {
        step: 5,
        description: "Combine quinoa, vegetables, chickpeas, and feta. Drizzle with dressing.",
        timingTip: "3 minutes",
        safetyTip: "Toss gently to avoid mashing ingredients",
      },
    ],
    nutritionalInfo: {
      calories: "420 per serving",
      protein: "18g",
      carbs: "52g",
      fat: "16g",
      fiber: "8g",
      sugar: "8g",
      sodium: "480mg",
    },
    allergenWarnings: ["dairy", "sesame"],
    dietaryClassifications: ["Vegetarian", "Gluten-Free"],
    tips: [
      "Make extra quinoa for meal prep",
      "Add fresh herbs like mint or parsley for extra flavor",
      "Serve chilled or at room temperature",
    ],
    storage: "Store in refrigerator for up to 3 days",
    reheating: "Best served cold or at room temperature",
    pairingRecommendations: "Pita bread, hummus, or Greek yogurt",
    foodSafetyTips: [
      "Always wash hands before handling food",
      "Rinse canned chickpeas before using",
      "Store prepared salad in refrigerator",
      "Keep cold foods cold (below 40°F/4°C)",
    ],
  }
}

function createBeefRecipe() {
  return {
    title: "Classic Beef Stir-Fry",
    description: "Tender beef strips with fresh vegetables in a savory sauce",
    cuisine: "Asian",
    difficulty: "Medium",
    prepTime: "15 minutes",
    cookTime: "10 minutes",
    totalTime: "25 minutes",
    servings: "4",
    costEstimate: "Moderate",
    ingredients: [
      { name: "Beef sirloin", amount: "1 pound, sliced thin", allergens: [], substitutes: "Chicken or tofu" },
      {
        name: "Soy sauce",
        amount: "3 tablespoons",
        allergens: ["soy", "gluten"],
        substitutes: "Tamari or coconut aminos",
      },
      { name: "Bell peppers", amount: "2, sliced", allergens: [], substitutes: "Snap peas" },
      { name: "Broccoli", amount: "2 cups florets", allergens: [], substitutes: "Green beans" },
      { name: "Garlic", amount: "3 cloves, minced", allergens: [], substitutes: "Garlic powder" },
      { name: "Ginger", amount: "1 tablespoon, minced", allergens: [], substitutes: "Ground ginger" },
      { name: "Vegetable oil", amount: "2 tablespoons", allergens: [], substitutes: "Peanut oil" },
      { name: "Cornstarch", amount: "1 tablespoon", allergens: [], substitutes: "Arrowroot powder" },
    ],
    equipment: ["Wok or large skillet", "Cutting board", "Sharp knife"],
    instructions: [
      {
        step: 1,
        description: "Slice beef against the grain into thin strips and toss with cornstarch.",
        timingTip: "5 minutes",
        safetyTip: "Use sharp knife carefully",
      },
      {
        step: 2,
        description: "Heat oil in wok over high heat until smoking.",
        timingTip: "2 minutes",
        safetyTip: "Ensure good ventilation",
      },
      {
        step: 3,
        description: "Add beef and stir-fry until browned, about 2-3 minutes.",
        timingTip: "2-3 minutes",
        safetyTip: "Don't overcrowd the pan",
      },
      {
        step: 4,
        description: "Add vegetables, garlic, and ginger. Stir-fry for 3-4 minutes.",
        timingTip: "3-4 minutes",
        safetyTip: "Keep ingredients moving to prevent burning",
      },
      {
        step: 5,
        description: "Add soy sauce and stir-fry for 1 more minute. Serve immediately.",
        timingTip: "1 minute",
        safetyTip: "Serve hot for best flavor",
      },
    ],
    nutritionalInfo: {
      calories: "280 per serving",
      protein: "26g",
      carbs: "12g",
      fat: "14g",
      fiber: "3g",
      sugar: "6g",
      sodium: "780mg",
    },
    allergenWarnings: ["soy", "gluten"],
    dietaryClassifications: ["Dairy-Free"],
    tips: [
      "Freeze beef for 30 minutes before slicing for easier cutting",
      "Have all ingredients prepped before starting to cook",
      "Serve over rice or noodles",
    ],
    storage: "Store leftovers in refrigerator for up to 3 days",
    reheating: "Reheat in skillet over medium heat until heated through",
    pairingRecommendations: "Steamed rice, fried rice, or lo mein noodles",
    foodSafetyTips: [
      "Always wash hands after handling raw beef",
      "Cook beef to internal temperature of 145°F (63°C) for medium-rare",
      "Use separate cutting boards for raw meat and vegetables",
      "Store raw beef in refrigerator below 40°F (4°C)",
    ],
  }
}

function createFishRecipe() {
  return {
    title: "Pan-Seared Salmon with Lemon",
    description: "Perfectly cooked salmon fillet with a crispy skin and bright lemon flavor",
    cuisine: "American",
    difficulty: "Medium",
    prepTime: "5 minutes",
    cookTime: "12 minutes",
    totalTime: "17 minutes",
    servings: "4",
    costEstimate: "Expensive",
    ingredients: [
      { name: "Salmon fillets", amount: "4 (6 oz each)", allergens: ["fish"], substitutes: "Cod or halibut" },
      { name: "Olive oil", amount: "2 tablespoons", allergens: [], substitutes: "Vegetable oil" },
      { name: "Lemon", amount: "1, juiced and zested", allergens: [], substitutes: "Lime" },
      { name: "Salt", amount: "1 teaspoon", allergens: [], substitutes: "" },
      { name: "Black pepper", amount: "1/2 teaspoon", allergens: [], substitutes: "" },
      { name: "Fresh dill", amount: "2 tablespoons", allergens: [], substitutes: "Dried dill" },
      { name: "Butter", amount: "2 tablespoons", allergens: ["dairy"], substitutes: "Vegan butter" },
    ],
    equipment: ["Large skillet", "Fish spatula", "Meat thermometer"],
    instructions: [
      {
        step: 1,
        description: "Pat salmon fillets dry and season with salt and pepper.",
        timingTip: "2 minutes",
        safetyTip: "Remove any pin bones",
      },
      {
        step: 2,
        description: "Heat olive oil in large skillet over medium-high heat.",
        timingTip: "2 minutes",
        safetyTip: "Oil should shimmer but not smoke",
      },
      {
        step: 3,
        description: "Place salmon skin-side up and cook for 4-5 minutes without moving.",
        timingTip: "4-5 minutes",
        safetyTip: "Don't flip too early",
      },
      {
        step: 4,
        description: "Flip salmon and cook for 3-4 minutes more until internal temperature reaches 145°F.",
        timingTip: "3-4 minutes",
        safetyTip: "Use thermometer to check doneness",
      },
      {
        step: 5,
        description: "Add butter, lemon juice, zest, and dill to pan. Baste salmon and serve.",
        timingTip: "2 minutes",
        safetyTip: "Serve immediately while hot",
      },
    ],
    nutritionalInfo: {
      calories: "380 per serving",
      protein: "35g",
      carbs: "2g",
      fat: "25g",
      fiber: "0g",
      sugar: "1g",
      sodium: "620mg",
    },
    allergenWarnings: ["fish", "dairy"],
    dietaryClassifications: ["Gluten-Free"],
    tips: [
      "Start with skin-side up for crispy skin",
      "Don't move the fish until it's ready to flip",
      "Let fish come to room temperature before cooking",
    ],
    storage: "Store leftovers in refrigerator for up to 2 days",
    reheating: "Reheat gently in oven at 275°F to avoid overcooking",
    pairingRecommendations: "Roasted asparagus, rice pilaf, or quinoa",
    foodSafetyTips: [
      "Always wash hands after handling raw fish",
      "Cook fish to internal temperature of 145°F (63°C)",
      "Store raw fish in refrigerator below 40°F (4°C)",
      "Use fish within 1-2 days of purchase",
    ],
  }
}

function createGenericRecipe(prompt: string) {
  return {
    title: "Custom Recipe Based on Your Request",
    description: `A delicious recipe created based on your specific request: ${prompt}`,
    cuisine: "International",
    difficulty: "Medium",
    prepTime: "15 minutes",
    cookTime: "25 minutes",
    totalTime: "40 minutes",
    servings: "4",
    costEstimate: "Moderate",
    ingredients: [
      { name: "Main ingredient (as requested)", amount: "as needed", allergens: [], substitutes: "See recipe notes" },
      { name: "Supporting ingredients", amount: "as needed", allergens: [], substitutes: "Adjust to preference" },
      { name: "Seasonings", amount: "to taste", allergens: [], substitutes: "Use preferred spices" },
    ],
    equipment: ["Basic kitchen tools", "Stove or oven", "Mixing bowls"],
    instructions: [
      {
        step: 1,
        description: "Prepare all ingredients according to your specific request.",
        timingTip: "10 minutes",
        safetyTip: "Wash hands before handling food",
      },
      {
        step: 2,
        description: "Follow cooking method appropriate for your requested dish.",
        timingTip: "20 minutes",
        safetyTip: "Cook to safe internal temperatures",
      },
      {
        step: 3,
        description: "Season to taste and serve as desired.",
        timingTip: "5 minutes",
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
    allergenWarnings: ["Check specific ingredients for allergens"],
    dietaryClassifications: ["Varies based on ingredients"],
    tips: [
      "Adjust seasonings to your taste preference",
      "Use fresh ingredients when possible",
      "Follow safe cooking practices",
    ],
    storage: "Store leftovers in refrigerator for up to 3 days",
    reheating: "Reheat thoroughly to 165°F before serving",
    pairingRecommendations: "Pair with complementary sides and beverages",
    foodSafetyTips: [
      "Always wash hands before handling food",
      "Cook proteins to safe internal temperatures",
      "Store leftovers properly in refrigerator",
      "Use clean utensils and cutting boards",
    ],
  }
}

// Enhanced validation function
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

  // Enhanced food safety tips
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

  return recipe
}
