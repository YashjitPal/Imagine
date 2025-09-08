
import React from 'react';
import ImageCard from './ImageCard';
import { GridItem } from '../App';

interface ImageGridProps {
  items: GridItem[];
  onViewImage: (image: string) => void;
  onAddImageToPrompt: (image: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ items, onViewImage, onAddImageToPrompt }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-28">
      {items.map((item, index) => (
        <ImageCard 
          key={item.id} 
          src={item.src} 
          index={index}
          onView={onViewImage} 
          onAddToPrompt={onAddImageToPrompt}
        />
      ))}
    </div>
  );
};

export default ImageGrid;