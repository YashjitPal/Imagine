import React, { useState, useEffect } from 'react';
import { AppSettings, Model } from '../App';
import { ModelIcon } from './icons/ModelIcon';
import { ApiKeyIcon } from './icons/ApiKeyIcon';
import { MiscIcon } from './icons/MiscIcon';
import { CloseIcon } from './icons/CloseIcon';

type SettingsTab = 'Model' | 'API Key' | 'Miscellaneous';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setSettings }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Model');
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-4xl h-[70vh] max-h-[600px] bg-[#1e1f20]/80 border border-white/10 rounded-2xl shadow-2xl flex transition-all duration-300 transform ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10" aria-label="Close settings">
            <CloseIcon />
        </button>

        {/* Sidebar */}
        <nav className="w-1/4 min-w-[200px] border-r border-white/10 p-4 pt-6">
          <h2 id="settings-title" className="text-lg font-semibold text-white px-3 mb-4">Settings</h2>
          <ul>
            <SidebarItem icon={<ModelIcon />} label="Model" isActive={activeTab === 'Model'} onClick={() => setActiveTab('Model')} />
            <SidebarItem icon={<ApiKeyIcon />} label="API Key" isActive={activeTab === 'API Key'} onClick={() => setActiveTab('API Key')} />
            <SidebarItem icon={<MiscIcon />} label="Miscellaneous" isActive={activeTab === 'Miscellaneous'} onClick={() => setActiveTab('Miscellaneous')} />
          </ul>
        </nav>

        {/* Content */}
        <main className="w-3/4 p-8 overflow-y-auto">
          {activeTab === 'Model' && (
            <ModelSettings model={settings.model} setModel={(model) => handleSettingChange('model', model)} />
          )}
          {activeTab === 'API Key' && (
            <ApiKeySettings 
                useDefault={settings.useDefaultApiKey}
                apiKey={settings.apiKey}
                setUseDefault={(val) => handleSettingChange('useDefaultApiKey', val)}
                setApiKey={(key) => handleSettingChange('apiKey', key)}
            />
          )}
          {activeTab === 'Miscellaneous' && (
            <MiscSettings 
                settings={settings}
                setNumImages={(num) => handleSettingChange('numberOfImages', num)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Sidebar Item Component
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm font-medium ${
        isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  </li>
);

// Settings Content Components
const ModelSettings: React.FC<{ model: Model; setModel: (model: Model) => void }> = ({ model, setModel }) => (
  <div>
    <h3 className="text-xl font-bold text-white mb-2">Generation Model</h3>
    <p className="text-gray-400 mb-6">Select the model to use for generating new images.</p>
    <div className="space-y-3">
        <ModelOption
            name="Imagen 4"
            description="High-quality, general-purpose image generation."
            value="imagen-4.0-generate-001"
            current={model}
            onChange={setModel}
        />
        <ModelOption
            name="Nano Banana"
            description="A fast, multimodal model ideal for image editing."
            value="gemini-2.5-flash-image-preview"
            current={model}
            onChange={setModel}
        />
    </div>
  </div>
);

const ModelOption: React.FC<{name: string, description: string, value: Model, current: Model, onChange: (v: Model) => void}> = ({name, description, value, current, onChange}) => (
    <label className={`block p-4 border rounded-lg cursor-pointer transition-all ${current === value ? 'bg-blue-500/10 border-blue-500' : 'border-white/10 hover:border-white/30'}`}>
        <input type="radio" name="model" value={value} checked={current === value} onChange={() => onChange(value)} className="hidden"/>
        <h4 className="font-semibold text-white">{name}</h4>
        <p className="text-sm text-gray-400">{description}</p>
    </label>
);


const ApiKeySettings: React.FC<{useDefault: boolean, apiKey: string, setUseDefault: (v: boolean) => void, setApiKey: (k: string) => void}> = ({ useDefault, apiKey, setUseDefault, setApiKey}) => (
    <div>
        <h3 className="text-xl font-bold text-white mb-2">API Key</h3>
        <p className="text-gray-400 mb-6">Use the default API key or provide your own.</p>
        
        <div className="flex items-center space-x-3 mb-6">
            <span className="text-gray-300">Default Key</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={!useDefault} onChange={(e) => setUseDefault(!e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-gray-300">Custom Key</span>
        </div>

        {!useDefault && (
            <div className="animate-fadeIn">
                <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">Your Gemini API Key</label>
                <input 
                    id="api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full bg-[#101010] border border-white/20 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        )}
    </div>
);

const MiscSettings: React.FC<{settings: AppSettings, setNumImages: (n: number) => void}> = ({ settings, setNumImages }) => {
    const { model, numberOfImages } = settings;
    const maxImages = model === 'imagen-4.0-generate-001' ? 4 : 6;
    
    // Clamp the number of images if the current value is invalid for the selected model.
    useEffect(() => {
        if (numberOfImages > maxImages) {
            setNumImages(maxImages);
        }
    }, [model, numberOfImages, maxImages, setNumImages]);
    
    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-2">Miscellaneous</h3>
            <p className="text-gray-400 mb-6">Adjust other generation parameters.</p>
            <label htmlFor="num-images-slider" className="block text-sm font-medium text-gray-300 mb-2">Number of Images: <span className="font-bold text-white">{numberOfImages}</span></label>
            <input 
                id="num-images-slider"
                type="range"
                min="1"
                max={maxImages}
                step="1"
                value={numberOfImages}
                onChange={(e) => setNumImages(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            {model === 'imagen-4.0-generate-001' && (
                <p className="text-xs text-gray-500 mt-2">The Imagen 4 model supports up to 4 images at a time.</p>
            )}
        </div>
    );
};


export default SettingsModal;