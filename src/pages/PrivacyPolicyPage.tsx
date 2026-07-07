import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteConfigService from '../services/siteConfigService';

interface PolicySection {
  title: string;
  content: string;
}

interface PrivacyPolicyData {
  pageTitle: string;
  lastUpdated: string;
  introduction: string;
  sections: PolicySection[];
  contactInfo: {
    email: string;
    address: string;
  };
}

const defaultPolicyData: PrivacyPolicyData = {
  pageTitle: 'Privacy Policy',
  lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  introduction: 'Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.',
  sections: [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us for support. This includes: Personal information (name, email address, phone number, shipping address), Payment information (credit card numbers, billing address), Account credentials (username and password), Communication preferences and purchase history.'
    },
    {
      title: 'How We Use Your Information',
      content: 'We use the information we collect to: Process and fulfill your orders, Send you order confirmations and updates, Provide customer support and respond to inquiries, Send promotional communications (with your consent), Improve our website and services, Detect and prevent fraud, Comply with legal obligations.'
    },
    {
      title: 'Information Sharing',
      content: 'We may share your information with: Service providers who assist in our operations (payment processors, shipping carriers, marketing platforms), Business partners for joint marketing initiatives (with your consent), Legal authorities when required by law or to protect our rights, Affiliated companies within our corporate family. We do not sell your personal information to third parties.'
    },
    {
      title: 'Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie preferences through your browser settings. Types of cookies we use: Essential cookies (required for website functionality), Analytics cookies (help us understand how visitors use our site), Marketing cookies (used to deliver relevant advertisements).'
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments. However, no method of transmission over the Internet is 100% secure.'
    },
    {
      title: 'Your Rights',
      content: 'Depending on your location, you may have the right to: Access the personal information we hold about you, Request correction of inaccurate information, Request deletion of your personal information, Opt-out of marketing communications, Data portability (receive your data in a portable format), Withdraw consent where processing is based on consent.'
    },
    {
      title: 'Data Retention',
      content: 'We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. When we no longer need your information, we will securely delete or anonymize it.'
    },
    {
      title: 'Children\'s Privacy',
      content: 'Our website is not intended for children under the age of 13 (or 16 in some jurisdictions). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.'
    },
    {
      title: 'International Transfers',
      content: 'Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place to protect your information during such transfers.'
    },
    {
      title: 'Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.'
    }
  ],
  contactInfo: {
    email: 'privacy@ecommerce.com',
    address: '123 Commerce Street, Business City, BC 12345'
  }
};

const PrivacyPolicyPage: React.FC = () => {
  const [policyData, setPolicyData] = useState<PrivacyPolicyData>(defaultPolicyData);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  useEffect(() => {
    const loadPolicyData = async () => {
      try {
        const data = await siteConfigService.getConfig('privacy-policy');
        if (data) {
          setPolicyData({ ...defaultPolicyData, ...data });
        }
      } catch (error) {
        // Using default privacy policy data
      } finally {
        setIsLoading(false);
      }
    };

    loadPolicyData();
  }, []);

  // Track scroll for active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section-index]');
      let current = 0;
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200) {
          current = index;
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading privacy policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Header with gradient */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="text-center flex flex-col items-center justify-center" 
          style={{
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(254, 240, 239, 1) 50%, rgba(243, 251, 251, 1) 76%, rgba(254, 255, 255, 1) 98%)',
            height: '194px'
          }}
        >
          <h1 className="text-black" style={{ fontSize: '42px', fontWeight: 'normal' }}>
            {policyData.pageTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Last updated: {policyData.lastUpdated}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900">{policyData.pageTitle}</span>
        </nav>
      </div>

      {/* Content with Sidebar Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Quick Navigation
                </h3>
                <nav className="space-y-1">
                  {policyData.sections.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        document.getElementById(`privacy-section-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                        activeSection === index 
                          ? 'bg-black text-white' 
                          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Our Commitment to Your Privacy</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {policyData.introduction}
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-blue-900">Secure Data</p>
                <p className="text-xs text-blue-700">256-bit encryption</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-purple-900">No Data Sale</p>
                <p className="text-xs text-purple-700">We never sell your data</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-orange-900">Transparency</p>
                <p className="text-xs text-orange-700">Clear data practices</p>
              </div>
            </div>

            {/* Policy Sections */}
            <div className="space-y-8">
              {policyData.sections.map((section, index) => (
                <div 
                  key={index}
                  id={`privacy-section-${index}`}
                  data-section-index={index}
                  className="scroll-mt-24"
                >
                  <div className="flex items-start gap-4 p-6 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {section.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Privacy Questions?</h2>
                  <p className="text-gray-300">
                    Contact our privacy team for any concerns or data requests.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`mailto:${policyData.contactInfo.email}`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Privacy Team
                  </a>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
