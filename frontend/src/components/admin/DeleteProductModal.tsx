'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteProductModalProps {
  isOpen: boolean;
  productName: string;
  confirmText: string;
  onConfirmTextChange: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  productName,
  confirmText,
  onConfirmTextChange,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-rose-900 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100 mb-2">
            Delete Product
          </h3>
          <p className="text-rose-600 dark:text-rose-400 mb-4">
            Are you sure you want to delete "{productName}"? This action cannot be undone.
          </p>
          <p className="text-sm text-rose-500 dark:text-rose-400 mb-4">
            Type <strong>confirm</strong> to proceed with deletion.
          </p>
          
          <input
            type="text"
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            placeholder="Type 'confirm'"
            className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
          />
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onConfirm}
              disabled={confirmText.toLowerCase() !== 'confirm'}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Product
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
