'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Save, X } from "lucide-react";

interface ProductActionsProps {
  isEditing: boolean;
  adminLoading: boolean;
  onStartEditing: () => void;
  onSaveChanges: () => void;
  onCancelEditing: () => void;
  onDeleteClick: () => void;
}

export function ProductActions({
  isEditing,
  adminLoading,
  onStartEditing,
  onSaveChanges,
  onCancelEditing,
  onDeleteClick
}: ProductActionsProps) {
  return (
    <div className="flex gap-3">
      {!isEditing ? (
        <Button
          onClick={onStartEditing}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Product
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button
            onClick={onSaveChanges}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={onCancelEditing}
            className="border-rose-300 text-rose-700 hover:bg-rose-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
      
      <Button
        variant="outline"
        onClick={onDeleteClick}
        disabled={adminLoading}
        className="border-red-300 text-red-700 hover:bg-red-50 border-2"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  );
}
