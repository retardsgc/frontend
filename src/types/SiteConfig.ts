// Site configuration types
export interface Logo {
  url: string;
  alt: string;
}

export interface Branding {
  logo: Logo;
  faviconUrl: string;
}

export interface AnnouncementBar {
  enabled: boolean;
  announcements: string[];
  backgroundColor?: string;
  textColor?: string;
}

export interface HeroSlide {
  id: number;
  heading: string;
  subheading: string;
  button: string;
  buttonLink: string;
  image: string;
}

export interface Hero {
  slides: HeroSlide[];
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  image?: string;
}

export interface FeaturesSection {
  enabled?: boolean;
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

export interface Collection {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  gradient: string;
}

export interface FeaturedCollections {
  enabled?: boolean;
  title: string;
  collections: Collection[];
}

export interface Testimonial {
  name: string;
  role: string;
  rating: number;
  text: string;
  image?: string;
  heading?: string;
  productImage?: string;
  productName?: string;
  productPrice?: string;
  productLink?: string;
}

export interface TestimonialSection {
  enabled?: boolean;
  layout?: 'model1' | 'model2';
  title: string;
  subtitle?: string;
  testimonials: Testimonial[];
  navigationLabels: {
    previous: string;
    next: string;
  };
}

export interface HotDealsSection {
  enabled?: boolean;
  title: string;
  subtitle: string;
  viewAllText: string;
  viewAllLink: string;
  dealBadge: string;
  originalPriceLabel: string;
  currentPriceLabel: string;
  buttonText: string;
}

export interface HomePage {
  featuresSection?: FeaturesSection;
  featuredCollections?: FeaturedCollections;
  hotDealsSection?: HotDealsSection;
  testimonialSection?: TestimonialSection;
}

export interface SocialMediaLink {
  name: string;
  url: string;
  icon: string;
}

export interface ContactUs {
  pageTitle: string;
  sectionTitle: string;
  formTitle: string;
  formDescription: string;
  address: string;
  phone: string;
  email: string;
  businessHoursTitle: string;
  businessHours: string;
  socialMedia: SocialMediaLink[];
}

export interface SiteConfig {
  branding: Branding;
  announcementbar: AnnouncementBar;
  hero: Hero;
  homepage: HomePage;
  contactUs: ContactUs;
  [key: string]: any; // For other config properties
}
