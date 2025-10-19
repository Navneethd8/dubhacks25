import React from 'react';

const WaffleHouseIndex = ({ status = 'PANIC', statusColor = 'text-red-600', className = '' }) => {
  return (
    // Outer rounded box container
    <div className={`p-6 rounded-2xl bg-[#452DFA]/85 shadow-lg flex flex-col items-center justify-center text-center mx-auto ${className}`}>
      
      {/* Title: WAFFLE HOUSE INDEX */}
      <h2 className="text-white text-3xl font-extrabold tracking-wide mb-2">
        WAFFLE HOUSE INDEX
      </h2>
      
      {/* Status: PANIC (or other status) */}
      <p className={`text-5xl font-extrabold tracking-tight ${statusColor}`}>
        {status}
      </p>
    </div>
  );
};

export default WaffleHouseIndex;