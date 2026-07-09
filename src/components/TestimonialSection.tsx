import React, { useState, useEffect } from 'react';
import siteConfigService from '../services/siteConfigService';
import type { SiteConfig, TestimonialSection as TestimonialSectionType } from '../types';

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
}

const TestimonialSection: React.FC = () => {
  const [config, setConfig] = useState<any | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);

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
            navigationLabels: { previous: "Previous", next: "Next" },
            testimonials: [
              {
                name: "John Doe",
                role: "Customer",
                text: "Great service and fast delivery!",
                rating: 5
              },
              {
                name: "Jane Smith",
                role: "Customer",
                text: "Excellent quality products.",
                rating: 5
              },
              {
                name: "Mike Johnson",
                role: "Customer",
                text: "Highly recommended!",
                rating: 5
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
    navigationLabels: { previous: "Previous", next: "Next" },
    testimonials: [
      {
        name: "John Doe",
        role: "Customer",
        text: "Great service and fast delivery!",
        rating: 5
      },
      {
        name: "Jane Smith",
        role: "Customer",
        text: "Excellent quality products.",
        rating: 5
      },
      {
        name: "Mike Johnson",
        role: "Customer",
        text: "Highly recommended!",
        rating: 5
      }
    ]
  };
  
  // Check if section is disabled by admin
  if (testimonialSection.enabled === false) {
    return null;
  }

  const testimonials = testimonialSection.testimonials || [];

  const nextTestimonial = (): void => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = (): void => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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
