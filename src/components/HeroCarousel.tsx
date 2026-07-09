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
  const slidesRef = useRef<any[]>([]);
  const contentRef = useRef<any[]>([]);
  const imageRef = useRef<any[]>([]);
  const buttonRef = useRef(null);
  
  const slideDirection = useRef<'next' | 'prev'>('next');
  const prevActiveIndexRef = useRef<number | null>(null);

  // GSAP Timeline for animations
  const tl = useRef<any>(null);

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
  }, [activeIndex, windowWidth, slides.length]); // Re-run when slides length updates

  const animateActiveSlide = () => {
    if (tl.current) {
      tl.current.clear();
    }
    
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1024;
    
    // Calculate offsets based on screen size
    let xOffset = 1265;
    if (isMobile) {
      xOffset = 350;
    } else if (isTablet) {
      xOffset = 590;
    }
    
    const total = slides.length;
    if (total === 0) return;

    const prevActiveIndex = prevActiveIndexRef.current;
    
    slides.forEach((_, index) => {
      const slideElement = slidesRef.current[index];
      if (!slideElement) return;
      
      // Calculate circular distance between this slide index and the active index
      let diff = index - activeIndex;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      
      let x = 0;
      let scale = 0.8;
      let opacity = 0;
      let zIndex = 0;
      let pointerEvents = 'none';
      
      if (diff === 0) {
        x = 0;
        scale = 1;
        opacity = 1;
        zIndex = 20;
        pointerEvents = 'auto';
      } else if (diff === -1) {
        x = -xOffset;
        scale = 0.9;
        opacity = 0.4;
        zIndex = 10;
        pointerEvents = 'auto';
      } else if (diff === 1) {
        x = xOffset;
        scale = 0.9;
        opacity = 0.4;
        zIndex = 10;
        pointerEvents = 'auto';
      } else if (diff < -1) {
        x = -xOffset * 1.5;
        scale = 0.8;
        opacity = 0;
        zIndex = 0;
        pointerEvents = 'none';
      } else {
        x = xOffset * 1.5;
        scale = 0.8;
        opacity = 0;
        zIndex = 0;
        pointerEvents = 'none';
      }

      // Check if this slide needs to wrap around the carousel edges
      let isWrapping = false;
      if (prevActiveIndex !== null && total > 2) {
        const oldPrev = (prevActiveIndex - 1 + total) % total;
        const oldNext = (prevActiveIndex + 1) % total;

        // Moving forward: slide that was on the left wraps to become the new right slide
        if (index === oldPrev && diff === 1) {
          isWrapping = true;
          gsap.killTweensOf(slideElement);
          gsap.to(slideElement, {
            x: -xOffset * 1.3,
            opacity: 0,
            scale: 0.8,
            duration: 0.35,
            ease: "power2.in",
            onComplete: () => {
              gsap.set(slideElement, { x: xOffset * 1.3, zIndex: 10, xPercent: -50, yPercent: -50 });
              gsap.to(slideElement, {
                x: xOffset,
                scale: 0.9,
                opacity: 0.4,
                duration: 0.45,
                ease: "power2.out"
              });
            }
          });
        }
        // Moving backward: slide that was on the right wraps to become the new left slide
        else if (index === oldNext && diff === -1) {
          isWrapping = true;
          gsap.killTweensOf(slideElement);
          gsap.to(slideElement, {
            x: xOffset * 1.3,
            opacity: 0,
            scale: 0.8,
            duration: 0.35,
            ease: "power2.in",
            onComplete: () => {
              gsap.set(slideElement, { x: -xOffset * 1.3, zIndex: 10, xPercent: -50, yPercent: -50 });
              gsap.to(slideElement, {
                x: -xOffset,
                scale: 0.9,
                opacity: 0.4,
                duration: 0.45,
                ease: "power2.out"
              });
            }
          });
        }
      }

      if (!isWrapping) {
        // Animate card container position/scale smoothly
        gsap.to(slideElement, {
          xPercent: -50,
          yPercent: -50,
          x: x,
          scale: scale,
          opacity: opacity,
          zIndex: zIndex,
          pointerEvents: pointerEvents,
          duration: 0.8,
          ease: "power2.inOut" // Premium smooth transition curve
        });
      }
      
      // Animate content elements
      const content = contentRef.current[index];
      const image = imageRef.current[index];
      
      if (index === activeIndex) {
        if (content) {
          const heading = content.querySelector('h2');
          const subheading = content.querySelector('p');
          const button = content.querySelector('a');
          
          // Reset and animate heading
          if (heading) {
            gsap.fromTo(heading, 
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
            );
          }
          
          // Reset and animate subheading
          if (subheading) {
            gsap.fromTo(subheading,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.35 }
            );
          }
          
          // Reset and animate button
          if (button) {
            gsap.fromTo(button,
              { y: 15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.5 }
            );
          }
        }
        
        if (image) {
          const isInitialLoad = prevActiveIndexRef.current === null;
          if (isInitialLoad) {
            // Fade in cleanly without sliding horizontally on initial page load
            gsap.fromTo(image,
              { opacity: 0 },
              { opacity: 1, duration: 1.0, ease: "power3.out" }
            );
          } else {
            // Slide image in from left/right depending on navigation direction
            const startX = slideDirection.current === 'next' ? 120 : -120;
            gsap.fromTo(image,
              { x: startX, opacity: 0 },
              { x: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: 0.1 }
            );
          }
        }
      } else {
        // Clear content animations for inactive slides to keep them clean
        if (content) {
          const heading = content.querySelector('h2');
          const subheading = content.querySelector('p');
          const button = content.querySelector('a');
          
          gsap.set([heading, subheading, button], { opacity: 0, y: 0 });
        }
        if (image) {
          // Set to visible and centered for side previews
          gsap.set(image, { opacity: 1, x: 0 });
        }
      }
    });

    prevActiveIndexRef.current = activeIndex;
  };

  const prevSlide = () => {
    slideDirection.current = 'prev';
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    slideDirection.current = 'next';
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const getSlideClass = (index) => {
    const baseClass = "absolute flex flex-col items-center justify-center bg-transparent rounded-2xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden";
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
    
    // Calculate offsets based on screen size
    let xOffset = 1265;
    if (isMobile) {
      xOffset = 350;
    } else if (isTablet) {
      xOffset = 590;
    }

    const total = slides.length;
    let x = 0;
    let scale = 0.8;
    let opacity = 0;
    let zIndex = 0;

    if (total > 0) {
      let diff = index - activeIndex;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      if (diff === 0) {
        x = 0;
        scale = 1;
        opacity = 1;
        zIndex = 20;
      } else if (diff === -1) {
        x = -xOffset;
        scale = 0.9;
        opacity = 0.4;
        zIndex = 10;
      } else if (diff === 1) {
        x = xOffset;
        scale = 0.9;
        opacity = 0.4;
        zIndex = 10;
      } else if (diff < -1) {
        x = -xOffset * 1.5;
        scale = 0.8;
        opacity = 0;
        zIndex = 0;
      } else {
        x = xOffset * 1.5;
        scale = 0.8;
        opacity = 0;
        zIndex = 0;
      }
    }

    return {
      fontFamily: "'Albert Sans', sans-serif",
      boxSizing: 'border-box' as const,
      transform: `translate(calc(-50% + ${x}px), -50%) scale(${scale})`,
      opacity: opacity,
      zIndex: zIndex,
    };
  };

  const getContainerHeight = () => {
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1024;
    if (isMobile) return '500px';
    if (isTablet) return '600px';
    return '740px';
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
      <div 
        className="flex items-center justify-center relative w-full overflow-hidden px-4 sm:px-8"
        style={{ height: getContainerHeight() }}
      >
        {slides.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center bg-[#f5f5f7] rounded-2xl min-h-[400px] w-full max-w-4xl">
            <p className="text-gray-500 text-lg">Loading slides...</p>
          </div>
        ) : (
          slides.map((slide, index) => {
            const imageUrl = slide.image ? getImageUrl(slide.image) : null;
            
            return (
              <div
                key={`${slide.id}-${index}`}
                ref={el => { slidesRef.current[index] = el; }}
                className={getSlideClass(index)}
                style={getSlideStyle(index)}
              >
                {/* Stable Background Container */}
                <div className="absolute inset-0 bg-[#f5f5f7] rounded-2xl z-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.15)]" />
                
                {/* Slide Image - now a separate absolute layer that slides left/right smoothly */}
                {slide.image && (
                  <div 
                    ref={el => { imageRef.current[index] = el; }}
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl z-0"
                  >
                    <img 
                      src={imageUrl} 
                      alt={slide.heading}
                      className="w-full h-full object-cover select-none"
                    />
                  </div>
                )}

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
                    style={{ color: slide.textColor || '#000000', opacity: 0 }}
                  >
                    {slide.heading.split('\n').map((line, lineIndex) => (
                      <React.Fragment key={lineIndex}>
                        {line}
                        {lineIndex < slide.heading.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h2>
                  
                  {/* Subheading */}
                  <p 
                    className={`mb-3 sm:mb-6 max-w-xs sm:max-w-md ${
                      index === activeIndex 
                        ? 'text-[12px] sm:text-[16px] lg:text-[20px]' 
                        : 'text-[10px] sm:text-[14px] lg:text-[16px]'
                    }`}
                    style={{ color: slide.textColor || '#000000', opacity: 0 }}
                  >
                    {slide.subheading}
                  </p>
                  
                  {/* Button */}
                  <a
                    href={slide.buttonLink || '/products'}
                    style={{ 
                      marginTop: '30px',
                      borderColor: slide.textColor || '#000000',
                      color: slide.textColor || '#000000',
                      opacity: 0
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
                </div>
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