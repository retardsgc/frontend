import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import siteConfig from '../data/siteConfig.json';
// TypeScript: JSON import typed as any for hero config
const staticConfig: any = siteConfig;
import siteConfigService from '../services/siteConfigService';
import { getImageUrl } from '../utils/imageUrl';

const HeroCarousel = () => {
  const [slides, setSlides] = useState<any[]>(staticConfig.hero?.slides || []);
  const [activeIndex, setActiveIndex] = useState(300);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const slidesRef = useRef<any[]>([]);
  const contentRef = useRef<any[]>([]);
  const imageRef = useRef<any[]>([]);
  const buttonRef = useRef(null);

  const slideDirection = useRef<'next' | 'prev'>('next');
  const prevActiveIndexRef = useRef<number | null>(null);
  const initialActiveIndexRef = useRef<number | null>(null);

  // Gesture swipe tracking state refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  // Generate an extended slide list to support smooth loop transitions without wrapping gaps
  const extendedSlides = React.useMemo(() => {
    if (slides.length === 0) return [];
    let list = [...slides];
    while (list.length < 6) {
      list = [...list, ...slides];
    }
    return list;
  }, [slides]);

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
          setActiveIndex(config.slides.length * 100);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    // Initialize GSAP timeline
    tl.current = gsap.timeline();

    // Animate active slide content
    animateActiveSlide();
  }, [activeIndex, windowWidth, extendedSlides.length]); // Re-run when slides length updates

  const animateActiveSlide = () => {
    if (tl.current) {
      tl.current.clear();
    }

    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1024;

    // Calculate offsets based on screen size (card width + gap)
    let xOffset = 1350; // 1300 width + 50 gap (slightly increased)
    if (isMobile) {
      xOffset = 370; // 350 width + 20 gap
    } else if (isTablet) {
      xOffset = 630; // 600 width + 30 gap
    }

    const total = extendedSlides.length;
    if (total === 0) return;

    extendedSlides.forEach((_, index) => {
      const slideElement = slidesRef.current[index];
      if (!slideElement) return;

      // Calculate circular distance between this slide index and the active index Mod total
      const activeIndexMod = activeIndex % total;
      let diff = index - activeIndexMod;
      let wrappedDiff = ((diff + total / 2) % total + total) % total - total / 2;

      let x = 0;
      let scale = 1;
      let opacity = 0;
      let zIndex = 0;
      let pointerEvents = 'none';

      if (wrappedDiff === 0) {
        x = 0;
        scale = 1;
        opacity = 1;
        zIndex = 20;
        pointerEvents = 'auto';
      } else if (wrappedDiff === -1) {
        x = -xOffset;
        scale = 1;
        opacity = 1;
        zIndex = 10;
        pointerEvents = 'auto';
      } else if (wrappedDiff === 1) {
        x = xOffset;
        scale = 1;
        opacity = 1;
        zIndex = 10;
        pointerEvents = 'auto';
      } else if (wrappedDiff < -1) {
        x = -xOffset * 2;
        scale = 1;
        opacity = 0;
        zIndex = 10; // Keep at 10 to prevent sudden disappearance during horizontal translation
        pointerEvents = 'none';
      } else {
        x = xOffset * 2;
        scale = 1;
        opacity = 0;
        zIndex = 10; // Keep at 10 to prevent sudden disappearance during horizontal translation
        pointerEvents = 'none';
      }

      // Animate card container position/scale smoothly (synchronized to 1.2s duration)
      gsap.to(slideElement, {
        xPercent: -50,
        yPercent: -50,
        x: x,
        scale: scale,
        opacity: opacity,
        zIndex: zIndex,
        pointerEvents: pointerEvents,
        duration: 1.2,
        ease: "power2.inOut" // Premium smooth transition curve
      });

      // Animate content elements
      const content = contentRef.current[index];
      const image = imageRef.current[index];

      if (index === activeIndexMod) {
        if (content) {
          const heading = content.querySelector('h2');
          const subheading = content.querySelector('p');
          const button = content.querySelector('a');

          // Pop up slide text smoothly in stagger sequence every time a slide is active
          if (heading) {
            gsap.fromTo(heading,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: 0.4 }
            );
          }
          if (subheading) {
            gsap.fromTo(subheading,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: 0.6 }
            );
          }
          if (button) {
            gsap.fromTo(button,
              { y: 15, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: 0.8 }
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
            // Keep the image fully visible and let it slide/resize naturally with the card container (no blinking!)
            gsap.set(image, { opacity: 1, x: 0 });
          }
        }
      } else {
        // Fade out content elements smoothly for inactive slides
        if (content) {
          const heading = content.querySelector('h2');
          const subheading = content.querySelector('p');
          const button = content.querySelector('a');

          gsap.to([heading, subheading, button], {
            opacity: 0,
            duration: 1.2, // Match the slide transition duration so text goes with the slide
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set([heading, subheading, button], { y: 0 });
            }
          });
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
    if (slides.length === 0) return;
    slideDirection.current = 'prev';
    setActiveIndex((prev) => prev - 1);
  };

  const nextSlide = () => {
    if (slides.length === 0) return;
    slideDirection.current = 'next';
    setActiveIndex((prev) => prev + 1);
  };

  // Swipe event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Minimum displacement of 50px is needed to trigger, and horizontal component must be larger
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only trigger for left-clicks
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    isDragging.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.clientX - touchStartX.current;
    const diffY = e.clientY - touchStartY.current;

    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  const getSlideClass = (index) => {
    const total = extendedSlides.length;
    const activeIndexMod = total > 0 ? activeIndex % total : 0;
    const baseClass = "absolute flex flex-col items-center justify-center bg-transparent rounded-2xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden";
    const sizeClass = index === activeIndexMod ? "carousel-card-active" : "carousel-card-inactive";

    if (index === activeIndexMod) {
      return `${baseClass} ${sizeClass} z-20`;
    } else {
      return `${baseClass} ${sizeClass} z-10`;
    }
  };

  const getSlideStyle = (index) => {
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1024;

    // Calculate offsets based on screen size (card width + gap)
    let xOffset = 1350; // 1300 width + 50 gap (slightly increased)
    if (isMobile) {
      xOffset = 370;
    } else if (isTablet) {
      xOffset = 630;
    }

    const total = extendedSlides.length;
    if (initialActiveIndexRef.current === null && total > 0) {
      initialActiveIndexRef.current = activeIndex;
    }

    let x = 0;
    let scale = 1;
    let opacity = 0;
    let zIndex = 0;

    if (total > 0) {
      const activeIndexMod = (initialActiveIndexRef.current ?? activeIndex) % total;
      let diff = index - activeIndexMod;
      let wrappedDiff = ((diff + total / 2) % total + total) % total - total / 2;

      if (wrappedDiff === 0) {
        x = 0;
        scale = 1;
        opacity = 1;
        zIndex = 20;
      } else if (wrappedDiff === -1) {
        x = -xOffset;
        scale = 1;
        opacity = 1;
        zIndex = 10;
      } else if (wrappedDiff === 1) {
        x = xOffset;
        scale = 1;
        opacity = 1;
        zIndex = 10;
      } else if (wrappedDiff < -1) {
        x = -xOffset * 2;
        scale = 1;
        opacity = 0;
        zIndex = 10; // Keep at 10 to prevent sudden disappearance during transition
      } else {
        x = xOffset * 2;
        scale = 1;
        opacity = 0;
        zIndex = 10; // Keep at 10 to prevent sudden disappearance during transition
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
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* Slides Container */}
      <div
        className="flex items-center justify-center relative w-full overflow-hidden px-4 sm:px-8 cursor-grab active:cursor-grabbing select-none"
        style={{ height: getContainerHeight() }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {extendedSlides.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center bg-[#f5f5f7] rounded-2xl min-h-[400px] w-full max-w-4xl">
            <p className="text-gray-500 text-lg">Loading slides...</p>
          </div>
        ) : (
          extendedSlides.map((slide, index) => {
            const imageUrl = slide.image ? getImageUrl(slide.image) : null;
            const total = extendedSlides.length;
            const activeIndexMod = total > 0 ? activeIndex % total : 0;

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
                    className="font-normal mb-3 sm:mb-6 leading-tight text-[28px] sm:text-[40px] lg:text-[56px]"
                    style={{
                      color: slide.textColor || '#000000',
                      opacity: 0
                    }}
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
                    className="mb-3 sm:mb-6 max-w-xs sm:max-w-md text-[12px] sm:text-[16px] lg:text-[20px]"
                    style={{
                      color: slide.textColor || '#000000',
                      opacity: 0
                    }}
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
                    className="inline-flex items-center border-2 px-4 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-medium transition-colors duration-300 hover:bg-black hover:!text-white group"
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
                      <path d="m9 18 6-6-6-6" />
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
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </section>
  );
};

export default HeroCarousel;