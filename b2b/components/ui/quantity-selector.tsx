// Quantity Selector component with increment/decrement buttons
"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 9999,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
