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

  // Optimized system prompt - more concise to save tokens
  let systemPrompt = `You are ChefGPT. Create accurate, safe recipes that match user requests exactly.

RULES:
1. Match user's request precisely (egg→egg recipe, chicken→chicken recipe)
2. Include safe cooking temps, allergen warnings, realistic nutrition
3. Return ONLY JSON, no markdown/code blocks

`

  // Check for meal plan requests more comprehensively
  if (
    prompt.includes("meal plan") ||
    prompt.includes("day meal") ||
    prompt.includes("days") ||
    prompt.includes("breakfast, lunch") ||
    prompt.includes("daily calories")
  ) {
    console.log("Detected meal plan request")
    systemPrompt += `JSON format:
{
  "title": "Meal Plan Title",
  "description": "Brief description",
  "calorieTarget": "Daily calories",
  "days": [
    {
      "dayNumber": 1,
      "meals": [
        {
          "name": "Breakfast/Lunch/Dinner",
          "description": "Meal description",
          "prepTime": "X minutes",
          "cookTime": "X minutes",
          "ingredients": [{"name": "ingredient", "amount": "amount", "allergens": []}],
          "instructions": ["Step 1", "Step 2"],
          "nutritionalInfo": {"calories": "X", "protein": "Xg", "carbs": "Xg", "fat": "Xg"}
        }
      ],
      "dailyNutritionTotals": {"calories": "X", "protein": "Xg", "carbs": "Xg", "fat": "Xg"}
    }
  ],
  "tips": ["tip1", "tip2"]
}`
  } else if (prompt.includes("pairing") || prompt.includes("drink")) {
    console.log("Detected pairing request")
    systemPrompt += `JSON format:
{
  "title": "Pairing Title",
  "description": "Brief description",
  "pairing": "Recommended drink",
  "pairingNotes": "Why it works",
  "ingredients": [{"name": "ingredient", "amount": "amount"}],
  "instructions": ["Step 1", "Step 2"],
  "servingTemperature": "temp",
  "glassware": "glass type"
}`
  } else if (prompt.includes("cocktail")) {
    console.log("Detected cocktail request")
    systemPrompt += `JSON format:
{
  "title": "Cocktail Name",
  "description": "Brief description",
  "alcoholContent": "X% ABV",
  "ingredients": [{"name": "ingredient", "amount": "amount"}],
  "instructions": ["Step 1", "Step 2"],
  "glassware": "glass type",
  "garnish": "garnish"
}`
  } else {
    console.log("Detected standard recipe request")
    systemPrompt += `JSON format:
{
  "title": "Recipe Title",
  "description": "Brief description",
  "cuisine": "cuisine type",
  "difficulty": "Easy/Medium/Hard",
  "prepTime": "X minutes",
  "cookTime": "X minutes",
  "servings": "X",
  "ingredients": [{"name": "ingredient", "amount": "amount", "allergens": []}],
  "instructions": [{"step": 1, "description": "instruction"}],
  "nutritionalInfo": {"calories": "X", "protein": "Xg", "carbs": "Xg", "fat": "Xg"},
  "allergenWarnings": [],
  "dietaryClassifications": [],
  "tips": []
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

    // Optimize model selection and token limits based on request type
    let selectedModel = modelInfo.value
    let maxTokens = 2000

    // Use more efficient settings for different request types
    if (prompt.includes("meal plan")) {
      maxTokens = 3000 // Meal plans need more tokens
    } else if (prompt.includes("cocktail") || prompt.includes("pairing")) {
      maxTokens = 1000 // Simpler requests need fewer tokens
      // Use GPT-3.5-turbo for simpler requests to save tokens
      if (modelInfo.provider === "openai") {
        selectedModel = "gpt-3.5-turbo"
      }
    } else {
      maxTokens = 1500 // Standard recipes
    }

    console.log(`Using model: ${selectedModel}, max tokens: ${maxTokens}`)

    // Call the API with optimized settings
    const response = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt, // Simplified user prompt
        },
      ],
      temperature: 0.3, // Lower temperature for more focused results
      max_tokens: maxTokens,
    })

    // Log token usage for monitoring
    const usage = response.usage
    if (usage) {
      console.log(
        `Token usage - Prompt: ${usage.prompt_tokens}, Completion: ${usage.completion_tokens}, Total: ${usage.total_tokens}`,
      )
    }

    // Extract the response text
    const text = response.choices[0].message.content || ""
    console.log("Received response from AI:", text.substring(0, 100) + "...")

    // Extract JSON from the response
    const cleanedJson = extractJsonFromString(text)

    // Validate that it's proper JSON by parsing and stringifying it
    try {
      const parsedJson = JSON.parse(cleanedJson)

      // Lightweight validation to save processing
      const validatedRecipe = validateRecipeDataLightweight(parsedJson)

      return JSON.stringify(validatedRecipe)
    } catch (error) {
      console.error("Error parsing JSON:", error)

      // Try to fix common JSON issues
      const fixedJson = cleanedJson.replace(/(\w+):/g, '"$1":').replace(/'/g, '"')

      try {
        const parsedJson = JSON.parse(fixedJson)
        const validatedRecipe = validateRecipeDataLightweight(parsedJson)
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
      throw new Error("Request too complex. Please simplify your requirements.")
    }

    // Return a lightweight fallback recipe
    return JSON.stringify(createLightweightFallbackRecipe(prompt))
  }
}

// Lightweight validation function to save processing time
function validateRecipeDataLightweight(recipe: any) {
  // Only essential validations to save processing
  if (!recipe.title) recipe.title = "Untitled Recipe"
  if (!recipe.description) recipe.description = "A delicious recipe."

  // Ensure basic structure exists
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    recipe.ingredients = []
  }

  if (!recipe.instructions || !Array.isArray(recipe.instructions)) {
    recipe.instructions = []
  }

  // Add minimal food safety tips
  if (!recipe.foodSafetyTips) {
    recipe.foodSafetyTips = ["Wash hands before cooking", "Cook to safe temperatures", "Store leftovers properly"]
  }

  return recipe
}

// Lightweight fallback recipe
function createLightweightFallbackRecipe(prompt: string) {
  const promptLower = prompt.toLowerCase()

  if (promptLower.includes("egg")) {
    return {
      title: "Simple Scrambled Eggs",
      description: "Quick and easy scrambled eggs",
      prepTime: "5 minutes",
      cookTime: "5 minutes",
      servings: "2",
      ingredients: [
        { name: "Eggs", amount: "4", allergens: ["eggs"] },
        { name: "Butter", amount: "2 tbsp", allergens: ["dairy"] },
      ],
      instructions: [
        { step: 1, description: "Beat eggs in bowl" },
        { step: 2, description: "Heat butter in pan" },
        { step: 3, description: "Cook eggs, stirring gently" },
      ],
      nutritionalInfo: { calories: "280", protein: "24g", fat: "20g" },
      allergenWarnings: ["eggs", "dairy"],
      foodSafetyTips: ["Cook to 160°F", "Serve immediately"],
    }
  }

  return {
    title: "Simple Recipe",
    description: "A basic recipe based on your request",
    prepTime: "15 minutes",
    cookTime: "20 minutes",
    servings: "4",
    ingredients: [{ name: "Main ingredient", amount: "as needed" }],
    instructions: [{ step: 1, description: "Follow basic cooking method" }],
    nutritionalInfo: { calories: "300", protein: "15g" },
    foodSafetyTips: ["Cook thoroughly", "Store safely"],
  }
}
