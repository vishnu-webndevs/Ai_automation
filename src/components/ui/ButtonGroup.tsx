
import React from 'react';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`} role="group">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          let roundedClass = '';
          if (isFirst) roundedClass = 'rounded-e-none';
          else if (isLast) roundedClass = 'rounded-s-none';
          else roundedClass = 'rounded-none';

          // Cast child to allow accessing props safely in TS
          const element = child as React.ReactElement<{ className?: string }>;

          return React.cloneElement(element, {
             className: `${(element.props.className || '')} ${roundedClass} ${!isFirst ? '-ms-px' : ''}`
          });
        }
        return child;
      })}
    </div>
  );
};

export default ButtonGroup;
