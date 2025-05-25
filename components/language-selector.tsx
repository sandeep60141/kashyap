"use client"

import { useState } from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
]

interface LanguageSelectorProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  compact?: boolean
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  compact = false,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedLang = languages.find((lang) => lang.code === selectedLanguage) || languages[0]

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode)
    setIsOpen(false)
  }

  if (compact) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10"
        >
          <Globe className="h-4 w-4" />
          <span>{selectedLang.flag}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-primary/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className="w-full px-3 py-2 text-left hover:bg-primary/10 flex items-center gap-3 text-sm"
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-foreground/60">{language.name}</div>
                </div>
                {selectedLanguage === language.code && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        )}

        {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-primary mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Recipe Language
        </label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-3 border border-primary/30 rounded-lg focus:border-primary focus:ring-primary/20 flex items-center justify-between hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{selectedLang.flag}</span>
              <div className="text-left">
                <div className="font-medium">{selectedLang.nativeName}</div>
                <div className="text-sm text-foreground/60">{selectedLang.name}</div>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`w-full px-4 py-3 text-left hover:bg-primary/10 flex items-center gap-3 transition-colors ${
                    selectedLanguage === language.code ? "bg-primary/20" : ""
                  }`}
                >
                  <span className="text-xl">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-sm text-foreground/60">{language.name}</div>
                  </div>
                  {selectedLanguage === language.code && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          )}

          {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>🌍 Global Recipe Generation:</strong> Our Food AI will generate recipes with ingredients,
          instructions, and cooking terms in your selected language for the best cooking experience.
        </p>
      </div>
    </div>
  )
}
