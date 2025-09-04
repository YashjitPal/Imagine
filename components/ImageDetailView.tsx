import React from 'react';
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
  // Prevent clicks inside the content from closing the modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center h-16 px-4">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeftIcon />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div
        className="w-full h-full flex flex-col items-center justify-end animate-fadeInScaleUp pb-24" // padding for global prompt
        onClick={handleContentClick}
      >
        <div className="flex-grow flex items-center justify-center w-full max-h-[calc(100vh-200px)]">
            <img
            src={image}
            alt="Selected generated image"
            className="max-w-full max-h-full object-contain rounded-lg"
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