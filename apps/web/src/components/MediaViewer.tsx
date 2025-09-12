import { useState, useRef, useEffect } from 'react';
import type { Media } from '../types/api';

interface MediaViewerProps {
  media: Media[];
}

export default function MediaViewer({ media }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const currentMedia = media[currentIndex];
  
  useEffect(() => {
    // Pause video when switching media
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  if (media.length === 0) {
    return (
      <div className="aspect-square bg-telegram-secondary-bg rounded-lg flex items-center justify-center">
        <p className="text-telegram-hint">Нет изображений</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aspect-square bg-telegram-secondary-bg rounded-lg overflow-hidden">
        {currentMedia.kind === 'IMAGE' ? (
          <img
            src={currentMedia.url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentMedia.url}
            controls
            className="w-full h-full object-cover"
            playsInline
          />
        )}
      </div>

      {media.length > 1 && (
        <>
          {/* Navigation buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
