
import React from 'react';

// A simple pseudo-random number generator for deterministic randomness.
// This ensures the animation is random-looking but consistent on every render.
const pseudoRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const SkeletonLoader: React.FC<{ index: number }> = ({ index }) => {
  const numTiles = 8 * 10;

  return (
    <div
      className="w-full h-full"
      aria-label="Generating image..."
      role="status"
    >
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-10 gap-px p-px">
        {Array.from({ length: numTiles }).map((_, i) => {
          // Seed randomness with both the component index and the tile index
          // to ensure each loader on the screen looks unique.
          const seed = index * numTiles + i;
          
          // Each tile gets a random duration and delay for an organic, twinkling effect.
          const randomDuration = 2.5 + pseudoRandom(seed) * 3; // 2.5s to 5.5s
          const randomDelay = pseudoRandom(seed + 1) * 2.5;    // 0s to 2.5s
          
          return (
            <div
              key={i}
              className="animate-pulseMosaic"
              style={{
                animationDuration: `${randomDuration}s`,
                animationDelay: `${randomDelay}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SkeletonLoader;
