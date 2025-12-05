
import React from 'react';

const BackgroundEffects = () => {
  return (
    <>
      {/* Top background blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-teal-100 opacity-30 blur-3xl"></div>
      <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-indigo-100 opacity-30 blur-3xl"></div>
      
      {/* Bottom background blobs */}
      <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-teal-100 opacity-30 blur-2xl"></div>
      <div className="absolute -bottom-8 left-1/3 w-32 h-32 rounded-full bg-indigo-100 opacity-30 blur-xl"></div>
    </>
  );
};

export default BackgroundEffects;