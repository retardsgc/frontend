import React, { useState, useEffect } from "react";
import siteConfigService from '../services/siteConfigService';
import type { FeaturesSection, FeatureItem } from '../types';
import * as Icons from 'lucide-react';

const ServiceFeaturesSection: React.FC = () => {
  const [featuresSection, setFeaturesSection] = useState<FeaturesSection | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturesSection = async () => {
      try {
        const homepage = await siteConfigService.getHomepage();
        
        if (homepage?.featuresSection) {
          setFeaturesSection(homepage.featuresSection);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    
    loadFeaturesSection();
  }, []);

  if (loading) {
    return null;
  }

  if (!featuresSection) {
    return null;
  }

  if (featuresSection.enabled === false) {
    return null;
  }

  const features: FeatureItem[] = featuresSection.features || [];
  
  // Reorder features for mobile: put 24/7 Support (Headphones icon) first
  const mobileFeatures: FeatureItem[] = [...features].sort((a, b) => {
    if (a.icon === 'Headphones') return -1;
    if (b.icon === 'Headphones') return 1;
    return 0;
  });

  // Render icon dynamically from Lucide
  const renderIcon = (iconName: string, className: string = "w-10 h-10") => {
    const IconComponent = Icons[iconName as keyof typeof Icons];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    // Fallback if icon not found
    return <Icons.HelpCircle className={className} />;
  };

  return (
    <section className="w-full py-3 sm:py-6 md:py-8 bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header removed intentionally */}

        {/* Mobile Carousel View */}
        <div className="block sm:hidden">
          {/* Current Feature Card */}
          <div className="flex flex-col items-center text-center px-4 py-2">
            {/* Icon */}
            <div className="bg-gray-100 rounded-full flex items-center justify-center w-14 h-14 mb-2">
              <div className="text-black">
                {renderIcon(mobileFeatures[currentSlide]?.icon)}
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-base font-semibold text-black mb-1.5 leading-tight" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              {mobileFeatures[currentSlide]?.title || 'Feature'}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-black leading-relaxed" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              {mobileFeatures[currentSlide]?.description || 'Feature description'}
            </p>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-2">
            {mobileFeatures.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="bg-gray-100 rounded-full flex items-center justify-center w-16 h-16 mb-4">
                <div className="text-black">
                  {renderIcon(feature.icon)}
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceFeaturesSection;
