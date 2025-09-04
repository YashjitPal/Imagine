import React, { useState } from 'react';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';

interface EditPromptInputProps {
  originalImage: string;
}

const EditPromptInput: React.FC<EditPromptInputProps> = ({ originalImage }) => {
  const [prompt, setPrompt] = useState('');
  // For now, this is a cosmetic component. The logic for editing isn't implemented.
  const isLoading = false; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Editing logic would go here.
    console.log("Editing with prompt:", prompt);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e1f20]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-1 pl-3"
      >
        <div className="flex items-center">
          <button type="button" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <PaperclipIcon />
          </button>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type to imagine"
            className="flex-grow bg-transparent focus:outline-none px-4 text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
          <div className="p-1">
             <img src={originalImage} alt="context" className="w-8 h-8 rounded-full object-cover"/>
          </div>
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

export default EditPromptInput;