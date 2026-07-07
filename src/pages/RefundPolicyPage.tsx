import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteConfigService from '../services/siteConfigService';

interface PolicySection {
  title: string;
  content: string;
}

interface RefundPolicyData {
  pageTitle: string;
  lastUpdated: string;
  introduction: string;
  sections: PolicySection[];
  contactInfo: {
    email: string;
    phone: string;
  };
}

const defaultPolicyData: RefundPolicyData = {
  pageTitle: 'Refund Policy',
  lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  introduction: 'We want you to be completely satisfied with your purchase. If you are not satisfied, we offer a comprehensive refund policy to ensure your peace of mind.',
  sections: [
    {
      title: '1. Eligibility for Refunds',
      content: 'Items must be returned within 30 days of the original purchase date. Products must be unused, in their original packaging, and in the same condition as when received. Proof of purchase (receipt or order confirmation) is required for all returns.'
    },
    {
      title: '2. Non-Refundable Items',
      content: 'The following items are not eligible for refunds: Gift cards, Downloadable software products, Items marked as "Final Sale" or "Non-Returnable", Personalized or custom-made products, Perishable goods.'
    },
    {
      title: '3. Refund Process',
      content: 'To initiate a refund, please contact our customer service team with your order number and reason for return. Once your return is approved, you will receive instructions on how to ship the item back. Refunds will be processed within 5-10 business days after we receive the returned item.'
    },
    {
      title: '4. Refund Methods',
      content: 'Refunds will be credited to the original payment method used for the purchase. Credit card refunds may take an additional 5-10 business days to appear on your statement, depending on your bank.'
    },
    {
      title: '5. Shipping Costs',
      content: 'Original shipping charges are non-refundable unless the return is due to our error (damaged, defective, or incorrect item). Customers are responsible for return shipping costs unless otherwise specified.'
    },
    {
      title: '6. Exchanges',
      content: 'If you wish to exchange an item for a different size, color, or product, please return the original item for a refund and place a new order for the desired item.'
    },
    {
      title: '7. Damaged or Defective Items',
      content: 'If you receive a damaged or defective item, please contact us within 48 hours of delivery. We will arrange for a replacement or full refund, including shipping costs.'
    }
  ],
  contactInfo: {
    email: 'support@ecommerce.com',
    phone: '(555) 123-4567'
  }
};

const RefundPolicyPage: React.FC = () => {
  const [policyData, setPolicyData] = useState<RefundPolicyData>(defaultPolicyData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPolicyData = async () => {
      try {
        const data = await siteConfigService.getConfig('refund-policy');
        if (data) {
          setPolicyData({ ...defaultPolicyData, ...data });
        }
      } catch (error) {
        // Using default refund policy data
      } finally {
        setIsLoading(false);
      }
    };

    loadPolicyData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading policy...</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900">{policyData.pageTitle}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {policyData.introduction}
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {policyData.sections.map((section, index) => (
            <div 
              key={index} 
              className="border-b border-gray-100 pb-8 last:border-b-0"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                {section.title.replace(/^\d+\.\s*/, '')}
              </h2>
              <p className="text-gray-600 leading-relaxed pl-11">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gray-50 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions About Our Refund Policy?</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about our refund policy, please don't hesitate to contact us.
          </p>
          <div className="flex flex-wrap gap-6">
            <a 
              href={`mailto:${policyData.contactInfo.email}`}
              className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span>{policyData.contactInfo.email}</span>
            </a>
            <a 
              href={`tel:${policyData.contactInfo.phone}`}
              className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span>{policyData.contactInfo.phone}</span>
            </a>
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
      </div>
    </div>
  );
};

export default RefundPolicyPage;
