"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showValue?: boolean
  valuePrefix?: string
  valueSuffix?: string
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, showValue = false, valuePrefix = "", valueSuffix = "", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<number[]>(props.defaultValue || [0])

    React.useEffect(() => {
      if (props.value) {
        setDisplayValue(props.value)
      } else if (props.defaultValue) {
        setDisplayValue(props.defaultValue)
      }
    }, [props.value, props.defaultValue])

    const handleValueChange = (value: number[]) => {
      setDisplayValue(value)
      if (props.onValueChange) {
        props.onValueChange(value)
      }
    }

    return (
      <div className="relative">
        <SliderPrimitive.Root
          ref={ref}
          className={cn("relative flex w-full touch-none select-none items-center", className)}
          onValueChange={handleValueChange}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-indigo-100">
            <SliderPrimitive.Range className="absolute h-full bg-indigo-500" />
          </SliderPrimitive.Track>
          {displayValue.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className="block h-5 w-5 rounded-full border-2 border-indigo-500 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-indigo-50"
            />
          ))}
        </SliderPrimitive.Root>
        {showValue && (
          <div className="absolute -top-8 left-0 right-0 text-center">
            <span className="inline-block bg-indigo-500 text-white px-2 py-1 rounded text-sm">
              {valuePrefix}
              {displayValue[0]}
              {valueSuffix}
            </span>
          </div>
        )}
      </div>
    )
  },
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
