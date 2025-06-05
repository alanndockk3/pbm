// components/admin/ImageUpload.tsx
'use client'

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Image, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageSelect: (file: File | null) => void;
  uploading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload = ({
  currentImage,
  onImageSelect,
  uploading = false,
  disabled = false,
  className
}: ImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      onImageSelect(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    onImageSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const displayImage = previewUrl || currentImage;

  return (
    <div className={cn("space-y-3", className)}>
      <label className="block text-sm font-medium text-rose-900 dark:text-rose-100">
        Product Image
      </label>
      
      {/* Image Preview */}
      {displayImage && (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={displayImage}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          
          {!disabled && !uploading && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!displayImage && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            dragActive 
              ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20" 
              : "border-rose-300 dark:border-rose-700 hover:border-pink-400 dark:hover:border-pink-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-2" />
              <p className="text-sm text-rose-600 dark:text-rose-400">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center cursor-pointer">
              <Upload className="w-8 h-8 text-rose-400 mb-2" />
              <p className="text-sm font-medium text-rose-900 dark:text-rose-100 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-rose-500 dark:text-rose-400">
                PNG, JPG, WEBP up to 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Replace Image Button */}
      {displayImage && !uploading && !disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Replace Image
        </Button>
      )}

      {/* File Info */}
      {selectedFile && (
        <div className="text-xs text-rose-600 dark:text-rose-400">
          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}
    </div>
  );
};