
import React from 'react';
import ImageCard from './ImageCard';
import SkeletonLoader from './SkeletonLoader';

interface ImageGridProps {
  images: string[];
  onViewImage: (image: string) => void;
  onAddImageToPrompt: (image: string) => void;
  isLoading?: boolean;
  loadingCount?: number;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onViewImage, onAddImageToPrompt, isLoading, loadingCount = 6 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 pb-28">
      {isLoading && Array.from({ length: loadingCount }).map((_, index) => (
        <SkeletonLoader key={`skeleton-${index}`} index={index} />
      ))}
      {images.map((src, index) => (
        <ImageCard 
          key={index} 
          src={src} 
          index={index}
          onView={onViewImage} 
          onAddToPrompt={onAddImageToPrompt}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
