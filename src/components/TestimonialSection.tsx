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
  const [startIndex, setStartIndex] = useState<number>(0);

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

  const nextTestimonial = (): void => {
    if (layout === 'model2') {
      setStartIndex((prev) => (prev + 1) % testimonials.length);
    } else {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = (): void => {
    if (layout === 'model2') {
      setStartIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    } else {
      setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  // Render Model 2 (Happy Clients Layout)
  if (layout === 'model2') {
    const getVisibleIndices = () => {
      if (testimonials.length === 0) return [];
      if (testimonials.length === 1) return [0];
      if (testimonials.length === 2) return [0, 1];
      
      return [
        startIndex % testimonials.length,
        (startIndex + 1) % testimonials.length,
        (startIndex + 2) % testimonials.length
      ];
    };

    const visibleIndices = getVisibleIndices();

    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              {testimonialSection.title || "Happy Clients"}
            </h2>
            {testimonialSection.subtitle && (
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {testimonialSection.subtitle}
              </p>
            )}
          </div>

          {/* Cards & Carousel Wrapper */}
          <div className="relative flex items-center justify-between w-full max-w-[1600px] mx-auto px-2 sm:px-12">
            {/* Left Button */}
            {testimonials.length > 1 && (
              <button
                onClick={prevTestimonial}
                className="absolute left-0 sm:left-2 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-100 hover:bg-gray-50 transition-all duration-200 text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-label={testimonialSection.navigationLabels?.previous || "Previous"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-6 sm:px-8">
              {visibleIndices.map((origIndex, idx) => {
                const testimonial = testimonials[origIndex];
                if (!testimonial) return null;
                
                // Hide second card on mobile, third card on mobile and tablet
                const visibilityClass = idx === 0 
                  ? "block w-full" 
                  : idx === 1 
                    ? "hidden md:block w-full" 
                    : "hidden lg:block w-full";

                return (
                  <div
                    key={`${origIndex}-${idx}`}
                    className={`${visibilityClass} bg-white rounded-xl p-6 sm:p-8 border border-gray-100 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow duration-300`}
                  >
                    {/* Top Content */}
                    <div>
                      {/* Green Star Rating */}
                      <div className="flex items-center gap-1 mb-4">
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
                        <h3 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                          {testimonial.heading}
                        </h3>
                      )}

                      {/* Review text */}
                      <blockquote className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
                        " {testimonial.text} "
                      </blockquote>
                    </div>

                    {/* Bottom Author & Product */}
                    <div>
                      {/* Author details */}
                      <div className="mb-5">
                        <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {testimonial.role}
                        </div>
                      </div>

                      {/* Product Section (if defined) */}
                      {testimonial.productName && (
                        <>
                          <div className="border-t border-gray-100 my-5"></div>
                          <a
                            href={testimonial.productLink || "#"}
                            className="flex items-center hover:opacity-95 transition-opacity duration-200"
                          >
                            {testimonial.productImage && (
                              <img
                                src={getImageUrl(testimonial.productImage)}
                                alt={testimonial.productName}
                                className="w-14 h-14 object-contain mr-4 rounded bg-gray-50 p-1 flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 hover:underline">
                                {testimonial.productName}
                              </h4>
                              {testimonial.productPrice && (
                                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                                  {testimonial.productPrice}
                                </p>
                              )}
                            </div>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Button */}
            {testimonials.length > 1 && (
              <button
                onClick={nextTestimonial}
                className="absolute right-0 sm:right-2 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-100 hover:bg-gray-50 transition-all duration-200 text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-label={testimonialSection.navigationLabels?.next || "Next"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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
