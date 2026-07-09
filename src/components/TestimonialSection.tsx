import React, { useState, useEffect } from 'react';
import siteConfigService from '../services/siteConfigService';
import type { SiteConfig, TestimonialSection as TestimonialSectionType } from '../types';
import { getImageUrl } from '../utils/imageUrl';

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  heading?: string;
  productImage?: string;
  productName?: string;
  productPrice?: string;
  productLink?: string;
}

const TestimonialSection: React.FC = () => {
  const [config, setConfig] = useState<any | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    // Load homepage configuration using the siteConfigService
    const loadHomepageConfig = async () => {
      try {
        const homepageConfig = await siteConfigService.getHomepage();
        setConfig(homepageConfig);
      } catch (error) {
        // Set fallback config on error
        setConfig({
          testimonialSection: {
            title: "Customer Testimonials",
            subtitle: "See what our satisfied customers have to say about our electronic accessories.",
            layout: "model1",
            navigationLabels: { previous: "Previous", next: "Next" },
            testimonials: [
              {
                name: "Robert Smith",
                role: "Customer from USA",
                text: "I always find something stylish and affordable on this web fashion site",
                rating: 5,
                heading: "Best Online Fashion Site",
                productName: "3-in-1 Wireless Charger with Official MagSafe Charging 15W",
                productPrice: "$105.95",
                productImage: "feature1",
                productLink: "#"
              },
              {
                name: "Allen Lyn",
                role: "Customer from France",
                text: "I love the variety of styles and the high-quality clothing on this web fashion site.",
                rating: 5,
                heading: "Great Selection and Quality",
                productName: "SoundForm Rise",
                productPrice: "$7.95",
                productImage: "feature2",
                productLink: "#"
              },
              {
                name: "Peter Rope",
                role: "Customer from USA",
                text: "I finally found a web fashion site with stylish and flattering options in my size.",
                rating: 5,
                heading: "Best Customer Service",
                productName: "UltraGlass 2 Treated Screen Protector for iPhone 15 Pro",
                productPrice: "From $18.95",
                productImage: "feature3",
                productLink: "#"
              }
            ]
          }
        });
      }
    };

    loadHomepageConfig();
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!config) return <div>Loading...</div>;

  // Get testimonialSection from config with fallback
  const testimonialSection: TestimonialSectionType = config.testimonialSection || {
    title: "Customer Testimonials",
    subtitle: "See what our satisfied customers have to say about our electronic accessories.",
    layout: "model1",
    navigationLabels: { previous: "Previous", next: "Next" },
    testimonials: [
      {
        name: "Robert Smith",
        role: "Customer from USA",
        text: "I always find something stylish and affordable on this web fashion site",
        rating: 5,
        heading: "Best Online Fashion Site",
        productName: "3-in-1 Wireless Charger with Official MagSafe Charging 15W",
        productPrice: "$105.95",
        productImage: "feature1",
        productLink: "#"
      },
      {
        name: "Allen Lyn",
        role: "Customer from France",
        text: "I love the variety of styles and the high-quality clothing on this web fashion site.",
        rating: 5,
        heading: "Great Selection and Quality",
        productName: "SoundForm Rise",
        productPrice: "$7.95",
        productImage: "feature2",
        productLink: "#"
      },
      {
        name: "Peter Rope",
        role: "Customer from USA",
        text: "I finally found a web fashion site with stylish and flattering options in my size.",
        rating: 5,
        heading: "Best Customer Service",
        productName: "UltraGlass 2 Treated Screen Protector for iPhone 15 Pro",
        productPrice: "From $18.95",
        productImage: "feature3",
        productLink: "#"
      }
    ]
  };
  
  // Check if section is disabled by admin
  if (testimonialSection.enabled === false) {
    return null;
  }

  const testimonials = testimonialSection.testimonials || [];
  const layout = testimonialSection.layout || 'model1';

  // Calculate dynamic count for visible items based on window width
  const getVisibleCount = () => {
    if (windowWidth < 768) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  const visibleCount = getVisibleCount();
  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const nextTestimonial = (): void => {
    if (layout === 'model2') {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    } else {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = (): void => {
    if (layout === 'model2') {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    } else {
      setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  // Render Model 2 (Happy Clients Layout)
  if (layout === 'model2') {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3" style={{ fontFamily: "'Outfit', 'Albert Sans', sans-serif", letterSpacing: '-0.02em' }}>
              {testimonialSection.title || "Happy Clients"}
            </h2>
            {testimonialSection.subtitle && (
              <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
                {testimonialSection.subtitle}
              </p>
            )}
          </div>

          {/* Cards & Carousel Wrapper */}
          <div className="relative w-full max-w-[1500px] mx-auto px-2 sm:px-14 flex items-center justify-center">
            {/* Left Button */}
            {maxIndex > 0 && (
              <button
                onClick={prevTestimonial}
                className="absolute left-0 sm:left-4 z-10 p-2.5 rounded-full bg-white shadow-md border border-gray-100 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 text-gray-600 hover:text-gray-900 focus:outline-none flex items-center justify-center"
                aria-label={testimonialSection.navigationLabels?.previous || "Previous"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Slider Container */}
            <div className="w-full overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out" 
                style={{ 
                  transform: `translate3d(-${currentIndex * (100 / visibleCount)}%, 0, 0)`,
                  transition: 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)'
                }}
              >
                {testimonials.map((testimonial, idx) => (
                  <div 
                    key={idx} 
                    className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3"
                  >
                    <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e8e8e8] flex flex-col justify-between h-full shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
                      {/* Top Content */}
                      <div>
                        {/* Green Star Rating */}
                        <div className="flex items-center gap-0.5 mb-3.5">
                          {[...Array(Number(testimonial.rating || 5))].map((_, i) => (
                            <svg
                              key={i}
                              className="w-4 h-4 text-[#54d175]"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                        </div>

                        {/* Heading */}
                        {testimonial.heading && (
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2.5" style={{ fontFamily: "'Outfit', 'Albert Sans', sans-serif" }}>
                            {testimonial.heading}
                          </h3>
                        )}

                        {/* Review text */}
                        <blockquote className="text-gray-600 text-sm sm:text-[14.5px] mb-6 leading-relaxed font-normal">
                          " {testimonial.text} "
                        </blockquote>
                      </div>

                      {/* Bottom Author & Product */}
                      <div>
                        {/* Author details */}
                        <div className="mb-4">
                          <div className="font-semibold text-gray-900 text-sm" style={{ fontFamily: "'Outfit', 'Albert Sans', sans-serif" }}>
                            {testimonial.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {testimonial.role}
                          </div>
                        </div>

                        {/* Product Section (if defined) */}
                        {testimonial.productName && (
                          <>
                            <div className="border-t border-[#f0f0f0] my-4"></div>
                            <a
                              href={testimonial.productLink || "#"}
                              className="flex items-center justify-between group hover:opacity-95 transition-all duration-200"
                            >
                              <div className="flex items-center min-w-0">
                                {testimonial.productImage && (
                                  <img
                                    src={getImageUrl(testimonial.productImage)}
                                    alt={testimonial.productName}
                                    className="w-12 h-12 object-contain mr-3.5 rounded bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-1 group-hover:underline">
                                    {testimonial.productName}
                                  </h4>
                                  {testimonial.productPrice && (
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5">
                                      {testimonial.productPrice}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {/* Top-Right Arrow Action Circle Button */}
                              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-gray-900 group-hover:border-gray-900 transition-all duration-200 flex-shrink-0 ml-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                                </svg>
                              </div>
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Button */}
            {maxIndex > 0 && (
              <button
                onClick={nextTestimonial}
                className="absolute right-0 sm:right-4 z-10 p-2.5 rounded-full bg-white shadow-md border border-gray-100 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 text-gray-600 hover:text-gray-900 focus:outline-none flex items-center justify-center"
                aria-label={testimonialSection.navigationLabels?.next || "Next"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Fallback to Model 1 (Classic Slider)
  const current: Testimonial = testimonials[currentTestimonial] || testimonials[0];

  return (
    <section className="py-2 sm:py-4 md:py-8 lg:py-12 xl:py-16 bg-gray-50">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        {/* Container with 3px extra at each end compared to divider width */}
        <div className="mx-auto testimonial-container">
          <div className="bg-[#35374a] rounded-md sm:rounded-lg md:rounded-lg lg:rounded-xl xl:rounded-xl shadow-lg sm:shadow-xl md:shadow-xl lg:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
            <div className="flex flex-col items-center justify-center min-h-[360px] sm:min-h-[400px] md:min-h-[360px] lg:min-h-[360px] xl:min-h-[400px]">
              {/* Testimonial Content */}
              <div className="flex flex-col justify-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl h-full w-full">
                {/* Quote Icon */}
                <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6 text-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-white/20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                </div>

                {/* Section Label */}
                <div 
                  className="uppercase tracking-widest text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base text-white/80 mb-2 sm:mb-3 md:mb-4 lg:mb-4 font-medium text-center"
                  style={{ fontFamily: "'Albert Sans', sans-serif" }}
                >
                  {testimonialSection.title}
                </div>

                {/* Star Rating */}
                <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 gap-0.5 sm:gap-1">
                  {current && current.rating && [...Array(current.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-[#FFA500]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text - Fixed height container */}
                <div className="min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] xl:min-h-[160px] flex items-center justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                  <blockquote 
                    className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-white font-medium leading-relaxed text-center"
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    "{current?.text || ''}"
                  </blockquote>
                </div>

                {/* Author Info - Fixed positioning */}
                <div className="mb-4 sm:mb-6 md:mb-7 lg:mb-8 text-center">
                  <div 
                    className="font-bold text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-white mb-1"
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    {current?.name || ''}
                  </div>
                  <div 
                    className="text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base text-white/60"
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    {current?.role || ''}
                  </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={prevTestimonial}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                    aria-label={testimonialSection.navigationLabels?.previous || "Previous testimonial"}
                    title={testimonialSection.navigationLabels?.previous || "Previous"}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={nextTestimonial}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                    aria-label={testimonialSection.navigationLabels?.next || "Next testimonial"}
                    title={testimonialSection.navigationLabels?.next || "Next"}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
