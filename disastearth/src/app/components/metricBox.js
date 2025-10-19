// MetricsBox.jsx
"use client";

import React from 'react';

// Define the structure and default values for the metrics
const defaultMetrics = [
  { value: '55', label: 'ACTIVE EVENTS', color: 'text-red-500' },
  { value: '55,000', label: 'PEOPLE AFFECTED', color: 'text-yellow-500' },
  { value: '10', label: 'DAYS SINCE EVENT', color: 'text-green-500' },
  // { value: '98%', label: 'TEAM DEPLOYED', color: 'text-cyan-400' }, // Added a 4th metric for demonstration
];

/**
 * Renders a stylized box displaying dynamic metrics.
 * @param {Array} metrics - Array of objects: { value, label, color }
 * @param {string} className - Optional Tailwind classes for the outer box
 * @param {string} itemWidth - Tailwind class for the width of each metric item (e.g., 'w-1/3', 'w-full')
 * @param {string} itemHeight - Tailwind class for the height/spacing of each metric item (e.g., 'py-4', 'h-24')
 */
const MetricsBox = ({ 
  metrics = defaultMetrics, 
  className = '',
  itemWidth = 'w-1/3', // Default to evenly split width for 3 items
  itemHeight = 'py-4', // Default vertical padding for the metric
}) => {

  // If there are no metrics, return null to render nothing
  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    // Outer Container: Defines the rounded blue box and its overall size
    <div className={`py-3 px-2 rounded-2xl bg-[#452DFA]/35 shadow-lg max-w-130 centered-container w-full mx-auto ${className}`}
    style={{ height: `140px`, width: `500px` }} >
      
      {/* Metrics Row: Uses Flexbox to space and wrap the metrics horizontally */}
      <div className="flex flex-wrap justify-around items-end w-full">
        
        {/* ITERATE over the metrics array */}
        {metrics.map((metric, index) => (
          <div 
            key={index}
            // Use the passed-in itemWidth and itemHeight parameters
            className={`flex flex-col items-center mx-2 ${itemWidth} ${itemHeight}`}
          >
            {/* Metric Value */}
            <p className={`${metric.color || 'text-gray-400'} text-4xl sm:text-5xl font-extrabold leading-none`}>
              {metric.value || 'N/A'}
            </p>
            {/* Metric Label */}
            <p className="text-white text-xs sm:text-sm font-semibold uppercase mt-2 text-center">
              {metric.label || 'METRIC'}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
};

export default MetricsBox;