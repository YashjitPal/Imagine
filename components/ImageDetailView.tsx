
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { HeartIcon } from './icons/HeartIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface ImageDetailViewProps {
  image: string;
  onClose: () => void;
}

const ImageDetailView: React.FC<ImageDetailViewProps> = ({ image, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  // Trigger the close animation and then call the parent's onClose
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Duration should match the animation
  };

  // Prevent clicks inside the content from closing the modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle Escape key press for closing the modal
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

  return (
    <div
      className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      onClick={handleClose}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center h-16 px-4">
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close image view">
            <ArrowLeftIcon />
          </button>
        </div>
      </header>

      {/* Centered content wrapper that stops click propagation */}
      <div
        className={`flex flex-col items-center ${isClosing ? 'animate-fadeOutScaleDown' : 'animate-fadeInScaleUp'}`}
        onClick={handleContentClick}
      >
        <div className="w-full max-w-5xl">
            <img
            src={image}
            alt="Selected generated image"
            className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-2xl mx-auto"
            />
        </div>

        {/* Action Bar */}
        <div className="flex items-center space-x-2 my-4">
            <button className="p-3 bg-[#2d2f31] rounded-full hover:bg-[#3f4143] transition-colors">
                <HeartIcon />
            </button>
            <button className="p-3 bg-[#2d2f31] rounded-full hover:bg-[#3f4143] transition-colors">
                <DownloadIcon />
            </button>
            <button className="p-3 bg-[#2d2f31] rounded-full hover:bg-[#3f4143] transition-colors">
                <ShareIcon />
            </button>
            <button className="flex items-center px-4 py-3 bg-[#2d2f31] rounded-full hover:bg-[#3f4143] transition-colors font-medium text-gray-200">
                <span>Make video</span>
                <ChevronDownIcon className="ml-2" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailView;
