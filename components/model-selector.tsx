"use client"
import { Sparkles, Zap } from "lucide-react"

interface ModelSelectorProps {
  selectedModel: string
  onSelectModel: (model: string) => void
}

export default function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const models = [
    {
      id: "gpt-3.5-turbo",
      name: "Standard",
      description: "Fast and efficient recipe generation",
      icon: <Zap className="h-5 w-5 text-primary" />,
    },
    {
      id: "gpt-4",
      name: "Premium",
      description: "Enhanced creativity and detail",
      icon: <Sparkles className="h-5 w-5 text-primary" />,
    },
  ]

  return (
    <div>
      <label className="generator-section-title">AI Model</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            className={`generator-option ${selectedModel === model.id ? "generator-option-active" : ""}`}
            onClick={() => onSelectModel(model.id)}
          >
            <input
              type="radio"
              name="model"
              id={model.id}
              checked={selectedModel === model.id}
              onChange={() => onSelectModel(model.id)}
              className="generator-radio"
            />
            <div className="ml-2">
              <div className="flex items-center">
                {model.icon}
                <span className="ml-1 font-medium">{model.name}</span>
              </div>
              <p className="text-xs text-foreground/70 mt-1">{model.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
