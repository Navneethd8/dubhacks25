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
 * Renders a stylized box displaying a row of three key metrics.
 * * @param {Array} metrics - Array of objects: { value, label, color }
 * @param {string} className - Optional Tailwind classes for the outer box
 */
const MetricsBox = ({ metrics = defaultMetrics, className = '' }) => {
  return (
    // Outer Container: Defines the rounded blue box and its size
    <div className={`p-6 rounded-2xl bg-blue-900 shadow-lg max-w-xl w-full mx-auto ${className}`}>
      
      {/* Metrics Row: Uses Flexbox to space the metrics horizontally */}
      <div className="flex justify-around items-end w-full mb-4">
        
        {/* Map through the metrics array to render each data point */}
        {metrics.map((metric, index) => (
          // Individual Metric Column: Stacks the number and label vertically
          <div key={index} className="flex flex-col items-center mx-2">
            
            {/* Metric Number (Value) */}
            <p className={`${metric.color} text-6xl font-extrabold leading-none`}>
              {metric.value}
            </p>
            
            {/* Metric Label */}
            <p className="text-white text-sm font-semibold uppercase mt-2">
              {metric.label}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
};

export default MetricsBox;