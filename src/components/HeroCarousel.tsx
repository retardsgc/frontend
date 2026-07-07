import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import siteConfig from '../data/siteConfig.json';
// TypeScript: JSON import typed as any for hero config
const staticConfig: any = siteConfig;
import siteConfigService from '../services/siteConfigService';
import { getImageUrl } from '../utils/imageUrl';

const HeroCarousel = () => {
  const [slides, setSlides] = useState<any[]>(staticConfig.hero?.slides || []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const slidesRef = useRef([]);
  const contentRef = useRef([]);
  const imageRef = useRef([]);
  const buttonRef = useRef(null);

  // GSAP Timeline for animations
  const tl = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch hero slides from backend on mount
  useEffect(() => {
    siteConfigService.getHero()
      .then(config => {
        if (config.slides && Array.isArray(config.slides)) {
          setSlides(config.slides);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Initialize GSAP timeline
    tl.current = gsap.timeline();
    
    // Animate active slide content
    animateActiveSlide();
  }, [activeIndex, windowWidth]);

  const animateActiveSlide = () => {
    if (tl.current) {
      tl.current.clear();
      
      // Get visible slides for current state
      const visibleSlides = getVisibleSlides();
      
      // Animate slide cards with position transitions
      visibleSlides.forEach(({ slide, index, position }) => {
        const slideElement = slidesRef.current[index];
        if (slideElement) {
          if (index === activeIndex) {
            // Active card: animate to center with full opacity and scale
            gsap.to(slideElement, {
              scale: 1,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out"
            });
          } else {
            // Inactive cards: animate to side positions with reduced opacity and scale
            gsap.to(slideElement, {
              scale: 0.9,
              opacity: 0.4,
              duration: 0.8,
              ease: "power2.out"
            });
          }
        }
      });

      // Animate content elements for active slide
      const activeContent = contentRef.current[activeIndex];
      const activeImage = imageRef.current[activeIndex];
      
      if (activeContent) {
        const heading = activeContent.querySelector('h2');
        const subheading = activeContent.querySelector('p');
        const button = activeContent.querySelector('button');

        // Reset and animate heading
        if (heading) {
          gsap.fromTo(heading, 
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.3 }
          );
        }

        // Reset and animate subheading
        if (subheading) {
          gsap.fromTo(subheading,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.5 }
          );
        }

        // Reset and animate button
        if (button) {
          gsap.fromTo(button,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.7 }
          );
        }
      }

      // Animate image
      if (activeImage) {
        gsap.fromTo(activeImage,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.9 }
        );
      }
    }
  };

  const prevSlide = () => {
    // Add a smooth transition animation before changing slides
    const visibleSlides = getVisibleSlides();
    const visibleElements = visibleSlides.map(({ index }) => slidesRef.current[index]).filter(Boolean);
    
    gsap.to(visibleElements, {
      x: 20,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => {
        setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
        gsap.to(visibleElements, {
          x: 0,
          duration: 0.15,
          ease: "power2.out"
        });
      }
    });
  };

  const nextSlide = () => {
    // Add a smooth transition animation before changing slides
    const visibleSlides = getVisibleSlides();
    const visibleElements = visibleSlides.map(({ index }) => slidesRef.current[index]).filter(Boolean);
    
    gsap.to(visibleElements, {
      x: -20,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => {
        setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        gsap.to(visibleElements, {
          x: 0,
          duration: 0.15,
          ease: "power2.out"
        });
      }
    });
  };

  const getSlideClass = (index) => {
    const baseClass = "relative flex flex-col items-center justify-center bg-[#f5f5f7] rounded-2xl";
    const sizeClass = index === activeIndex ? "carousel-card-active" : "carousel-card-inactive";
    
    if (index === activeIndex) {
      return `${baseClass} ${sizeClass} z-20`;
    } else {
      return `${baseClass} ${sizeClass} z-10`;
    }
  };

  const getSlideStyle = (index) => {
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1024;
    
    // Base styles for all cards
    const baseStyle = {
      fontFamily: "'Albert Sans', sans-serif",
      boxSizing: 'border-box' as const,
      transition: 'all 0.3s ease'
    };

    // For active card, full size and centered
    if (index === activeIndex) {
      return {
        ...baseStyle,
        width: isMobile ? '300px' : isTablet ? '450px' : '600px',
        height: isMobile ? '350px' : isTablet ? '450px' : '500px',
        zIndex: 20,
        marginLeft: '0',
        marginRight: '0'
      };
    }

    // For inactive cards, show only tips with negative margins
    const visibleSlides = getVisibleSlides();
    const currentSlide = visibleSlides.find(slide => slide.index === index);
    
    if (currentSlide?.position === 'left') {
      // Left card: show only right tip
      return {
        ...baseStyle,
        width: isMobile ? '300px' : isTablet ? '450px' : '600px',
        height: isMobile ? '350px' : isTablet ? '450px' : '500px',
        zIndex: 10,
        marginLeft: isMobile ? '-220px' : isTablet ? '-350px' : '-480px',
        marginRight: isMobile ? '20px' : isTablet ? '30px' : '40px'
      };
    } else if (currentSlide?.position === 'right') {
      // Right card: show only left tip
      return {
        ...baseStyle,
        width: isMobile ? '300px' : isTablet ? '450px' : '600px',
        height: isMobile ? '350px' : isTablet ? '450px' : '500px',
        zIndex: 10,
        marginLeft: isMobile ? '20px' : isTablet ? '30px' : '40px',
        marginRight: isMobile ? '-220px' : isTablet ? '-350px' : '-480px'
      };
    }

    return baseStyle;
  };

  const getVisibleSlides = () => {
    const total = slides.length;
    
    // Return empty array if no slides available
    if (total === 0) {
      return [];
    }
    
    const prev = (activeIndex - 1 + total) % total;
    const next = (activeIndex + 1) % total;
    
    return [
      { slide: slides[prev], index: prev, position: 'left' },
      { slide: slides[activeIndex], index: activeIndex, position: 'center' },
      { slide: slides[next], index: next, position: 'right' }
    ];
  };

  return (
    <section className="relative flex justify-center items-start w-full overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[800px] bg-white pt-0 pb-8">
      {/* Left Arrow */}
      <button
        className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center group"
        onClick={(e) => {
          prevSlide();
          gsap.to(e.currentTarget, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        }}
        aria-label="Previous slide"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="sm:w-5 sm:h-5"
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {/* Slides Container */}
      <div className="flex items-start justify-center relative w-full overflow-hidden px-4 sm:px-8">
        {slides.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center bg-[#f5f5f7] rounded-2xl min-h-[400px] w-full max-w-4xl">
            <p className="text-gray-500 text-lg">Loading slides...</p>
          </div>
        ) : (
          getVisibleSlides().map(({ slide, index, position }) => {
            const imageUrl = slide.image ? getImageUrl(slide.image) : null;
            
            return (
          <div
            key={`${slide.id}-${index}-${position}`}
            ref={el => { slidesRef.current[index] = el; }}
            className={getSlideClass(index)}
            style={{
              ...getSlideStyle(index),
              backgroundImage: slide.image ? `url("${imageUrl}")` : 'none',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.2)'
            } as React.CSSProperties}
          >
            {/* Content Section - Overlaid on background */}
            <div 
              ref={el => { contentRef.current[index] = el; }}
              className="flex flex-col items-center text-center px-4 sm:px-8 lg:px-16 py-4 sm:py-8 relative z-10 w-[70%] sm:w-full mx-auto h-full justify-start pt-16 sm:pt-16"
            >
              {/* Main Heading */}
              <h2 
                className={`font-normal mb-3 sm:mb-6 leading-tight ${
                  index === activeIndex 
                    ? 'text-[28px] sm:text-[40px] lg:text-[56px]' 
                    : 'text-[20px] sm:text-[30px] lg:text-[40px]'
                }`}
                style={{ color: slide.textColor || '#000000' }}
              >
                {slide.heading.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    {lineIndex < slide.heading.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>
              
              {/* Subheading - Now visible on mobile */}
              <p 
                className={`mb-3 sm:mb-6 max-w-xs sm:max-w-md ${
                  index === activeIndex 
                    ? 'text-[12px] sm:text-[16px] lg:text-[20px]' 
                    : 'text-[10px] sm:text-[14px] lg:text-[16px]'
                }`}
                style={{ color: slide.textColor || '#000000' }}
              >
                {slide.subheading}
              </p>
              
              {/* Button - only show on active slide */}
              {index === activeIndex && (
                <a
                  href={slide.buttonLink || '/products'}
                  ref={buttonRef}
                  style={{ 
                    marginTop: '30px',
                    borderColor: slide.textColor || '#000000',
                    color: slide.textColor || '#000000'
                  }}
                  className="inline-flex items-center border-2 px-4 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-medium transition-all duration-300 hover:bg-black hover:!text-white group"
                >
                  {slide.button}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 transition-transform group-hover:translate-x-1 sm:w-4 sm:h-4"
                  >
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              )}
            </div>
            
            {/* Hidden image ref for GSAP animations */}
            {slide.image && (
              <img 
                ref={el => { imageRef.current[index] = el; }}
                src={getImageUrl(slide.image)} 
                alt={slide.heading}
                className="hidden"
              />
            )}
          </div>
            );
          })
        )}
      </div>

      {/* Right Arrow */}
      <button
        className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center group"
        onClick={(e) => {
          nextSlide();
          gsap.to(e.currentTarget, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        }}
        aria-label="Next slide"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="sm:w-5 sm:h-5"
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </section>
  );
};

export default HeroCarousel;