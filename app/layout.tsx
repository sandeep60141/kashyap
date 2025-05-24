import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CulinaAI - AI Recipe Generator | Food AI Assistant for Smart Cooking",
  description:
    "Transform your cooking with CulinaAI's advanced Recipe Generator AI. Create personalized recipes, meal plans, and get cooking assistance with our intelligent Food AI technology. Perfect for home chefs and food enthusiasts.",
  keywords:
    "Food AI, Recipe Generator AI, AI cooking assistant, meal planning AI, smart recipe creator, cooking AI, food technology, recipe suggestions, meal prep AI, culinary AI",
  authors: [{ name: "CulinaAI Team" }],
  creator: "CulinaAI",
  publisher: "CulinaAI",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://culinaai.com",
    siteName: "CulinaAI - Food AI Recipe Generator",
    title: "CulinaAI - AI Recipe Generator | Food AI Assistant",
    description:
      "Create personalized recipes with our advanced Food AI technology. Generate meal plans, get cooking tips, and transform your kitchen experience with Recipe Generator AI.",
    images: [
      {
        url: "/food-hero.png",
        width: 1200,
        height: 630,
        alt: "CulinaAI Food AI Recipe Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CulinaAI - AI Recipe Generator | Food AI Assistant",
    description:
      "Transform your cooking with advanced Food AI technology. Create personalized recipes and meal plans instantly.",
    images: ["/food-hero.png"],
    creator: "@CulinaAI",
  },
  alternates: {
    canonical: "https://culinaai.com",
  },
  other: {
    "google-site-verification": "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Schema Markup for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "CulinaAI",
              description: "Advanced Food AI and Recipe Generator AI platform for smart cooking",
              url: "https://culinaai.com",
              logo: "https://culinaai.com/logo.png",
              sameAs: [
                "https://twitter.com/CulinaAI",
                "https://facebook.com/CulinaAI",
                "https://instagram.com/CulinaAI",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-555-CULINA",
                contactType: "customer service",
                availableLanguage: "English",
              },
            }),
          }}
        />

        {/* Schema Markup for SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "CulinaAI Recipe Generator",
              description: "AI-powered recipe generator and food assistant for creating personalized meals",
              applicationCategory: "Food & Cooking",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
            }),
          }}
        />

        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CulinaAI" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
