// components/cart/QuantityControls.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface QuantityControlsProps {
  quantity: number;
  productId: string;
  inStock: boolean;
  disabled: boolean;
  onQuantityChange: (productId: string, newQuantity: number) => void;
}

export const QuantityControls = ({ 
  quantity, 
  productId, 
  inStock, 
  disabled, 
  onQuantityChange 
}: QuantityControlsProps) => {
  return (
    <div className="flex items-center border border-rose-300 dark:border-rose-700 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onQuantityChange(productId, quantity - 1)}
        disabled={disabled}
        className="h-8 w-8 p-0 hover:bg-rose-100 dark:hover:bg-rose-800"
      >
        <Minus className="w-3 h-3" />
      </Button>
      <span className="px-3 py-1 text-sm font-medium text-rose-900 dark:text-rose-100 min-w-[2rem] text-center">
        {quantity}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onQuantityChange(productId, quantity + 1)}
        disabled={disabled || !inStock}
        className="h-8 w-8 p-0 hover:bg-rose-100 dark:hover:bg-rose-800"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
};
