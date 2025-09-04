
import React from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-lg">
      <div className="flex items-center h-16 px-4">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeftIcon />
        </button>
        <h1 className="ml-4 text-xl font-medium text-gray-200">Imagine</h1>
      </div>
    </header>
  );
};

export default Header;
