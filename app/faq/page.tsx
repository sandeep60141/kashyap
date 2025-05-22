import {
  Cpu,
  Leaf,
  ChefHat,
  ShoppingBag,
  Calendar,
  Globe,
  Smartphone,
  CreditCard,
  RefreshCw,
  Bookmark,
} from "lucide-react"
import { FAQAccordion } from "@/components/faq-accordion"

export default function FAQPage() {
  // Extended FAQs
  const faqs = [
    {
      question: "How accurate are the recipes?",
      answer:
        "Our AI has been trained on thousands of professional recipes and cooking techniques. Each recipe is designed to be accurate, balanced, and delicious. We regularly update our models based on user feedback to ensure the highest quality recipes.",
      icon: <Cpu />,
    },
    {
      question: "Can I specify dietary restrictions?",
      answer:
        "CulinaAI can accommodate a wide range of dietary needs including vegetarian, vegan, gluten-free, dairy-free, keto, paleo, low-carb, and many more. You can specify multiple restrictions for any recipe.",
      icon: <Leaf />,
    },
    {
      question: "How does the ingredient substitution work?",
      answer:
        "When you're missing an ingredient, CulinaAI will suggest suitable substitutions based on flavor profile, texture, and function in the recipe. Each substitution comes with notes on how it might affect the final dish.",
      icon: <RefreshCw />,
    },
    {
      question: "Can I save and organize my favorite recipes?",
      answer:
        "Yes! With a free account, you can save recipes to your cookbook and organize them into custom collections. Premium users get additional features like notes, ratings, and the ability to share private recipe collections.",
      icon: <Bookmark />,
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "Yes, CulinaAI is available on iOS and Android. Our mobile apps offer the same powerful features as the web version, plus offline access to saved recipes and shopping lists.",
      icon: <Smartphone />,
    },
    {
      question: "How much does CulinaAI cost?",
      answer:
        "CulinaAI offers a free plan with limited recipe generations. Our Premium plan starts at $9.99/month and includes unlimited recipe generations, meal planning, nutritional analysis, and more. We also offer a Family plan for $14.99/month that allows up to 5 users.",
      icon: <CreditCard />,
    },
    {
      question: "What cooking skill levels do the recipes accommodate?",
      answer:
        "CulinaAI generates recipes for all skill levels, from beginner to expert. You can specify your cooking experience, and the AI will adjust the complexity of techniques, ingredient preparation, and instructions accordingly.",
      icon: <ChefHat />,
    },
    {
      question: "Can I generate shopping lists from recipes?",
      answer:
        "Yes! CulinaAI can automatically generate shopping lists from any recipe or meal plan. Lists are organized by store section for efficient shopping, and you can easily add or remove items as needed.",
      icon: <ShoppingBag />,
    },
    {
      question: "How far in advance can I plan meals?",
      answer:
        "Free users can create meal plans for up to 1 week, while Premium and Family plan subscribers can plan up to 4 weeks in advance. All meal plans include nutritional information and balanced meal suggestions.",
      icon: <Calendar />,
    },
    {
      question: "Does CulinaAI support international cuisines?",
      answer:
        "Our AI has been trained on recipes from around the world. You can specify cuisines from virtually any region or country, and the AI will generate authentic recipes with traditional techniques and flavor profiles.",
      icon: <Globe />,
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-xl text-gray-600">
              Find answers to the most common questions about CulinaAI and our services
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <FAQAccordion faqs={faqs} />
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <div className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
              <span className="font-medium">Contact us at</span>
              <a href="mailto:support@culinaai.com" className="ml-1 font-bold text-blue-600 hover:underline">
                support@culinaai.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
