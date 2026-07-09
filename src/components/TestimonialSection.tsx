import React, { useState, useEffect, useRef } from 'react';
import siteConfigService from '../services/siteConfigService';
import type { TestimonialSection as TestimonialSectionType } from '../types';
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

// ── Model 2: Happy Clients Grid ─────────────────────────────────────────────
const HappyClientsModel: React.FC<{ testimonialSection: TestimonialSectionType }> = ({ testimonialSection }) => {
  const testimonials = testimonialSection.testimonials || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 768) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  const next = () => setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  const prev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  const translatePercent = currentIndex * (100 / visibleCount);

  return (
    /* NOTE: No overflow-hidden on the section — nav buttons must be visible outside */
    <section className="py-12 sm:py-16 lg:py-20 bg-[#f7f7f7]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2
            className="text-[2.6rem] sm:text-[3.2rem] lg:text-[3.8rem] font-normal text-gray-900 mb-3 leading-none font-albert"
            style={{ fontFamily: "'Albert Sans', sans-serif", letterSpacing: '-0.02em' }}
          >
            {testimonialSection.title || 'Happy Clients'}
          </h2>
          {(testimonialSection as any).subtitle && (
            <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed mt-2">
              {(testimonialSection as any).subtitle}
            </p>
          )}
        </div>

        {/* Slider outer: extra px for nav button space. No overflow-hidden here! */}
        <div className="relative px-8 sm:px-10">

          {/* ← Left Arrow — always visible, dimmed when at start */}
          <button
            onClick={prev}
            aria-label={testimonialSection.navigationLabels?.previous || 'Previous'}
            className={`
              absolute left-0 sm:-left-1 top-1/2 -translate-y-1/2 z-20
              w-9 h-9 rounded-full border bg-white
              flex items-center justify-center
              shadow-sm transition-all duration-200
              ${canPrev
                ? 'border-gray-300 text-gray-700 hover:border-gray-500 hover:shadow cursor-pointer'
                : 'border-gray-200 text-gray-300 cursor-not-allowed'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Cards overflow-hidden ONLY on the inner slider track */}
          <div className="overflow-hidden" ref={containerRef}>
            <div
              className="flex"
              style={{
                transform: `translate3d(-${translatePercent}%, 0, 0)`,
                transition: 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  style={{ width: `${100 / visibleCount}%` }}
                  className="flex-shrink-0 px-2.5"
                >
                  {/* ─── Card ─── */}
                  <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full">

                    {/* Card body: stars → heading → review text */}
                    <div className="px-6 pt-6 pb-5 flex-1 flex flex-col">
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(Math.min(Math.max(Number(testimonial.rating) || 5, 1), 5))].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-[#54d175]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>

                      {/* Heading */}
                      {testimonial.heading && (
                        <h3
                          className="font-semibold text-gray-900 text-[15px] mb-2.5 leading-snug font-albert"
                          style={{ fontFamily: "'Albert Sans', sans-serif" }}
                        >
                          {testimonial.heading}
                        </h3>
                      )}

                      {/* Review quote */}
                      <p className="text-gray-600 text-[13.5px] leading-relaxed flex-1">
                        &#8220; {testimonial.text} &#8221;
                      </p>
                    </div>

                    {/* ── Divider 1 ── */}
                    <div className="mx-6 border-t border-gray-100" />

                    {/* Author */}
                    <div className="px-6 py-4">
                      <p
                        className="text-sm font-semibold text-gray-900 leading-none mb-1 font-albert"
                        style={{ fontFamily: "'Albert Sans', sans-serif" }}
                      >
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>

                    {/* ── Divider 2 + Product row ── */}
                    {testimonial.productName && (
                      <>
                        <div className="mx-6 border-t border-gray-100" />
                        <div className="px-6 py-4">
                          <a
                            href={testimonial.productLink || '#'}
                            className="flex items-center gap-3 group"
                          >
                            {/* Product thumbnail */}
                            {testimonial.productImage ? (
                              <img
                                src={getImageUrl(testimonial.productImage)}
                                alt={testimonial.productName}
                                className="w-12 h-12 object-contain rounded bg-gray-50 border border-gray-100 flex-shrink-0 p-0.5"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              /* Placeholder box when no image */
                              <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}

                            {/* Name + price */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-blue-600 group-hover:underline line-clamp-2 leading-snug">
                                {testimonial.productName}
                              </p>
                              {testimonial.productPrice && (
                                <p className="text-[13px] font-semibold text-gray-900 mt-0.5">
                                  {testimonial.productPrice}
                                </p>
                              )}
                            </div>

                            {/* ↗ Arrow circle button */}
                            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 group-hover:border-gray-700 group-hover:bg-gray-50 transition-all duration-200">
                              <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                              </svg>
                            </div>
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* → Right Arrow — always visible, dimmed when at end */}
          <button
            onClick={next}
            aria-label={testimonialSection.navigationLabels?.next || 'Next'}
            className={`
              absolute right-0 sm:-right-1 top-1/2 -translate-y-1/2 z-20
              w-9 h-9 rounded-full border bg-white
              flex items-center justify-center
              shadow-sm transition-all duration-200
              ${canNext
                ? 'border-gray-300 text-gray-700 hover:border-gray-500 hover:shadow cursor-pointer'
                : 'border-gray-200 text-gray-300 cursor-not-allowed'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

        </div>
      </div>
    </section>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const TestimonialSection: React.FC = () => {
  const [config, setConfig] = useState<any | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);

  const FALLBACK_TESTIMONIALS = [
    {
      name: 'Robert Smith',
      role: 'Customer from USA',
      text: 'I always find something stylish and affordable on this web fashion site.',
      rating: 5,
      heading: 'Best Online Fashion Site',
      productName: '3-in-1 Wireless Charger',
      productPrice: '$105.95',
      productImage: '/images/three-device-wireless-charger.png',
      productLink: '/products',
    },
    {
      name: 'Allen Lyn',
      role: 'Customer from France',
      text: 'I love the variety of styles and the high-quality clothing on this web fashion site.',
      rating: 5,
      heading: 'Great Selection and Quality',
      productName: 'Wireless Earbuds Pro',
      productPrice: '$129.99',
      productImage: '/images/wireless-white-beats-earbuds.png',
      productLink: '/products',
    },
    {
      name: 'Peter Rope',
      role: 'Customer from USA',
      text: 'I finally found a web fashion site with stylish and flattering options in my size.',
      rating: 5,
      heading: 'Best Customer Service',
      productName: 'Phone Case',
      productPrice: '$24.99',
      productImage: '/images/phone-case.png',
      productLink: '/products',
    },
    {
      name: 'Hellen Ase',
      role: 'Customer from Japan',
      text: 'Amazing products every time. The quality never disappoints and shipping is fast.',
      rating: 5,
      heading: 'Consistently Great Quality',
      productName: 'Red Beats AirPods',
      productPrice: '$159.99',
      productImage: '/images/red-beats-airpods.png',
      productLink: '/products',
    },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const homepageConfig = await siteConfigService.getHomepage();
        setConfig(homepageConfig);
      } catch {
        setConfig({
          testimonialSection: {
            title: 'Happy Clients',
            subtitle: 'See what our satisfied customers have to say about our electronic accessories.',
            layout: 'model2',
            navigationLabels: { previous: 'Previous', next: 'Next' },
            testimonials: FALLBACK_TESTIMONIALS,
          },
        });
      }
    };
    load();
  }, []);

  if (!config) return null;

  const testimonialSection: TestimonialSectionType = config.testimonialSection || {
    title: 'Happy Clients',
    subtitle: 'See what our satisfied customers have to say about our electronic accessories.',
    layout: 'model2',
    navigationLabels: { previous: 'Previous', next: 'Next' },
    testimonials: FALLBACK_TESTIMONIALS,
  };

  if (testimonialSection.enabled === false) return null;

  const layout = (testimonialSection as any).layout || 'model1';

  // ── Model 2 ─────────────────────────────────────────────────────────────
  if (layout === 'model2') {
    return <HappyClientsModel testimonialSection={testimonialSection} />;
  }

  // ── Model 1: Classic dark slider ─────────────────────────────────────────
  const testimonials = testimonialSection.testimonials || [];
  const current: Testimonial = testimonials[currentTestimonial] || testimonials[0];

  const nextSlide = () => setCurrentTestimonial(p => (p + 1) % testimonials.length);
  const prevSlide = () => setCurrentTestimonial(p => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-2 sm:py-4 md:py-8 lg:py-12 xl:py-16 bg-gray-50">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto testimonial-container">
          <div className="bg-[#35374a] rounded-md sm:rounded-lg md:rounded-lg lg:rounded-xl xl:rounded-xl shadow-lg sm:shadow-xl lg:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
            <div className="flex flex-col items-center justify-center min-h-[360px] sm:min-h-[400px]">
              <div className="flex flex-col justify-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl h-full w-full">
                <div className="mb-3 sm:mb-4 md:mb-6 text-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-white/20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                  </svg>
                </div>

                <div className="uppercase tracking-widest text-xs sm:text-sm text-white/80 mb-2 sm:mb-4 font-medium text-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                  {testimonialSection.title}
                </div>

                <div className="flex items-center justify-center mb-3 sm:mb-6 gap-0.5 sm:gap-1">
                  {current?.rating && [...Array(current.rating)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 text-[#FFA500]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                <div className="min-h-[80px] sm:min-h-[120px] lg:min-h-[140px] xl:min-h-[160px] flex items-center justify-center mb-3 sm:mb-6">
                  <blockquote className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-white font-medium leading-relaxed text-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                    &#8220;{current?.text || ''}&#8221;
                  </blockquote>
                </div>

                <div className="mb-4 sm:mb-8 text-center">
                  <div className="font-bold text-sm sm:text-base md:text-lg xl:text-xl text-white mb-1" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                    {current?.name || ''}
                  </div>
                  <div className="text-xs sm:text-sm text-white/60" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                    {current?.role || ''}
                  </div>
                </div>

                <div className="flex justify-center items-center gap-4">
                  <button onClick={prevSlide} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200" aria-label="Previous">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={nextSlide} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200" aria-label="Next">
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
