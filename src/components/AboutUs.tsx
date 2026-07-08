import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface AboutUsData {
  heroTitle: string;
  storyTitle: string;
  storyParagraphs: string[];
  storyImage: string;
  missionTitle: string;
  missionText: string;
  valuesTitle: string;
  values: Value[];
  statsEnabled: boolean;
  stats: Stat[];
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  ctaButtonLink: string;
}

const iconMap: { [key: string]: React.ReactNode } = {
  quality: (
    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  customer: (
    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  innovation: (
    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
};

const DEFAULT_ABOUT_US: AboutUsData = {
  heroTitle: 'About Us',
  storyTitle: 'Our Story',
  storyParagraphs: [
    'Welcome to our store. We are dedicated to bringing you the finest quality products sourced from trusted suppliers around the world.',
    'Founded with a passion for quality, we take pride in offering products that meet the highest standards.'
  ],
  storyImage: '',
  missionTitle: 'Our Mission',
  missionText: 'To provide our customers with the best quality products at fair prices, with exceptional service every step of the way.',
  valuesTitle: 'Our Values',
  values: [
    { icon: 'quality', title: 'Premium Quality', description: 'We source only the finest products for our customers.' },
    { icon: 'customer', title: 'Customer First', description: 'Your satisfaction is our top priority in everything we do.' },
    { icon: 'innovation', title: 'Trust & Transparency', description: 'We build lasting relationships through honesty and fair practices.' }
  ],
  statsEnabled: false,
  stats: [],
  ctaTitle: 'Ready to Start Shopping?',
  ctaText: 'Explore our wide range of premium products.',
  ctaButtonText: 'Browse Products',
  ctaButtonLink: '/products'
};

const AboutUs: React.FC = () => {
  const [data, setData] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        console.log('Fetching About Us data from /api/aboutus...');
        const response = await fetch(`${API_BASE_URL}/aboutus`);
        const result = await response.json();
        console.log('About Us API response:', result);
        if (result.success) {
          setData(result.data);
        } else {
          console.error('About Us API returned error:', result.message);
          setData(DEFAULT_ABOUT_US);
        }
      } catch (error) {
        console.error('Error fetching about us:', error);
        setData(DEFAULT_ABOUT_US);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!data) {
    // This should not be reached since we always fall back to DEFAULT_ABOUT_US
    return null;
  }

  const resolveImage = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/images/')) return img;
    // Has leading slash but no /images/ prefix
    if (img.startsWith('/')) return `/images${img}`;
    // Bare filename
    return `/images/${img}`;
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center flex items-center justify-center" style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(254, 240, 239, 1) 50%, rgba(243, 251, 251, 1) 76%, rgba(254, 255, 255, 1) 98%)',
          height: 'clamp(120px, 15vw, 194px)'
        }}>
          <h1 className="text-black text-3xl sm:text-4xl lg:text-[42px] xl:text-5xl" style={{ fontWeight: 'normal', fontFamily: "'Albert Sans', sans-serif" }}>
            {data.heroTitle}
          </h1>
        </div>
      </div>

      {/* Container for content sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        
        {/* Our Story Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16 xl:mb-20">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6 lg:mb-8">{data.storyTitle}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-center">
            <div>
              {data.storyParagraphs.map((paragraph, index) => (
                <p key={index} className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed mb-3 sm:mb-4 lg:mb-5">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="bg-gray-100 rounded-lg lg:rounded-xl h-48 sm:h-64 lg:h-80 xl:h-96 flex items-center justify-center overflow-hidden">
              {data.storyImage ? (
                <img 
                  src={resolveImage(data.storyImage)} 
                  alt="Our Story" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p>Our Story Image</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mission Section */}
        {data.missionText && (
          <div className="mb-8 sm:mb-12 lg:mb-16 xl:mb-20 bg-gray-50 rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6 lg:mb-8 text-center">{data.missionTitle}</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed text-center max-w-3xl lg:max-w-4xl mx-auto">
              {data.missionText}
            </p>
          </div>
        )}

        {/* Values Section */}
        {data.values && data.values.length > 0 && (
          <div className="mb-8 sm:mb-12 lg:mb-16 xl:mb-20">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6 sm:mb-8 lg:mb-10 xl:mb-12 text-center">{data.valuesTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
              {data.values.map((value, index) => (
                <div key={index} className="text-center p-4 sm:p-6 lg:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-5">
                    {iconMap[value.icon] || iconMap['quality']}
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black mb-2 sm:mb-3 lg:mb-4">{value.title}</h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section */}
        {data.statsEnabled && data.stats && data.stats.length > 0 && (
          <div className="bg-black rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 text-center">
              {data.stats.map((stat, index) => (
                <div key={index}>
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-1 sm:mb-2 lg:mb-3">{stat.value}</p>
                  <p className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        {data.ctaTitle && (
          <div className="mt-8 sm:mt-12 lg:mt-16 xl:mt-20 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4 lg:mb-6">{data.ctaTitle}</h2>
            {data.ctaText && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 lg:mb-10 max-w-2xl lg:max-w-3xl mx-auto px-4">
                {data.ctaText}
              </p>
            )}
            <a 
              href={data.ctaButtonLink || '/shop'} 
              className="inline-block bg-black text-white py-3 px-6 sm:py-4 sm:px-8 lg:py-5 lg:px-10 rounded-lg lg:rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200 text-base sm:text-lg lg:text-xl"
            >
              {data.ctaButtonText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUs;
