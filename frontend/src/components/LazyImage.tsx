import { useState, useRef, useEffect, useCallback } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  fallback?: string;
}

export default function LazyImage({ src, alt, className = '', onClick, fallback }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    let timeout: ReturnType<typeof setTimeout>;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    );

    observer.observe(el);
    
    timeout = setTimeout(() => {
      setInView(true);
      observer.disconnect();
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setLoaded(true);
    setError(true);
  }, []);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {error && fallback ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-3xl font-bold text-gray-300 dark:text-gray-600">
            {fallback}
          </span>
        </div>
      ) : (
        <div
          className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 transition-opacity duration-500 ease-in-out ${
            loaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
        </div>
      )}

      {inView && !error && (
        <img
          src={src}
          alt={alt}
          loading={inView ? 'eager' : undefined}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}