import React from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface HeaderProps {
  onOpenSettings: () => void;
  onGoHome: () => void;
  isInitial?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onGoHome, isInitial }) => {
  const headerBaseClasses = "fixed top-0 left-0 right-0 z-10 transition-all duration-300";
  const headerActiveClasses = "bg-[#121212]/80 backdrop-blur-lg";

  return (
    <header className={`${headerBaseClasses} ${isInitial ? '' : headerActiveClasses}`}>
      <div className="flex items-center justify-between h-16 px-4">
        {isInitial ? (
          <div /> // Placeholder to push the settings icon to the right
        ) : (
          <div className="flex items-center animate-fadeIn">
            <button onClick={onGoHome} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Go back to home">
              <ArrowLeftIcon />
            </button>
            <h1 className="ml-4 text-xl font-medium text-gray-200">Imagine</h1>
          </div>
        )}
        <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Open settings">
          <SettingsIcon className="text-gray-300" />
        </button>
      </div>
    </header>
  );
};

export default Header;