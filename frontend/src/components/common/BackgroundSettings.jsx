import React, { useState, useRef } from 'react';
import { useBackground } from '../../contexts/BackgroundContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

export default function BackgroundSettings() {
  const { t } = useLanguage();
  const {
    backgroundSettings,
    updateBackground,
    updateOpacity,
    updateBlur,
    toggleBackground,
    resetBackground,
  } = useBackground();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBackground(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    const url = e.target.elements.imageUrl.value;
    if (url) {
      updateBackground(url);
    }
  };

  const presetImages = [
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=80',
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors"
        title={t('backgroundSettings') || '背景设置'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {t('backgroundSettings') || '背景设置'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Toggle Background */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-foreground">
                {t('enableBackground') || '启用背景'}
              </span>
              <button
                onClick={toggleBackground}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backgroundSettings.enabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backgroundSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {backgroundSettings.enabled && (
              <>
                {/* Image Selection */}
                <div className="mb-4">
                  <label className="block text-sm text-foreground mb-2">
                    {t('backgroundImage') || '背景图片'}
                  </label>
                  
                  {/* Preset Images */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {presetImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => updateBackground(img)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          backgroundSettings.image === img
                            ? 'border-primary'
                            : 'border-transparent hover:border-border'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Preset ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {/* File Upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-secondary/80 hover:bg-secondary text-sm text-foreground transition-colors mb-2"
                  >
                    {t('uploadImage') || '上传图片'}
                  </button>

                  {/* URL Input */}
                  <form onSubmit={handleUrlSubmit} className="flex gap-2">
                    <input
                      type="url"
                      name="imageUrl"
                      placeholder={t('imageUrlPlaceholder') || '图片 URL'}
                      className="flex-1 px-3 py-2 rounded-lg bg-secondary/80 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                    >
                      {t('apply') || '应用'}
                    </button>
                  </form>
                </div>

                {/* Opacity Slider */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-foreground">
                      {t('opacity') || '透明度'}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(backgroundSettings.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={backgroundSettings.opacity}
                    onChange={(e) => updateOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Blur Slider */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-foreground">
                      {t('blur') || '模糊度'}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {backgroundSettings.blur}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={backgroundSettings.blur}
                    onChange={(e) => updateBlur(parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </>
            )}

            {/* Reset Button */}
            <button
              onClick={resetBackground}
              className="w-full py-2 px-3 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 text-sm transition-colors"
            >
              {t('reset') || '重置'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
