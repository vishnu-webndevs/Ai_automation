
import React from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openItem, setOpenItem] = React.useState<string | null>(items[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {items.map((item, index) => (
        <div key={item.id} className={index !== items.length - 1 ? 'border-b border-gray-200' : ''}>
          <h2>
            <button
              type="button"
              className={`flex items-center justify-between w-full p-5 font-medium text-left transition-colors
                ${openItem === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => toggleItem(item.id)}
              aria-expanded={openItem === item.id}
            >
              <span>{item.title}</span>
              <svg
                data-accordion-icon
                className={`w-3 h-3 shrink-0 transition-transform ${openItem === item.id ? 'rotate-180' : ''}`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
              </svg>
            </button>
          </h2>
          <div className={`${openItem === item.id ? 'block' : 'hidden'}`}>
            <div className="p-5 border-t border-gray-200 text-gray-500">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
