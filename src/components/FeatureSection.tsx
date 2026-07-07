import React, { useEffect, useState } from "react";
import { getSiteConfig } from '../services/dataService';
import type { SiteConfig, FeaturesSection } from '../types';

export default function FeatureSection(): React.ReactElement {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const siteConfig = await getSiteConfig();
        setConfig(siteConfig);
      } catch (error) {
        // Set fallback config on error
        setConfig({
          homePage: {
            featuresSection: {
              title: "Featured Collections",
              subtitle: "Discover our latest collections",
              enabled: true,
              features: [
                {
                  icon: "feature1",
                  title: "Electronics",
                  description: "Latest gadgets and technology",
                  image: "/images/IMAGE_11.png"
                },
                {
                  icon: "feature2",
                  title: "Fashion",
                  description: "Trendy clothing and accessories",
                  image: "/images/IMAGE_11.png"
                },
                {
                  icon: "feature3",
                  title: "Home & Living",
                  description: "Comfort and style for your home",
                  image: "/images/IMAGE_11.png"
                }
              ]
            }
          }
        } as SiteConfig);
      }
    };

    loadSiteConfig();
  }, []);

  if (!config) return <div>Loading...</div>;

  // Get featuresSection from config with fallback
  const featuresSection: FeaturesSection = config.homePage?.featuresSection || {
    title: "Featured Collections",
    subtitle: "Discover our latest collections",
    enabled: true,
    features: [
      {
        icon: "feature1",
        title: "Electronics",
        description: "Latest gadgets and technology",
        image: "/images/IMAGE_11.png"
      },
      {
        icon: "feature2",
        title: "Fashion",
        description: "Trendy clothing and accessories",
        image: "/images/IMAGE_11.png"
      },
      {
        icon: "feature3",
        title: "Home & Living",
        description: "Comfort and style for your home",
        image: "/images/IMAGE_11.png"
      }
    ]
  };

  // Check if section is disabled by admin
  if (featuresSection.enabled === false) {
    return null;
  }

  return (
    <section className="pt-8 pb-20 bg-white">
      <div className="max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Section Header - Only show if admin has configured title/subtitle */}
        {(featuresSection.title || featuresSection.subtitle) && (
          <div className="text-center mb-12">
            {featuresSection.title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {featuresSection.title}
              </h2>
            )}
            {featuresSection.subtitle && (
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                {featuresSection.subtitle}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {(featuresSection.features || []).slice(0, 3).map((feature, idx) => (
            <div
              key={idx}
              className="flex-1 relative rounded-sm overflow-hidden shadow-xl flex items-end min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] bg-center bg-cover group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              style={{
                backgroundImage: `url(${
                  feature.image
                    ? (feature.image.startsWith('/siteconfig-api/') || feature.image.startsWith('http')
                        ? feature.image
                        : `/siteconfig-api/images/${feature.image}`)
                    : '/images/IMAGE_11.png'
                })`,
                fontFamily: "'Albert Sans', sans-serif",
              }}
            >
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 p-8 sm:p-10 lg:p-12 w-full flex flex-col items-start">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2 leading-tight drop-shadow-lg">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 sm:mb-8 drop-shadow">
                  {feature.description}
                </p>
                
                {/* Shop Now Button */}
                <button className="group inline-flex items-center bg-white hover:bg-gray-50 text-black px-6 sm:px-7 py-3 sm:py-4 rounded-sm text-sm sm:text-base lg:text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  Shop now
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="ml-2 transition-transform group-hover:translate-x-1"
                  >
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}