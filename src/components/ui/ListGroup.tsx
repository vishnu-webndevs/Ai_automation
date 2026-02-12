
import React from 'react';

interface ListGroupItem {
  content: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  href?: string;
  badge?: number | string;
}

interface ListGroupProps {
  items: ListGroupItem[];
  flush?: boolean;
}

const ListGroup: React.FC<ListGroupProps> = ({ items, flush = false }) => {
  return (
    <ul className={`text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg ${flush ? 'border-0 rounded-none' : ''}`}>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const borderClass = flush ? 'border-b last:border-b-0' : 'border-b last:border-b-0';
        const activeClass = item.active ? 'z-10 bg-blue-600 text-white' : 'hover:bg-gray-100 hover:text-blue-700 focus:text-blue-700';
        const disabledClass = item.disabled ? 'text-gray-400 cursor-not-allowed hover:bg-white hover:text-gray-400' : '';
        const radiusClass = flush ? '' : `${isFirst ? 'rounded-t-lg' : ''} ${isLast ? 'rounded-b-lg' : ''}`;

        const content = (
          <div className="flex justify-between w-full">
            <span>{item.content}</span>
            {item.badge && (
              <span className={`inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium rounded-full ${item.active ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                {item.badge}
              </span>
            )}
          </div>
        );

        return (
          <li key={index} className={`w-full px-4 py-2 ${borderClass} ${radiusClass} ${item.active ? 'bg-blue-600 text-white' : ''} ${!item.active && !item.disabled ? 'hover:bg-gray-100' : ''}`}>
            {item.href && !item.disabled ? (
              <a href={item.href} className={`block w-full ${activeClass} ${disabledClass}`}>
                 {content}
              </a>
            ) : (
              <div className={`${item.disabled ? 'text-gray-400' : ''}`}>
                 {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ListGroup;
