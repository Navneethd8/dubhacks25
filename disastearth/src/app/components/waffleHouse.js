import React from 'react';

const WaffleHouseIndex = ({ n = 1000, className = '' }) => {

  let status = '';
  let statusColor = '';

  if (n < 15) {
    status = 'CLOSED';
    statusColor = 'text-red-600';
  } else if (n < 45) {
    status = 'LIMITED MENU';
    statusColor = 'text-yellow-400';
  } else if (n <= 100) {
    status = 'FULL MENU';
    statusColor = 'text-green-500';
  } else {
    status = 'UNKNOWN';
    statusColor = 'text-gray-400';
  }

  return (
    <div className={`p-6 rounded-2xl bg-[#452DFA]/35 shadow-lg flex flex-col items-center justify-center text-center mx-auto ${className}`}>
      <h2 className="text-white text-3xl font-extrabold tracking-wide mb-2">
        WAFFLE HOUSE INDEX
      </h2>
      <p className={`text-5xl font-extrabold tracking-tight ${statusColor}`}>
        {status}
      </p>
    </div>
  );
};

export default WaffleHouseIndex;
