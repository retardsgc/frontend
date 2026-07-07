import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Policy tabs
type PolicyTab = 'refund' | 'terms' | 'privacy';

interface PolicySection {
  title: string;
  content: string;
}

// Default data for each policy
const refundPolicyData = {
  pageTitle: 'Refund Policy',
  introduction: 'We are committed to ensuring your satisfaction with every purchase. This Refund Policy outlines the conditions under which refunds are granted, the process for requesting a refund, and the timelines involved. Please read this policy carefully before making a purchase.',
  sections: [
    {
      title: '1. Introduction',
      content: 'This Refund Policy applies to all purchases made through our website. By completing a purchase, you acknowledge that you have read and agreed to the terms of this policy. We reserve the right to modify this policy at any time, and changes will be effective immediately upon posting to the website. It is your responsibility to review this policy periodically.'
    },
    {
      title: '2. Eligibility for Refunds',
      content: 'A refund request may be considered under the following conditions: (a) The item received is damaged, defective, or significantly different from what was described at the time of purchase. (b) The order was not delivered within the estimated delivery window due to a fault on our end. (c) A duplicate charge was made for the same order. (d) The request is submitted within the eligible refund window from the date of delivery. All refund requests must include valid proof of purchase and clear documentation or description of the issue.'
    },
    {
      title: '3. Non-Refundable Cases',
      content: 'Refunds will not be issued in the following circumstances: (a) The buyer changed their mind after the order was dispatched. (b) The item was purchased during a final sale, clearance, or marked as non-returnable at the time of purchase. (c) The product was damaged due to misuse, negligence, improper handling, or normal wear and tear after delivery. (d) The refund request is submitted beyond the eligible time window. (e) Digital goods, downloadable content, or consumable products that have already been accessed or used. (f) Gift cards or store credit vouchers.'
    },
    {
      title: '4. Refund Process Overview',
      content: 'To initiate a refund, please contact our support team through the official contact page on our website. Include your order reference number, a description of the issue, and any supporting evidence such as photographs where applicable. Our team will review your request and respond within a reasonable timeframe. If approved, you will receive instructions on how to proceed. Items that need to be returned must be sent back in their original condition and packaging. We do not accept returns on items that have been altered, used, or are missing original components.'
    },
    {
      title: '5. Processing Time',
      content: 'Once a refund request is approved and any required return is received and inspected, the refund will be processed within 7 to 14 business days. Refunds will be credited to the original payment method used during the purchase. Please note that the time taken for the refund to reflect in your account may vary depending on your bank or payment provider and is beyond our control. We will notify you via the contact information provided when the refund has been initiated on our end.'
    },
    {
      title: '6. Changes to This Policy',
      content: 'We reserve the right to update or revise this Refund Policy at any time without prior notice. The revised policy will be effective from the date it is published on the website. Continued use of our website and services after any changes constitutes your acceptance of the updated policy. We encourage you to review this page regularly to stay informed of any updates.'
    }
  ]
};

const termsConditionsData = {
  pageTitle: 'Terms & Conditions',
  introduction: 'These Terms and Conditions govern your access to and use of our website and the services offered through it. By visiting, browsing, or making a purchase on this website, you agree to be legally bound by these terms. If you do not agree with any part of these terms, please discontinue use of the website immediately.',
  sections: [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using this website, you confirm that you are at least 18 years of age, or that you are accessing the site under the supervision of a parent or legal guardian. You agree to comply with all applicable laws and regulations in connection with your use of this website. These Terms and Conditions constitute a legally binding agreement between you and this website. Your continued use of the site after any amendments are posted will be deemed as your acceptance of the revised terms.'
    },
    {
      title: '2. Use of Website',
      content: 'This website and its content are provided for personal, non-commercial use only. You may browse, view, and interact with the site for lawful purposes. You may not copy, reproduce, distribute, transmit, display, sell, license, or otherwise exploit any content from this website without prior written authorization. We reserve the right to restrict or terminate access to any part of the website at our discretion, at any time, and without notice.'
    },
    {
      title: '3. User Responsibilities',
      content: 'You are solely responsible for your use of the website and any content you submit, post, or otherwise provide through the site. You agree to provide accurate, current, and complete information when creating an account or placing an order. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately if you suspect any unauthorized use of your account.'
    },
    {
      title: '4. Prohibited Activities',
      content: 'You agree not to engage in any of the following activities while using this website: (a) Using the website for any unlawful, harmful, or fraudulent purpose. (b) Attempting to gain unauthorized access to any part of the website, its servers, or any connected systems. (c) Introducing viruses, malware, or any other harmful code or material. (d) Collecting or harvesting any personally identifiable information from the website. (e) Impersonating any person or entity or misrepresenting your affiliation with any person or entity. (f) Engaging in any conduct that restricts or inhibits any other user from using or enjoying the website. (g) Using automated tools, bots, or scraping technologies to access or collect data from the website without written permission.'
    },
    {
      title: '5. Limitation of Liability',
      content: 'To the fullest extent permitted by applicable law, this website and its operators shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from your use of, or inability to use, the website or any of its content, products, or services. This includes, but is not limited to, damages for loss of profits, data, goodwill, or other intangible losses. The website is provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.'
    },
    {
      title: '6. Changes to Terms',
      content: 'We reserve the right to modify these Terms and Conditions at any time. Changes will become effective immediately upon being posted to the website. It is your responsibility to review these terms periodically. Your continued use of the website after changes are posted constitutes your acceptance of the modified terms. If you disagree with the revised terms, your sole remedy is to discontinue using the website.'
    },
    {
      title: '7. Governing Principles',
      content: 'These Terms and Conditions shall be governed by and construed in accordance with fair and generally accepted legal principles, without regard to any specific jurisdiction\'s conflict of law provisions. Any disputes arising in connection with these terms or your use of the website shall be resolved through good-faith negotiation in the first instance. If a resolution cannot be reached through negotiation, the matter shall be subject to binding arbitration or resolved through appropriate legal channels as required. The invalidity of any provision of these terms shall not affect the validity of the remaining provisions.'
    }
  ]
};

const privacyPolicyData = {
  pageTitle: 'Privacy Policy',
  introduction: 'Your privacy is of the utmost importance to us. This Privacy Policy describes how we collect, use, store, and protect information when you visit our website or interact with our services. By using this website, you consent to the practices described in this policy. Please take the time to read it carefully.',
  sections: [
    {
      title: '1. Introduction',
      content: 'This Privacy Policy applies to all users of this website. We are committed to handling your personal information responsibly and transparently. This policy explains what data we collect, why we collect it, how it is used, and the rights you have in relation to your data. We comply with applicable data protection principles and strive to ensure that your information is used only in ways that are fair, lawful, and necessary.'
    },
    {
      title: '2. Information We Collect',
      content: 'We may collect the following categories of information: (a) Personal identification information, such as your name, delivery address, and contact details, when you register an account or place an order. (b) Transaction information, including products purchased, order values, and payment method type (we do not store full card details). (c) Technical data, such as your IP address, browser type, device information, and pages visited, collected automatically when you use our website. (d) Communication data, including any messages or enquiries you send to us. We collect only what is necessary for the purposes described in this policy.'
    },
    {
      title: '3. How We Use Information',
      content: 'The information we collect is used to: (a) Process and fulfil your orders, including arranging delivery and sending order confirmations. (b) Provide customer support and respond to your enquiries or complaints. (c) Improve the functionality, performance, and content of our website. (d) Send you transactional communications related to your orders or account. (e) Send promotional or marketing messages where you have given your explicit consent, with an option to withdraw consent at any time. (f) Detect and prevent fraudulent activity and ensure the security of our services. We do not use your information for any purposes that are incompatible with those stated above without first obtaining your consent.'
    },
    {
      title: '4. Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small text files stored on your device that help us recognise you on subsequent visits, remember your preferences, and analyse how our website is used. We use the following types of cookies: (a) Essential cookies, which are necessary for the website to function correctly. (b) Analytical cookies, which help us understand how visitors interact with the website so we can improve it. (c) Marketing cookies, which may be used to display relevant content or advertisements. You can control or disable cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of the website.'
    },
    {
      title: '5. Data Protection',
      content: 'We take the security of your personal information seriously and implement a range of technical and organisational measures to protect it from unauthorised access, loss, misuse, or disclosure. These measures include secure data transmission protocols, access controls, and regular security reviews. However, no method of transmission over the internet or electronic storage is completely secure. While we strive to protect your information, we cannot guarantee its absolute security. You are responsible for keeping your account credentials confidential and for notifying us promptly if you believe your account has been compromised.'
    },
    {
      title: '6. Third-Party Services',
      content: 'We may share your information with trusted third-party service providers who assist us in operating the website and fulfilling orders, such as payment processors and delivery partners. These third parties are permitted to use your data only for the purposes of providing services to us and are contractually required to keep it confidential. We do not sell, rent, or trade your personal information to any third party for their own marketing purposes. We may also disclose your information where required by law, court order, or regulatory authority.'
    },
    {
      title: '7. User Rights',
      content: 'Depending on your location and applicable law, you may have the following rights regarding your personal data: (a) The right to access the personal information we hold about you. (b) The right to request correction of inaccurate or incomplete data. (c) The right to request deletion of your personal data, subject to legal obligations. (d) The right to object to or restrict the processing of your data in certain circumstances. (e) The right to withdraw consent to marketing communications at any time. (f) The right to data portability where technically feasible. To exercise any of these rights, please contact us through the official contact page on our website. We will respond to your request within a reasonable timeframe.'
    },
    {
      title: '8. Updates to Policy',
      content: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal obligations. When we make material changes, we will post the revised policy on this page with an updated effective date. We encourage you to review this page periodically to stay informed about how we are protecting your information. Your continued use of the website after any changes are posted constitutes your acceptance of the updated policy.'
    }
  ]
};

const PoliciesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL hash or default to refund
  const getInitialTab = (): PolicyTab => {
    const hash = location.hash.replace('#', '');
    if (hash === 'terms' || hash === 'privacy' || hash === 'refund') {
      return hash as PolicyTab;
    }
    // Also check for old URL patterns
    if (location.pathname.includes('terms')) return 'terms';
    if (location.pathname.includes('privacy')) return 'privacy';
    return 'refund';
  };

  const [activeTab, setActiveTab] = useState<PolicyTab>(getInitialTab);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (tab: PolicyTab) => {
    setActiveTab(tab);
    setExpandedSections(new Set([0])); // Reset expanded sections
    navigate(`/policies#${tab}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen for hash changes (e.g. footer links)
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'terms' || hash === 'privacy' || hash === 'refund') {
      setActiveTab(hash as PolicyTab);
      setExpandedSections(new Set([0]));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash]);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  // Get current policy data based on active tab
  const getCurrentPolicy = () => {
    switch (activeTab) {
      case 'terms':
        return termsConditionsData;
      case 'privacy':
        return privacyPolicyData;
      default:
        return refundPolicyData;
    }
  };

  const currentPolicy = getCurrentPolicy();

  const tabs = [
    { id: 'refund' as PolicyTab, label: 'Refund Policy', icon: '↩️' },
    { id: 'terms' as PolicyTab, label: 'Terms & Conditions', icon: '📋' },
    { id: 'privacy' as PolicyTab, label: 'Privacy Policy', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-bold text-gray-900 mb-2 lg:mb-4">
              Legal & Policies
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Important information about our policies and terms
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Policy Title & Introduction */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">
            {currentPolicy.pageTitle}
          </h2>
          <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
            {currentPolicy.introduction}
          </p>
          <p className="text-sm lg:text-base text-gray-400 mt-3">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Policy Sections - Accordion Style */}
        <div className="space-y-3 lg:space-y-4">
          {currentPolicy.sections.map((section, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl lg:rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between p-4 sm:p-5 lg:p-6 bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-semibold text-gray-900 pr-4 text-base lg:text-lg">
                  {section.title}
                </span>
                <span
                  className={`flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-200 ${
                    expandedSections.has(index) ? 'rotate-180' : ''
                  }`}
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              {expandedSections.has(index) && (
                <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6 pt-0 bg-white">
                  <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 lg:mt-16 p-6 lg:p-8 bg-gray-50 rounded-2xl lg:rounded-3xl">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4">
            Have Questions?
          </h3>
          <p className="text-gray-600 mb-4 lg:mb-6 text-base lg:text-lg">
            If you have any questions about our policies, please don't hesitate to contact us.
          </p>
          <div className="flex flex-wrap gap-3 lg:gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-black text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-5 lg:px-6 py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View FAQ
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 lg:mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors text-base lg:text-lg"
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

export default PoliciesPage;
