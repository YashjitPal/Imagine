import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateImages, editImage } from './services/geminiService';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ImageGrid from './components/ImageGrid';
import SkeletonLoader from './components/SkeletonLoader';
import ImageDetailView from './components/ImageDetailView';
import SettingsModal from './components/SettingsModal';
import { GenerationSettings } from './services/geminiService';

export type Model = 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image-preview';

export interface AppSettings {
  apiKey: string;
  useDefaultApiKey: boolean;
  model: Model;
  numberOfImages: number;
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
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    useDefaultApiKey: true,
    model: 'imagen-4.0-generate-001',
    numberOfImages: 4, // Default to a safe value for Imagen 4
  });

  const animationFrameId = useRef<number | null>(null);

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


  useEffect(() => {
    // Only run the animation if we're in the empty state
    if (images.length > 0 || isLoading) {
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
}, [images.length, isLoading]);

  const handleGenerate = useCallback(async () => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setCurrentSearch(prompt);
    setPrompt(''); // Clear prompt immediately on submission

    const imageToEdit = selectedImage;
    if (imageToEdit) {
      setSelectedImage(null);
    }
    
    const effectiveApiKey = settings.useDefaultApiKey ? null : settings.apiKey;
    
    const generationSettings: GenerationSettings = {
        apiKey: effectiveApiKey,
        numberOfImages: settings.numberOfImages,
        model: settings.model,
    };

    try {
      const generatedImages = imageToEdit
        ? await editImage(prompt, imageToEdit, generationSettings)
        : await generateImages(prompt, generationSettings);
        
      setImages(prevImages => [...generatedImages, ...prevImages]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate images. ${errorMessage}`);
      console.error(err);
      if (imageToEdit) {
        setSelectedImage(imageToEdit);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, selectedImage, settings]);
  
  const handleSelectImage = (image: string) => {
    setSelectedImage(image);
  };

  const handleDeselectImage = () => {
    setSelectedImage(null);
  };

  const handleGoHome = () => {
    setImages([]);
    setCurrentSearch('');
    setError(null);
    setPrompt('');
    setSelectedImage(null);
  };
  
  const isInitialState = !isLoading && images.length === 0;

  const renderContent = () => {
    if (isLoading && images.length === 0) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 pb-28">
          {Array.from({ length: settings.numberOfImages }).map((_, index) => (
            <SkeletonLoader key={index} index={index} />
          ))}
        </div>
      );
    }

    if (error && images.length === 0) {
      return <div className="text-center text-red-400 mt-20 pt-20">{error}</div>;
    }

    if (images.length > 0) {
      return <ImageGrid images={images} onSelectImage={handleSelectImage} isLoading={isLoading} loadingCount={settings.numberOfImages}/>;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        isInitial={isInitialState}
        onGoHome={handleGoHome}
      />
      
      {isInitialState ? (
        <DreamWeave />
      ) : (
        <main className="transition-opacity duration-500 opacity-100 pt-20">
            {currentSearch && (
                <div className="px-4 mb-4 animate-fadeInScaleUp">
                    <span className="inline-block bg-[#2d2f31] text-gray-200 text-sm font-medium px-4 py-2 rounded-full">
                        {currentSearch}
                    </span>
                </div>
            )}
            {error && !isLoading && images.length > 0 && <div className="text-center text-red-400 mb-4">{error}</div>}
            {renderContent()}
        </main>
      )}

      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        onSubmit={handleGenerate}
        isLoading={isLoading}
        editingImage={selectedImage}
        onClearEditingImage={handleDeselectImage}
      />
      {selectedImage && (
        <ImageDetailView image={selectedImage} onClose={handleDeselectImage} />
      )}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
};

export default App;