import React from 'react';

interface SkeletonLoaderProps {
  index: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ index }) => {
  return (
    <div
      className="relative w-full aspect-[3/4] bg-[#2d2f31] rounded-2xl overflow-hidden animate-fadeInScaleUp"
      style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
           style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear',
           }}
      ></div>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SkeletonLoader;