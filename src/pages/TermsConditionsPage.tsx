import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteConfigService from '../services/siteConfigService';

interface PolicySection {
  title: string;
  content: string;
}

interface TermsConditionsData {
  pageTitle: string;
  lastUpdated: string;
  introduction: string;
  sections: PolicySection[];
  contactInfo: {
    email: string;
    companyName: string;
  };
}

const defaultPolicyData: TermsConditionsData = {
  pageTitle: 'Terms and Conditions',
  lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  introduction: 'Please read these Terms and Conditions carefully before using our website and services. By accessing or using our platform, you agree to be bound by these terms.',
  sections: [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this website.'
    },
    {
      title: '2. Use of the Website',
      content: 'You may use our website for lawful purposes only. You must not use our website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website. You are prohibited from using the website to copy, store, host, transmit, send, use, publish or distribute any material which consists of malicious computer software.'
    },
    {
      title: '3. User Accounts',
      content: 'When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.'
    },
    {
      title: '4. Products and Services',
      content: 'All products and services displayed on our website are subject to availability. We reserve the right to discontinue any product or service at any time. Prices for products are subject to change without notice. We shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of any product or service.'
    },
    {
      title: '5. Orders and Payment',
      content: 'We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in the description or price of the product, or errors in your order. We may also require additional verification before accepting any order.'
    },
    {
      title: '6. Intellectual Property',
      content: 'The content on this website, including but not limited to text, graphics, logos, images, and software, is the property of our company and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission.'
    },
    {
      title: '7. Limitation of Liability',
      content: 'In no event shall our company, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.'
    },
    {
      title: '8. Indemnification',
      content: 'You agree to defend, indemnify, and hold harmless our company and its licensee and licensors, and their employees, contractors, agents, officers, and directors from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses arising from your use of and access to the service.'
    },
    {
      title: '9. Governing Law',
      content: 'These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is registered, without regard to its conflict of law provisions.'
    },
    {
      title: '10. Changes to Terms',
      content: 'We reserve the right to modify or replace these Terms at any time. It is your responsibility to check these Terms periodically for changes. Your continued use of the website following the posting of any changes constitutes acceptance of those changes.'
    }
  ],
  contactInfo: {
    email: 'legal@ecommerce.com',
    companyName: 'E-Commerce Store'
  }
};

const TermsConditionsPage: React.FC = () => {
  const [policyData, setPolicyData] = useState<TermsConditionsData>(defaultPolicyData);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const loadPolicyData = async () => {
      try {
        const data = await siteConfigService.getConfig('terms-conditions');
        if (data) {
          setPolicyData({ ...defaultPolicyData, ...data });
        }
      } catch (error) {
        // Using default terms and conditions data
      } finally {
        setIsLoading(false);
      }
    };

    loadPolicyData();
  }, []);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(policyData.sections.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading terms...</p>
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
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 leading-relaxed">
                {policyData.introduction}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Effective from: {policyData.lastUpdated}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Table of Contents</h2>
            <div className="flex gap-2">
              <button 
                onClick={expandAll}
                className="text-sm text-gray-600 hover:text-black transition-colors px-3 py-1 rounded-lg hover:bg-gray-200"
              >
                Expand All
              </button>
              <button 
                onClick={collapseAll}
                className="text-sm text-gray-600 hover:text-black transition-colors px-3 py-1 rounded-lg hover:bg-gray-200"
              >
                Collapse All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {policyData.sections.map((section, index) => (
              <button
                key={index}
                onClick={() => {
                  toggleSection(index);
                  document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="text-left text-sm text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                {section.title.replace(/^\d+\.\s*/, '')}
              </button>
            ))}
          </div>
        </div>

        {/* Policy Sections - Accordion Style */}
        <div className="space-y-4">
          {policyData.sections.map((section, index) => (
            <div 
              key={index}
              id={`section-${index}`}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3 text-left">
                  <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  {section.title.replace(/^\d+\.\s*/, '')}
                </h2>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.has(index) ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.has(index) && (
                <div className="px-5 pb-5 bg-white">
                  <p className="text-gray-600 leading-relaxed pl-11">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gray-900 text-white rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">Questions About Our Terms?</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions about these Terms and Conditions, please contact our legal department.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href={`mailto:${policyData.contactInfo.email}`}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Legal Team
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            © {new Date().getFullYear()} {policyData.contactInfo.companyName}. All rights reserved.
          </p>
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

export default TermsConditionsPage;
