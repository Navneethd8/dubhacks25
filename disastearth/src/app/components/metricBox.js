// MetricsBox.jsx
"use client";

import React from 'react';

// Define the structure and default values for the metrics
const defaultMetrics = [
  { value: '55', label: 'ACTIVE EVENTS', color: 'text-red-500' },
  { value: '55,000', label: 'PEOPLE AFFECTED', color: 'text-yellow-500' },
  { value: '10', label: 'DAYS SINCE EVENT', color: 'text-green-500' },
];

/**
 * Renders a stylized box displaying three key metrics (accessed via index).
 * @param {Array} metrics - Array of 3 objects: { value, label, color }
 * @param {string} className - Optional Tailwind classes for the outer box
 */
const MetricsBox = ({ metrics = defaultMetrics, className = '' }) => {
  // Ensure the metrics array has at least 3 elements before trying to access them
  const m1 = metrics[0] || {};
  const m2 = metrics[1] || {};
  const m3 = metrics[2] || {};

  // You can also use a simple check to hide the box if data is completely missing:
  if (!metrics || metrics.length < 3) {
    // If you prefer to render nothing when data is incomplete
    // return null;
  }

  return (
    // Outer Container: Defines the rounded blue box and its size
    <div className={`p-4.5 rounded-2xl bg-[#452DFA]/30 shadow-lg max-w-xl w-full mx-auto ${className}`}>
      
      {/* Metrics Row: Uses Flexbox to space the metrics horizontally */}
      <div className="flex justify-around items-end w-full mb-4">
        
        {/* --- Metric 1 (Index 0) --- */}
        <div className="flex flex-col items-center mx-2">
          {/* Use bracket notation to access properties */}
          <p className={`${m1.color || 'text-gray-400'} text-6xl font-extrabold leading-none`}>
            {m1.value || 'N/A'}
          </p>
          <p className="text-white text-sm font-semibold uppercase mt-2">
            {m1.label || 'METRIC 1'}
          </p>
        </div>

        {/* --- Metric 2 (Index 1) --- */}
        <div className="flex flex-col items-center mx-2">
          <p className={`${m2.color || 'text-gray-400'} text-6xl font-extrabold leading-none`}>
            {m2.value || 'N/A'}
          </p>
          <p className="text-white text-sm font-semibold uppercase mt-2">
            {m2.label || 'METRIC 2'}
          </p>
        </div>

        {/* --- Metric 3 (Index 2) --- */}
        <div className="flex flex-col items-center mx-2">
          <p className={`${m3.color || 'text-gray-400'} text-6xl font-extrabold leading-none`}>
            {m3.value || 'N/A'}
          </p>
          <p className="text-white text-sm font-semibold uppercase mt-2">
            {m3.label || 'METRIC 3'}
          </p>
        </div>

      </div>
    </div>
  );
};

export default MetricsBox;