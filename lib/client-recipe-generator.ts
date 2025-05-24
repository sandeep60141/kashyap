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
    // Construct a very specific prompt that ensures relevance
    let prompt = ""

    if (options.type === "mealPlan") {
      prompt = `Create a detailed ${options.days || 3}-day meal plan with these EXACT specifications:

MEAL PLAN STRUCTURE:
- Total days: ${options.days || 3} days
- Daily calorie target: ${options.calories || 2000} calories
- Each day MUST include: Breakfast, Lunch, Dinner
- User preferences: ${options.preferences || "balanced, healthy meals"}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- MUST follow these dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

CRITICAL REQUIREMENTS:
1. This is a MEAL PLAN request (not a single recipe)
2. Must include exactly ${options.days || 3} days
3. Each day must have 3 complete meals with ingredients and instructions
4. Include daily nutrition totals that add up to target calories
5. Each meal should be detailed with prep/cook times

EXAMPLE STRUCTURE REQUIRED:
Day 1:
- Breakfast: [meal name, ingredients, instructions, nutrition]
- Lunch: [meal name, ingredients, instructions, nutrition]  
- Dinner: [meal name, ingredients, instructions, nutrition]
- Daily Total: [calories, protein, carbs, fat]

Day 2: [same structure]
Day 3: [same structure] (if 3+ days requested)

This is a ${options.days || 3}-day meal plan request.`
    } else if (options.type === "pairing") {
      prompt = `Suggest the perfect ${options.pairingType || "wine"} pairing for this SPECIFIC dish: ${options.dish || "a general meal"}.
${options.preferences ? `Additional preferences: ${options.preferences}` : ""}

CRITICAL: The pairing MUST be specifically for the dish mentioned: "${options.dish}". Do not suggest pairings for other dishes.`
    } else if (options.type === "cocktail") {
      prompt = `Create a detailed ${options.alcoholic === false ? "non-alcoholic " : ""}cocktail recipe using these SPECIFIC ingredients: ${options.ingredients || "common bar ingredients"}.
${options.preferences ? `Style preferences: ${options.preferences}` : ""}

CRITICAL: The cocktail MUST use the ingredients mentioned: "${options.ingredients}". Do not create cocktails with completely different ingredients.`
    } else if (options.macros) {
      prompt = `Create a detailed recipe for a ${options.mealType || "meal"} with these EXACT macronutrient targets:
- Protein: ${options.macros.protein}%
- Carbohydrates: ${options.macros.carbs}%
- Fat: ${options.macros.fat}%
- Total calories: ${options.macros.calories}
${options.preferences ? `User preferences: ${options.preferences}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- MUST follow these dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

CRITICAL: The recipe MUST meet the specified macro targets and dietary requirements.`
    } else if (options.recipeName) {
      prompt = `Create a detailed and complete recipe for EXACTLY this dish: "${options.recipeName}".

Recipe specifications:
${options.cuisine ? `- Cuisine style: ${options.cuisine}` : ""}
${options.difficulty ? `- Difficulty level: ${options.difficulty}` : ""}
${options.preferences ? `- Additional preferences: ${options.preferences}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- MUST follow these dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

CRITICAL REQUIREMENT: The recipe MUST be for "${options.recipeName}" specifically. Do not create a different dish.

Examples of what I mean:
- If I ask for "scrambled eggs" → Give me a scrambled eggs recipe
- If I ask for "chicken curry" → Give me a chicken curry recipe  
- If I ask for "chocolate cake" → Give me a chocolate cake recipe
- If I ask for "vegetarian pasta" → Give me a vegetarian pasta recipe (NO MEAT)

The recipe title and main ingredients MUST match what I requested: "${options.recipeName}"`
    } else if (options.ingredients) {
      prompt = `Create a detailed and complete recipe using these SPECIFIC ingredients as the main components: "${options.ingredients}".

Additional details:
${options.preferences ? `- Cooking preferences: ${options.preferences}` : ""}
${options.cuisine ? `- Cuisine style: ${options.cuisine}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- MUST follow these dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

CRITICAL REQUIREMENT: The recipe MUST prominently feature these ingredients: "${options.ingredients}". Do not create a recipe with completely different main ingredients.

Examples:
- If I mention "eggs" → Create an egg-based recipe (scrambled eggs, omelet, etc.)
- If I mention "chicken" → Create a chicken-based recipe
- If I mention "pasta" → Create a pasta-based recipe
- If I mention "vegetables" → Create a vegetable-focused recipe`
    } else {
      prompt = `Create a detailed recipe based on these preferences: ${options.preferences || "a delicious meal"}

${options.cuisine ? `- Cuisine style: ${options.cuisine}` : ""}
${
  options.dietaryRequirements && options.dietaryRequirements.length > 0
    ? `- MUST follow these dietary requirements: ${options.dietaryRequirements.join(", ")}`
    : ""
}

CRITICAL: The recipe MUST match the user's preferences and dietary requirements exactly.`
    }

    console.log("Generating recipe with specific prompt:", prompt.substring(0, 200) + "...")

    // Use the existing generateRecipeClient function with the constructed prompt
    const modelInfo = {
      provider: "openai",
      value: options.model || "gpt-4o",
    }

    const recipeJson = await generateRecipeClient(prompt, modelInfo)

    // Parse the recipe JSON and validate it
    try {
      const recipe = JSON.parse(recipeJson)

      // Validate that the recipe matches the user's request
      const isRelevant = validateRecipeRelevance(recipe, options)

      if (!isRelevant) {
        console.log("Recipe not relevant to user request, creating fallback")
        return createRelevantFallbackRecipe(options)
      }

      console.log("Generated relevant recipe:", {
        title: recipe.title,
        ingredientsCount: recipe.ingredients?.length || 0,
        instructionsCount: recipe.instructions?.length || 0,
        matchesRequest: isRelevant,
      })

      return recipe
    } catch (parseError) {
      console.error("Error parsing recipe JSON:", parseError)
      return createRelevantFallbackRecipe(options)
    }
  } catch (error) {
    console.error("Error in generateRecipe:", error)
    return createRelevantFallbackRecipe(options, error.message)
  }
}

function validateRecipeRelevance(recipe: any, options: any): boolean {
  // Check if recipe matches the user's specific request
  const recipeTitleLower = (recipe.title || "").toLowerCase()
  const recipeIngredientsText = JSON.stringify(recipe.ingredients || []).toLowerCase()

  // If user specified a recipe name, check if it matches
  if (options.recipeName) {
    const requestedName = options.recipeName.toLowerCase()
    const keyWords = requestedName.split(" ")

    // Check if at least some key words from the request appear in the recipe
    const hasMatchingWords = keyWords.some(
      (word) => recipeTitleLower.includes(word) || recipeIngredientsText.includes(word),
    )

    if (!hasMatchingWords) {
      console.log(`Recipe "${recipe.title}" doesn't match requested "${options.recipeName}"`)
      return false
    }
  }

  // If user specified ingredients, check if they're included
  if (options.ingredients) {
    const requestedIngredients = options.ingredients.toLowerCase()
    const ingredientWords = requestedIngredients.split(/[,\s]+/).filter((word) => word.length > 2)

    const hasMatchingIngredients = ingredientWords.some(
      (ingredient) => recipeIngredientsText.includes(ingredient) || recipeTitleLower.includes(ingredient),
    )

    if (!hasMatchingIngredients) {
      console.log(`Recipe doesn't include requested ingredients: ${options.ingredients}`)
      return false
    }
  }

  // Check dietary requirements
  if (options.dietaryRequirements && options.dietaryRequirements.length > 0) {
    const dietaryReqs = options.dietaryRequirements.map((req) => req.toLowerCase())

    // If vegetarian is required, check for meat
    if (dietaryReqs.includes("vegetarian") || dietaryReqs.includes("vegan")) {
      const hasMeat = /\b(chicken|beef|pork|meat|fish|salmon|tuna|turkey|lamb|bacon|ham)\b/.test(recipeIngredientsText)
      if (hasMeat) {
        console.log("Recipe contains meat but user requested vegetarian/vegan")
        return false
      }
    }

    // If gluten-free is required, check for gluten
    if (dietaryReqs.includes("gluten-free")) {
      const hasGluten = /\b(wheat|flour|bread|pasta|soy sauce)\b/.test(recipeIngredientsText)
      if (hasGluten && !recipeIngredientsText.includes("gluten-free")) {
        console.log("Recipe contains gluten but user requested gluten-free")
        return false
      }
    }
  }

  return true
}

function createRelevantFallbackRecipe(options: any, errorMessage?: string) {
  // Create a recipe that specifically matches the user's request
  if (options.recipeName) {
    const requestedName = options.recipeName.toLowerCase()

    if (requestedName.includes("egg")) {
      return createEggRecipe(options.recipeName)
    } else if (requestedName.includes("chicken")) {
      return createChickenRecipe(options.recipeName)
    } else if (requestedName.includes("pasta")) {
      return createPastaRecipe(options.recipeName)
    } else if (requestedName.includes("vegetarian") || options.dietaryRequirements?.includes("vegetarian")) {
      return createVegetarianRecipe(options.recipeName)
    } else if (requestedName.includes("beef")) {
      return createBeefRecipe(options.recipeName)
    } else if (requestedName.includes("fish") || requestedName.includes("salmon")) {
      return createFishRecipe(options.recipeName)
    }
  }

  if (options.ingredients) {
    const ingredients = options.ingredients.toLowerCase()

    if (ingredients.includes("egg")) {
      return createEggRecipe(`Recipe with ${options.ingredients}`)
    } else if (ingredients.includes("chicken")) {
      return createChickenRecipe(`Recipe with ${options.ingredients}`)
    } else if (ingredients.includes("pasta")) {
      return createPastaRecipe(`Recipe with ${options.ingredients}`)
    }
  }

  // Default fallback
  return createGenericRecipe(options, errorMessage)
}

function createEggRecipe(title?: string) {
  return {
    title: title || "Perfect Scrambled Eggs",
    description: "Creamy, fluffy scrambled eggs cooked to perfection",
    cuisine: "American",
    difficulty: "Easy",
    prepTime: "5 minutes",
    cookTime: "5 minutes",
    totalTime: "10 minutes",
    servings: "2",
    costEstimate: "Budget",
    ingredients: [
      { name: "Large eggs", amount: "4", allergens: ["eggs"], substitutes: "Egg substitute" },
      { name: "Butter", amount: "2 tablespoons", allergens: ["dairy"], substitutes: "Olive oil" },
      { name: "Salt", amount: "1/4 teaspoon", allergens: [], substitutes: "" },
      { name: "Black pepper", amount: "1/8 teaspoon", allergens: [], substitutes: "" },
      { name: "Fresh chives", amount: "1 tablespoon", allergens: [], substitutes: "Green onions" },
    ],
    equipment: ["Non-stick pan", "Whisk", "Spatula"],
    instructions: [
      {
        step: 1,
        description: "Crack eggs into bowl and whisk with salt and pepper.",
        timingTip: "1 minute",
        safetyTip: "Use fresh eggs",
      },
      {
        step: 2,
        description: "Heat butter in non-stick pan over medium-low heat.",
        timingTip: "1 minute",
        safetyTip: "Keep heat low",
      },
      {
        step: 3,
        description: "Pour in eggs and let sit for 20 seconds, then gently stir.",
        timingTip: "20 seconds",
        safetyTip: "Don't rush",
      },
      {
        step: 4,
        description: "Continue stirring gently until eggs are just set but creamy.",
        timingTip: "3-4 minutes",
        safetyTip: "Remove while slightly underdone",
      },
      {
        step: 5,
        description: "Remove from heat, add chives, and serve immediately.",
        timingTip: "Immediate",
        safetyTip: "Serve hot",
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
    tips: ["Use room temperature eggs", "Keep heat low for creamiest texture"],
    storage: "Best served immediately",
    reheating: "Reheat gently in microwave",
    pairingRecommendations: "Toast, bacon, fresh fruit",
    foodSafetyTips: [
      "Always wash hands before handling eggs",
      "Cook eggs to 160°F (71°C)",
      "Store eggs in refrigerator below 40°F (4°C)",
    ],
  }
}

function createChickenRecipe(title?: string) {
  return {
    title: title || "Herb-Roasted Chicken Breast",
    description: "Juicy chicken breast with herbs and perfect seasoning",
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
        safetyTip: "Ensure oven is preheated",
      },
      {
        step: 2,
        description: "Pat chicken dry and rub with olive oil.",
        timingTip: "2 minutes",
        safetyTip: "Wash hands after handling raw chicken",
      },
      {
        step: 3,
        description: "Season with garlic powder, thyme, salt, and pepper.",
        timingTip: "2 minutes",
        safetyTip: "Use separate cutting board",
      },
      {
        step: 4,
        description: "Roast for 20-25 minutes until internal temperature reaches 165°F.",
        timingTip: "20-25 minutes",
        safetyTip: "Use meat thermometer",
      },
      {
        step: 5,
        description: "Let rest for 5 minutes before slicing.",
        timingTip: "5 minutes",
        safetyTip: "Resting retains juices",
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
    tips: ["Pound chicken to even thickness", "Let come to room temperature before cooking"],
    storage: "Store in refrigerator for up to 3 days",
    reheating: "Reheat in oven at 350°F",
    pairingRecommendations: "Roasted vegetables, rice, mashed potatoes",
    foodSafetyTips: [
      "Always wash hands after handling raw chicken",
      "Cook to internal temperature of 165°F (74°C)",
      "Use separate cutting boards for raw chicken",
    ],
  }
}

function createPastaRecipe(title?: string) {
  return {
    title: title || "Classic Spaghetti Aglio e Olio",
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
    tips: ["Save pasta water before draining", "Don't let garlic burn", "Serve immediately"],
    storage: "Store leftovers in refrigerator for up to 2 days",
    reheating: "Reheat gently with a splash of water",
    pairingRecommendations: "Simple green salad and Italian wine",
    foodSafetyTips: [
      "Always wash hands before handling food",
      "Cook pasta in rapidly boiling water",
      "Store leftovers in refrigerator within 2 hours",
    ],
  }
}

function createVegetarianRecipe(title?: string) {
  return {
    title: title || "Mediterranean Quinoa Bowl",
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
      { name: "Chickpeas", amount: "1 can, drained", allergens: [], substitutes: "White beans" },
      { name: "Feta cheese", amount: "1/2 cup crumbled", allergens: ["dairy"], substitutes: "Vegan feta" },
      { name: "Tahini", amount: "3 tablespoons", allergens: ["sesame"], substitutes: "Sunflower seed butter" },
    ],
    equipment: ["Medium saucepan", "Large bowl", "Whisk"],
    instructions: [
      {
        step: 1,
        description: "Cook quinoa according to package directions.",
        timingTip: "15 minutes",
        safetyTip: "Rinse quinoa first",
      },
      {
        step: 2,
        description: "Prepare vegetables and drain chickpeas.",
        timingTip: "10 minutes",
        safetyTip: "Wash vegetables thoroughly",
      },
      {
        step: 3,
        description: "Make tahini dressing by whisking tahini with lemon juice.",
        timingTip: "2 minutes",
        safetyTip: "Add water if too thick",
      },
      {
        step: 4,
        description: "Combine all ingredients and toss with dressing.",
        timingTip: "3 minutes",
        safetyTip: "Toss gently",
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
    tips: ["Make extra quinoa for meal prep", "Serve chilled or at room temperature"],
    storage: "Store in refrigerator for up to 3 days",
    reheating: "Best served cold or at room temperature",
    pairingRecommendations: "Pita bread, hummus, or Greek yogurt",
    foodSafetyTips: [
      "Always wash hands before handling food",
      "Rinse canned chickpeas before using",
      "Keep cold foods cold (below 40°F/4°C)",
    ],
  }
}

function createBeefRecipe(title?: string) {
  return {
    title: title || "Classic Beef Stir-Fry",
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
      { name: "Soy sauce", amount: "3 tablespoons", allergens: ["soy", "gluten"], substitutes: "Tamari" },
      { name: "Bell peppers", amount: "2, sliced", allergens: [], substitutes: "Snap peas" },
      { name: "Broccoli", amount: "2 cups florets", allergens: [], substitutes: "Green beans" },
      { name: "Garlic", amount: "3 cloves, minced", allergens: [], substitutes: "Garlic powder" },
      { name: "Vegetable oil", amount: "2 tablespoons", allergens: [], substitutes: "Peanut oil" },
    ],
    equipment: ["Wok or large skillet", "Cutting board", "Sharp knife"],
    instructions: [
      {
        step: 1,
        description: "Slice beef against the grain into thin strips.",
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
        description: "Add beef and stir-fry until browned.",
        timingTip: "2-3 minutes",
        safetyTip: "Don't overcrowd pan",
      },
      {
        step: 4,
        description: "Add vegetables and stir-fry until tender-crisp.",
        timingTip: "3-4 minutes",
        safetyTip: "Keep ingredients moving",
      },
      { step: 5, description: "Add soy sauce and serve immediately.", timingTip: "1 minute", safetyTip: "Serve hot" },
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
    tips: ["Freeze beef for easier slicing", "Have all ingredients prepped before cooking"],
    storage: "Store leftovers in refrigerator for up to 3 days",
    reheating: "Reheat in skillet over medium heat",
    pairingRecommendations: "Steamed rice, fried rice, or noodles",
    foodSafetyTips: [
      "Always wash hands after handling raw beef",
      "Cook beef to internal temperature of 145°F (63°C)",
      "Use separate cutting boards for raw meat",
    ],
  }
}

function createFishRecipe(title?: string) {
  return {
    title: title || "Pan-Seared Salmon with Lemon",
    description: "Perfectly cooked salmon fillet with crispy skin and bright lemon flavor",
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
    ],
    equipment: ["Large skillet", "Fish spatula", "Meat thermometer"],
    instructions: [
      {
        step: 1,
        description: "Pat salmon dry and season with salt and pepper.",
        timingTip: "2 minutes",
        safetyTip: "Remove any pin bones",
      },
      {
        step: 2,
        description: "Heat oil in skillet over medium-high heat.",
        timingTip: "2 minutes",
        safetyTip: "Oil should shimmer",
      },
      {
        step: 3,
        description: "Cook salmon skin-side up for 4-5 minutes.",
        timingTip: "4-5 minutes",
        safetyTip: "Don't flip too early",
      },
      {
        step: 4,
        description: "Flip and cook until internal temperature reaches 145°F.",
        timingTip: "3-4 minutes",
        safetyTip: "Use thermometer",
      },
      {
        step: 5,
        description: "Add lemon juice, zest, and dill. Serve immediately.",
        timingTip: "1 minute",
        safetyTip: "Serve hot",
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
    allergenWarnings: ["fish"],
    dietaryClassifications: ["Gluten-Free", "Dairy-Free"],
    tips: ["Start skin-side up for crispy skin", "Don't move fish until ready to flip"],
    storage: "Store leftovers in refrigerator for up to 2 days",
    reheating: "Reheat gently in oven at 275°F",
    pairingRecommendations: "Roasted asparagus, rice pilaf, or quinoa",
    foodSafetyTips: [
      "Always wash hands after handling raw fish",
      "Cook fish to internal temperature of 145°F (63°C)",
      "Store raw fish in refrigerator below 40°F (4°C)",
    ],
  }
}

function createGenericRecipe(options: any, errorMessage?: string) {
  return {
    title: options.recipeName || "Custom Recipe",
    description: `A delicious recipe created based on your request`,
    cuisine: options.cuisine || "International",
    difficulty: options.difficulty || "Medium",
    prepTime: "15 minutes",
    cookTime: "25 minutes",
    totalTime: "40 minutes",
    servings: "4",
    costEstimate: "Moderate",
    ingredients: [
      { name: "Main ingredients", amount: "as needed", allergens: [], substitutes: "See recipe notes" },
      { name: "Seasonings", amount: "to taste", allergens: [], substitutes: "Adjust to preference" },
    ],
    equipment: ["Basic kitchen tools", "Stove or oven"],
    instructions: [
      {
        step: 1,
        description: "Prepare ingredients according to your preferences.",
        timingTip: "10 minutes",
        safetyTip: "Wash hands before handling food",
      },
      {
        step: 2,
        description: "Cook using appropriate method for your dish.",
        timingTip: "20 minutes",
        safetyTip: "Cook to safe temperatures",
      },
      {
        step: 3,
        description: "Season to taste and serve.",
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
    allergenWarnings: ["Check specific ingredients"],
    dietaryClassifications: options.dietaryRequirements || [],
    tips: ["Adjust seasonings to taste", "Use fresh ingredients when possible"],
    storage: "Store leftovers in refrigerator for up to 3 days",
    reheating: "Reheat thoroughly to 165°F before serving",
    pairingRecommendations: "Pair with complementary sides",
    foodSafetyTips: [
      "Always wash hands before handling food",
      "Cook proteins to safe internal temperatures",
      "Store leftovers properly in refrigerator",
    ],
    error: errorMessage ? `Generation error: ${errorMessage}. Please try again.` : undefined,
  }
}

export async function generateRecipeClient(prompt: string, modelInfo = { provider: "openai", value: "gpt-4o" }) {
  try {
    console.log("Calling recipe API with enhanced prompt...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000)

    const response = await fetch("/api/generate-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        modelInfo: modelInfo,
        requireCompleteRecipe: true,
        includeNutrition: true,
        includeSafetyTips: true,
        ensureRelevance: true,
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
    console.log("API Response received successfully")

    return data.recipe
  } catch (error) {
    console.error("Error in generateRecipeClient:", error)

    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try with a simpler request.")
    }

    throw error
  }
}
