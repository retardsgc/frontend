import React, { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

interface FAQData {
  shopping: FAQSection;
  payment: FAQSection;
  returns: FAQSection;
}

interface AccordionSectionProps {
  sectionKey: keyof FAQData;
  section: FAQSection;
}

const FAQPage: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const faqData: FAQData = {
    shopping: {
      title: "Shopping Information",
      items: [
        {
          id: 1,
          question: "Pellentesque habitant morbi tristique senectus et netus?",
          answer: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante."
        },
        {
          id: 2,
          question: "Donec eu libero sit amet quam egestas semper?",
          answer: "Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra."
        },
        {
          id: 3,
          question: "Vestibulum erat wisi, condimentum sed, commodo vitae?",
          answer: "Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui."
        },
        {
          id: 4,
          question: "Donec non enim in turpis pulvinar facilisis?",
          answer: "Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat."
        }
      ]
    },
    payment: {
      title: "Payment Information",
      items: [
        {
          id: 5,
          question: "Aliquam erat volutpat. Morbi imperdiet?",
          answer: "Aliquam erat volutpat. Morbi imperdiet, mauris ac auctor dictum, nisl ligula egestas nulla, et sollicitudin lorem quis nunc. Mauris dictum libero id justo."
        },
        {
          id: 6,
          question: "Suspendisse in justo eu magna luctus suscipit?",
          answer: "Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam."
        },
        {
          id: 7,
          question: "Vestibulum ante ipsum primis in faucibus?",
          answer: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam."
        }
      ]
    },
    returns: {
      title: "Returns & Exchanges",
      items: [
        {
          id: 8,
          question: "In hac habitasse platea dictumst?",
          answer: "In hac habitasse platea dictumst. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede."
        },
        {
          id: 9,
          question: "Sed aliquam ultrices mauris. Integer ante arcu?",
          answer: "Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc."
        },
        {
          id: 10,
          question: "Nunc viverra imperdiet enim. Fusce est?",
          answer: "Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas."
        }
      ]
    }
  };

  const toggleSection = (id: number): void => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const AccordionSection: React.FC<AccordionSectionProps> = ({ sectionKey, section }) => (
    <div className="mb-8 lg:mb-12">
      <h2 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-black mb-6 lg:mb-8">{section.title}</h2>
      <div className="space-y-4 lg:space-y-5">
        {section.items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg lg:rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(item.id)}
              className="w-full px-6 lg:px-8 py-4 lg:py-5 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
            >
              <span className="text-sm lg:text-base xl:text-lg font-medium text-black pr-4">
                {item.question}
              </span>
              <svg
                className={`w-5 h-5 lg:w-6 lg:h-6 text-gray-500 transition-transform duration-200 ${
                  expandedSection === item.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSection === item.id && (
              <div className="px-6 lg:px-8 pb-6 lg:pb-8 pt-2">
                <p className="text-sm lg:text-base xl:text-lg text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="text-center py-12 lg:py-16 xl:py-20 px-4">
        <h1 className="text-4xl lg:text-5xl xl:text-[54px] font-bold text-black mb-2">FAQ</h1>
      </div>

      {/* Main Content Container */}
      <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        {/* FAQ Accordions */}
        <AccordionSection sectionKey="shopping" section={faqData.shopping} />
        <AccordionSection sectionKey="payment" section={faqData.payment} />
        <AccordionSection sectionKey="returns" section={faqData.returns} />
      </div>
    </div>
  );
};

export default FAQPage;
