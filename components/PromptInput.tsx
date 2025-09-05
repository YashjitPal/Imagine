
import React, { useRef, useEffect } from 'react';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { CloseIcon } from './icons/CloseIcon';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  promptImages: string[];
  onRemovePromptImage: (index: number) => void;
  onImagePasted?: (imageData: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  setPrompt, 
  onSubmit, 
  isLoading, 
  promptImages,
  onRemovePromptImage,
  onImagePasted
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!onImagePasted) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (e) => {
              if (typeof e.target?.result === 'string') {
                onImagePasted(e.target.result);
              }
            };
            reader.readAsDataURL(file);
            return; // Stop after handling the first image
          }
        }
      }
    };

    const element = inputRef.current;
    if (element) {
      element.addEventListener('paste', handlePaste);
    }

    return () => {
      if (element) {
        element.removeEventListener('paste', handlePaste);
      }
    };
  }, [onImagePasted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Gradient Overlay */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      
      {/* Form Container */}
      <div className="p-4 pointer-events-auto">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto bg-[#1e1f20]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-1 pl-3"
        >
          <div className="flex items-center">
            <button type="button" className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <PaperclipIcon />
            </button>
            <div className="flex items-center space-x-1 overflow-x-auto mx-1">
              {promptImages.map((image, index) => (
                <div key={index} className="relative p-1 flex-shrink-0">
                  <img src={image} alt={`prompt context ${index+1}`} className="w-8 h-8 rounded-lg object-cover"/>
                  <button
                    type="button"
                    onClick={() => onRemovePromptImage(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors z-10"
                    aria-label="Remove image"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type or paste an image to imagine"
              className="flex-grow bg-transparent focus:outline-none px-4 text-gray-200 placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="w-10 h-10 flex items-center justify-center bg-[#2d2f31] rounded-full hover:bg-[#3f4143] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
              disabled={isLoading || !prompt}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <ArrowUpIcon />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptInput;
