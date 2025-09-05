import React from 'react';

export const ApiKeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M20.83 11.17l-4.24-4.24a2 2 0 0 0-2.83 0l-9.9 9.9a2 2 0 0 0 0 2.83l4.24 4.24a2 2 0 0 0 2.83 0l9.9-9.9a2 2 0 0 0 0-2.83z"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M14.5 9.5l-5 5"></path>
  </svg>
);
