import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useAnnouncementBar } from '../hooks/useSiteConfig';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const AnnouncementBar: React.FC = () => {
  const { data, loading, error } = useAnnouncementBar();
  // Do NOT persist dismissal so it shows again on refresh
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const barRef = useRef<HTMLDivElement | null>(null);

  // Memoize announcement data processing for performance
  const announcementData = useMemo(() => data || {}, [data]);

  // Check if announcement bar is enabled (handle both 'enabled' and 'isActive' properties)
  const isEnabled = useMemo(() =>
    announcementData?.enabled !== false && announcementData?.isActive !== false,
    [announcementData]
  );

  const announcements = useMemo(() => {
    if (announcementData?.announcements && announcementData.announcements.length > 0) {
      return announcementData.announcements.filter((a: string) => a && a.trim().length > 0);
    }
    return [
      'Welcome to our store - Free shipping on orders over ₹50!',
      'Summer Sale - Up to 50% off selected items!',
      'New arrivals just landed - Shop the latest trends!'
    ];
  }, [announcementData?.announcements]);

  // Create extended array for infinite loop effect [last, ...original, first]
  const extendedAnnouncements = useMemo(() => {
    if (announcements.length < 2) return announcements;
    return [
      announcements[announcements.length - 1],
      ...announcements,
      announcements[0]
    ];
  }, [announcements]);

  const showBar = !dismissed && isEnabled && !loading && !error && announcements.length > 0;

  // Optimized height notification with useCallback
  const notifyHeight = useCallback(() => {
    const h = showBar ? (barRef.current?.offsetHeight || 0) : 0;
    window.dispatchEvent(new CustomEvent('announcementbar:height', { detail: h }));
  }, [showBar]);

  // Inform layout about the bar height so content can offset accordingly
  useEffect(() => {
    notifyHeight();
    if (showBar) {
      window.addEventListener('resize', notifyHeight);
    }
    return () => {
      window.removeEventListener('resize', notifyHeight);
      window.dispatchEvent(new CustomEvent('announcementbar:height', { detail: 0 }));
    };
  }, [showBar, notifyHeight]);

  const handleNext = useCallback(() => {
    if (isTransitioning || announcements.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isTransitioning, announcements.length]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning || announcements.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isTransitioning, announcements.length]);

  // Auto-advance
  useEffect(() => {
    if (!showBar || announcements.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [showBar, announcements.length, isPaused, handleNext]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    
    // Handle infinite loop jumps
    if (currentIndex === 0) {
      // Jump to real last item
      setCurrentIndex(extendedAnnouncements.length - 2);
    } else if (currentIndex === extendedAnnouncements.length - 1) {
      // Jump to real first item
      setCurrentIndex(1);
    }
  };

  const handleClose = useCallback(() => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('announcementbar:height', { detail: 0 }));
    }
  }, []);

  const backgroundColor = useMemo(() =>
    announcementData?.backgroundColor || '#2c3bc5',
    [announcementData?.backgroundColor]
  );

  const textColor = useMemo(() =>
    announcementData?.textColor || '#ffffff',
    [announcementData?.textColor]
  );

  // After all hooks, decide to render or not
  if (!showBar) {
    return null;
  }

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Site announcements"
      aria-live="polite"
      className="w-full h-10 flex items-center justify-center fixed -top-px inset-x-0 z-[60] relative transition-colors duration-300"
      style={{
        fontFamily: "'Albert Sans', sans-serif",
        backgroundColor: backgroundColor,
        color: textColor
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Arrows - Only show if multiple announcements */}
      {announcements.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
          className="absolute left-4 p-1 rounded-full hover:bg-black/10 transition-colors hidden md:flex items-center justify-center z-20"
          aria-label="Previous announcement"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden h-full relative mx-12">
        <div 
          className="flex h-full items-center absolute top-0 left-0 w-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.3s ease-in-out' : 'none'
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedAnnouncements.map((announcement, index) => (
            <div 
              key={index} 
              className="w-full flex-shrink-0 flex items-center justify-center px-4"
              style={{ width: '100%' }}
            >
              <p className="text-sm font-medium text-center truncate">
                {announcement}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Only show if multiple announcements */}
      {announcements.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-10 md:right-12 p-1 rounded-full hover:bg-black/10 transition-colors hidden md:flex items-center justify-center z-20"
          aria-label="Next announcement"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Close Button */}
      <button
        type="button"
        aria-label="Dismiss announcements"
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors flex items-center justify-center z-20"
        style={{ color: textColor }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
