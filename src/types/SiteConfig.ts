// Site configuration types
export interface Logo {
  light: string;
  dark: string;
  alt: string;
}

export interface Branding {
  name: string;
  tagline: string;
  logo: Logo;
  favicon: string;
}

export interface AnnouncementBar {
  isActive: boolean;
  announcements: string[];
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
  title: string;
  collections: Collection[];
}

export interface Testimonial {
  name: string;
  role: string;
  rating: number;
  text: string;
  image?: string;
}

export interface TestimonialSection {
  title: string;
  testimonials: Testimonial[];
  navigationLabels: {
    previous: string;
    next: string;
  };
}

export interface HotDealsSection {
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
  featuresSection: FeaturesSection;
  featuredCollections: FeaturedCollections;
  hotDealsSection: HotDealsSection;
  testimonialSection: TestimonialSection;
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
  announcementBar: AnnouncementBar;
  hero: Hero;
  homePage: HomePage;
  contactUs: ContactUs;
  [key: string]: any; // For other config properties
}
