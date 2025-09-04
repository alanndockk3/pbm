'use client'

import React, { useRef } from 'react'
import { Upload, Package, X as XIcon } from "lucide-react";

interface ProductImageManagerProps {
  productImages: string[];
  selectedImageIndex: number;
  currentImage: string;
  hasImages: boolean;
  dragActive: boolean;
  isEditing: boolean;
  onImageSelect: (index: number) => void;
  onImageRemove: (index: number) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
  productName: string;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  productImages,
  selectedImageIndex,
  currentImage,
  hasImages,
  dragActive,
  isEditing,
  onImageSelect,
  onImageRemove,
  onDrag,
  onDrop,
  onFileSelect,
  productName
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative">
        {currentImage ? (
          <img
            src={currentImage}
            alt={productName}
            className="w-full h-80 object-cover rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full h-80 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {hasImages && (
        <div className="grid grid-cols-4 gap-2">
          {productImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className={`w-full h-20 object-cover rounded-lg cursor-pointer transition-all ${
                  selectedImageIndex === index
                    ? 'ring-2 ring-pink-500 ring-offset-2'
                    : 'hover:opacity-80'
                }`}
                onClick={() => onImageSelect(index)}
              />
              {isEditing && (
                <button
                  onClick={() => onImageRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drag and Drop Zone - Only show when editing */}
      {isEditing && (
        <>
          {/* Hidden file input for click-to-select */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-950'
                : 'border-gray-300 dark:border-gray-600 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950'
            }`}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={handleClick}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag and drop an image here, or <span className="text-pink-500 font-medium">click to browse</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Supports: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>
        </>
      )}
    </div>
  );
};
