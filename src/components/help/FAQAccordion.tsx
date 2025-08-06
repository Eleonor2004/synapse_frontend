'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export const FAQAccordion = ({ items }: FAQAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition-all duration-300">
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex justify-between items-center text-left p-6 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200"
          >
            <span className="font-semibold text-lg text-gray-900 dark:text-white pr-4">
              {item.question}
            </span>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-6 pb-6 pt-0">
                <div className="h-px bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};