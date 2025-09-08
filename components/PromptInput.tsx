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
  isPreviewing: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  setPrompt, 
  onSubmit, 
  isLoading, 
  promptImages,
  onRemovePromptImage,
  onImagePasted,
  isPreviewing,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic textarea height adjustment
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Approx 5 lines of text
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [prompt]);

  // Automatically focus the textarea when entering preview mode
  useEffect(() => {
    if (isPreviewing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isPreviewing]);

  // Image paste handler
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
            return;
          }
        }
      }
    };

    const element = textareaRef.current;
    if (element) {
      element.addEventListener('paste', handlePaste);
    }
    return () => {
      if (element) {
        element.removeEventListener('paste', handlePaste);
      }
    };
  }, [onImagePasted]);
  
  // File selection handlers
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onImagePasted || !event.target.files) return;

    Array.from(event.target.files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            onImagePasted(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset file input to allow selecting the same file again
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && (prompt || promptImages.length > 0)) {
        onSubmit();
    }
  };

  // Handle Enter key for submission, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Animate image removal
  const handleRemoveWithAnimation = (indexToRemove: number) => {
    const container = imageContainerRef.current;
    if (container && container.children[indexToRemove]) {
      const childElement = container.children[indexToRemove];
      childElement.classList.remove('animate-slideIn');
      childElement.classList.add('animate-slideOut');
      setTimeout(() => {
        onRemovePromptImage(indexToRemove);
      }, 300); // Must match animation duration
    } else {
      onRemovePromptImage(indexToRemove); // Fallback
    }
  };
  
  const formClasses = `max-w-3xl mx-auto bg-[#1e1f20]/50 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 rounded-3xl`;

  const imageThumbnails = (
    <div
      ref={imageContainerRef}
      className={
        isPreviewing
          ? "flex items-center space-x-1 overflow-x-auto mx-1 mb-1.5" // Inline style for preview
          : "flex items-center space-x-2 overflow-x-auto p-3"       // Top bar style for default
      }
    >
      {promptImages.map((image, index) => (
        <div key={image} className="relative flex-shrink-0 animate-slideIn">
          <img
            src={image}
            alt={`prompt context ${index + 1}`}
            className={
              isPreviewing
                ? "w-8 h-8 rounded-lg object-cover"  // Smaller thumb for preview
                : "w-14 h-14 rounded-xl object-cover" // Larger thumb for default with updated radius
            }
          />
          <button
            type="button"
            onClick={() => handleRemoveWithAnimation(index)}
            className={
              isPreviewing
                ? "absolute -top-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors z-10"
                : "absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 border-2 border-[#1e1f20] rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors z-10"
            }
            aria-label="Remove image"
          >
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#121212] to-transparent" />
      <div className="p-4 pointer-events-auto">
        <form onSubmit={handleSubmit} className={formClasses}>
          {/* DEFAULT LAYOUT: Render images on top */}
          {!isPreviewing && promptImages.length > 0 && (
            <>
              {imageThumbnails}
              <div className="h-px bg-white/10 mx-4" />
            </>
          )}

          {/* Bottom row with text input and buttons */}
          <div className="flex w-full items-end p-1 pl-3">
            <button 
              type="button" 
              onClick={handleAttachClick} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 mb-1"
              aria-label="Attach image"
            >
              <PaperclipIcon />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              multiple
            />

            {/* PREVIEW LAYOUT: Render images inline */}
            {isPreviewing && imageThumbnails}
            
            <textarea
              ref={textareaRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or paste an image to imagine"
              className="flex-grow bg-transparent focus:outline-none px-4 text-gray-200 placeholder-gray-500 resize-none overflow-hidden py-2.5"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="w-10 h-10 flex items-center justify-center bg-[#2d2f31] rounded-full hover:bg-[#3f4143] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0 mb-1"
              disabled={isLoading || (!prompt && promptImages.length === 0)}
              aria-label="Submit prompt"
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