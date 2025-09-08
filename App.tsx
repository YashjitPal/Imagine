
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateImages, generateWithImages } from './services/geminiService';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ImageGrid from './components/ImageGrid';
import ImageDetailView from './components/ImageDetailView';
import SettingsModal from './components/SettingsModal';
import ErrorDisplay from './components/ErrorDisplay';
import { GenerationSettings } from './services/geminiService';

export type Model = 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image-preview';

export interface AppSettings {
  apiKey: string;
  useDefaultApiKey: boolean;
  model: Model;
  numberOfImages: number;
}

export interface GridItem {
  id: string;
  src?: string;
}

const DreamWeave: React.FC = () => (
  <div className="dream-container">
    <canvas id="dream-canvas"></canvas>
    <div className="dream-content">
      <h2 className="dream-title">Imagine</h2>
      <p className="dream-subtitle">Compose a prompt to begin.</p>
    </div>
  </div>
);


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [detailViewImage, setDetailViewImage] = useState<string | null>(null);
  const [promptImages, setPromptImages] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    useDefaultApiKey: true,
    model: 'imagen-4.0-generate-001',
    numberOfImages: 4, // Default to a safe value for Imagen 4
  });

  const animationFrameId = useRef<number | null>(null);
  const generationControllerRef = useRef<{ isCancelled: boolean }>({ isCancelled: false });
  const isInitialState = !isLoading && gridItems.length === 0 && !error;

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('imagine-app-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Basic validation to ensure essential keys exist
        if (parsed.model && parsed.numberOfImages !== undefined) {
          // Validate and clamp numberOfImages based on the loaded model
          const maxImages = parsed.model === 'imagen-4.0-generate-001' ? 4 : 6;
          if (parsed.numberOfImages > maxImages) {
            parsed.numberOfImages = maxImages;
          }
          setSettings(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage.', e);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('imagine-app-settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage.', e);
    }
  }, [settings]);

  // Automatically switch to editing model when prompt images are added
  const { model } = settings;
  useEffect(() => {
    // When we have images in the prompt, we are in an editing workflow.
    // Automatically switch to the model that supports image editing for a better user experience.
    if (promptImages.length > 0 && model !== 'gemini-2.5-flash-image-preview') {
      setSettings(prev => ({ ...prev, model: 'gemini-2.5-flash-image-preview' }));
    }
  }, [promptImages.length, model]);


  useEffect(() => {
    // Only run the animation if we're in the initial state.
    // If not, ensure any existing animation is cleaned up.
    if (!isInitialState) {
      if (animationFrameId.current) {
         cancelAnimationFrame(animationFrameId.current);
         animationFrameId.current = null;
      }
      return;
    }

    const canvas = document.getElementById('dream-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const mouse = { x: -1000, y: -1000, radius: 120 };

    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
        baseX: number;
        baseY: number;
        density: number;
    }
    
    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 1.5 + 0.5;
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: size,
            baseX: size,
            baseY: size,
            density: (Math.random() * 30) + 1
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(200, 210, 255, 0.6)';
      
      particles.forEach(p => {
        let dx = mouse.x - p.x;
        let dy = mouse.y - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
            const forceDirectionX = dx / dist;
            const forceDirectionY = dy / dist;
            const maxDistance = mouse.radius;
            const force = (maxDistance - dist) / maxDistance;
            const directionX = forceDirectionX * force * p.density * 0.8;
            const directionY = forceDirectionY * force * p.density * 0.8;
            p.vx -= directionX;
            p.vy -= directionY;
        } else {
             p.vx += (Math.random() - 0.5) * 0.05;
             p.vy += (Math.random() - 0.5) * 0.05;
        }

        // Boundary check
        if (p.x < 0) { p.x = canvas.width; }
        if (p.x > canvas.width) { p.x = 0; }
        if (p.y < 0) { p.y = canvas.height; }
        if (p.y > canvas.height) { p.y = 0; }
        
        // Limit velocity
        p.vx = Math.max(-1.5, Math.min(1.5, p.vx));
        p.vy = Math.max(-1.5, Math.min(1.5, p.vy));
        
        p.x += p.vx;
        p.y += p.vy;
        
        // Friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      connect();

      animationFrameId.current = requestAnimationFrame(animate);
    };

    const connect = () => {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                            + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    if (!ctx) continue;
                    ctx.strokeStyle = `rgba(200, 210, 255, ${opacityValue})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };
    
    setup();
    animate();

    const resizeObserver = new ResizeObserver(setup);
    resizeObserver.observe(document.body);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
}, [isInitialState]);

  const handleGenerate = useCallback(async () => {
    if (isLoading || (!prompt && promptImages.length === 0)) return;

    generationControllerRef.current.isCancelled = false;
    const currentController = generationControllerRef.current;

    setIsLoading(true);
    setError(null);
    setCurrentSearch(prompt || `Remixing ${promptImages.length} image${promptImages.length > 1 ? 's' : ''}`);

    if (detailViewImage) {
        setDetailViewImage(null);
    }

    const generationPrompt = prompt;
    const generationImages = promptImages;
    const hasPromptImages = generationImages.length > 0;

    setPrompt('');
    setPromptImages([]);
    
    const effectiveApiKey = settings.useDefaultApiKey ? null : settings.apiKey;
    
    const generationSettings: GenerationSettings = {
        apiKey: effectiveApiKey,
        numberOfImages: settings.numberOfImages,
        model: settings.model,
    };

    const placeholderIDs = Array.from({ length: settings.numberOfImages }).map(() => `placeholder_${Date.now()}_${Math.random()}`);
    const placeholders: GridItem[] = placeholderIDs.map(id => ({ id, src: undefined }));
    setGridItems(prev => [...placeholders, ...prev]);

    try {
      const generatedSrcs = hasPromptImages
        ? await generateWithImages(generationPrompt, generationImages, generationSettings)
        : await generateImages(generationPrompt, generationSettings);
      
      if (currentController.isCancelled) return;
        
      setGridItems(currentItems => {
        const newItems = [...currentItems];
        let generatedIdx = 0;
        // Find the placeholders we just added and update their src
        for (let i = 0; i < newItems.length && generatedIdx < generatedSrcs.length; i++) {
          if (placeholderIDs.includes(newItems[i].id)) {
            newItems[i].src = generatedSrcs[generatedIdx];
            generatedIdx++;
          }
        }
        // Remove any remaining placeholders if not enough images were generated
        return newItems.filter(item => !(placeholderIDs.includes(item.id) && !item.src));
      });
    } catch (err) {
      if (currentController.isCancelled) return;
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate images. ${errorMessage}`);
      // On error, remove the placeholders we added
      setGridItems(currentItems => currentItems.filter(item => !placeholderIDs.includes(item.id)));
      console.error(err);
    } finally {
      if (currentController.isCancelled) return;
      setIsLoading(false);
    }
  }, [prompt, isLoading, promptImages, settings, detailViewImage]);

  const handleAddImageToPrompt = (image: string) => {
    setPromptImages(prev => {
      if (prev.includes(image)) return prev;
      return [...prev, image];
    });
  };
  
  const handleViewImage = (image: string) => {
    setDetailViewImage(image);
    handleAddImageToPrompt(image);
  };

  const handleCloseDetailView = () => {
    if (detailViewImage) {
      setPromptImages(prev => prev.filter(img => img !== detailViewImage));
    }
    setDetailViewImage(null);
  };
  
  const handleImagePasted = (imageData: string) => {
    handleAddImageToPrompt(imageData);
  };

  const handleRemovePromptImage = (indexToRemove: number) => {
    setPromptImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleGoHome = () => {
    if (isLoading) {
      generationControllerRef.current.isCancelled = true;
      setIsLoading(false);
    }
    setGridItems([]);
    setCurrentSearch('');
    setError(null);
    setPrompt('');
    setDetailViewImage(null);
    setPromptImages([]);
  };

  const handleClearError = () => {
    setError(null);
  }
  
  const renderContent = () => {
    if (gridItems.length > 0) {
      return <ImageGrid 
        items={gridItems} 
        onViewImage={handleViewImage} 
        onAddImageToPrompt={handleAddImageToPrompt}
      />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        isInitial={isInitialState}
        onGoHome={handleGoHome}
      />
      
      {isInitialState ? (
        <DreamWeave />
      ) : (
        <main className="transition-opacity duration-500 opacity-100 pt-20 max-w-7xl mx-auto px-4">
            {currentSearch && (
                <div className="mb-5 animate-fadeInScaleUp">
                    <span className="inline-block max-w-full bg-[#1c1c1e] text-white text-base font-medium px-5 py-2.5 rounded-3xl border border-white/10 break-words">
                        {currentSearch}
                    </span>
                </div>
            )}
            {renderContent()}
        </main>
      )}

      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        onSubmit={handleGenerate}
        isLoading={isLoading}
        promptImages={promptImages}
        onRemovePromptImage={handleRemovePromptImage}
        onImagePasted={handleImagePasted}
        isPreviewing={detailViewImage !== null}
      />
      {detailViewImage && (
        <ImageDetailView image={detailViewImage} onClose={handleCloseDetailView} />
      )}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />
      {error && (
        <ErrorDisplay message={error} onClose={handleClearError} />
      )}
    </div>
  );
};

export default App;
