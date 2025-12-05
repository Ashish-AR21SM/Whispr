import React from 'react';

const Card = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div 
      className={`
        glass-effect rounded-xl p-6 
        ${hoverEffect ? 'transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-xl font-bold ${className}`}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '' }) => {
  return (
    <p className={`text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-800 ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;