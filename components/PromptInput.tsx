import React from 'react';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { CloseIcon } from './icons/CloseIcon';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  editingImage?: string | null;
  onClearEditingImage?: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading, editingImage, onClearEditingImage }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-[#1e1f20]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-1 pl-3"
      >
        <div className="flex items-center">
          <button type="button" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <PaperclipIcon />
          </button>
           {editingImage && (
            <div className="relative p-1 ml-1">
               <img src={editingImage} alt="context" className="w-8 h-8 rounded-lg object-cover"/>
               <button
                 type="button"
                 onClick={onClearEditingImage}
                 className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors z-10"
                 aria-label="Clear image selection"
               >
                 <CloseIcon />
               </button>
            </div>
          )}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type to imagine"
            className="flex-grow bg-transparent focus:outline-none px-4 text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-10 h-10 flex items-center justify-center bg-[#2d2f31] rounded-full hover:bg-[#3f4143] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
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
  );
};

export default PromptInput;