
import React, { useState, useEffect } from 'react';
import { WarningIcon } from './icons/WarningIcon';

interface ErrorDisplayProps {
  message: string;
  onClose: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Prevent clicks inside the content from closing the modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      onClick={handleClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-title"
      aria-describedby="error-description"
    >
      <div
        className={`relative w-full max-w-md bg-[#1e1f20]/80 border border-white/10 rounded-2xl shadow-2xl p-8 text-center flex flex-col items-center transform transition-all duration-300 ${isClosing ? 'animate-fadeOutScaleDown' : 'animate-fadeInScaleUp'}`}
        onClick={handleContentClick}
      >
        <div className="w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-full mb-4">
          <WarningIcon className="w-6 h-6 text-red-400" />
        </div>
        <h2 id="error-title" className="text-xl font-bold text-white mb-2">
          Generation Failed
        </h2>
        <p id="error-description" className="text-gray-300 mb-6">
          {message}
        </p>
        <button
          onClick={handleClose}
          className="px-6 py-2 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
