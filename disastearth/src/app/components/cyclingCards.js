"use client";

import React, { useState, useEffect } from 'react';

// --- Inner Section Data (Sufficient for multiple screens) ---
const SECTIONS = [
  { 
    id: 1,
    area: "AREA 1: SUPPLY NEEDS", 
    content: ["Water Bottles", "Toilet Paper", "Lumber", "Lego Death Star"]
  },
  { 
    id: 2,
    area: "AREA 2: PERSONNEL STATUS", 
    content: ["95% Deployed", "5% On Standby", "24/7 Monitoring", "Low Fatigue"]
  },
  { 
    id: 3,
    area: "AREA 3: FINANCIALS", 
    content: ["Budget: $1.2M", "Spent: $800k", "Forecast: Green", "Donations: $50k"]
  },
  { 
    id: 4,
    area: "AREA 4: MEDICAL SUPPORT", 
    content: ["Vaccines", "First Aid Kits", "Triage Supplies", "Field Hospital Setup"]
  },
  { 
    id: 5,
    area: "AREA 5: SHELTERING", 
    content: ["Tents (Large)", "Blankets", "Sleeping Bags", "Heating Units"]
  },
];

const renderList = (items) => (
  <ul className="list-none p-0 m-0 space-y-2">
    {items.map((item, index) => (
      <li key={index} className="flex items-center text-white text-md font-medium">
        <span className="mr-2 font-bold text-blue-000">&rarr;</span>
        {item}
      </li>
    ))}
  </ul>
);

const BOX_HEIGHT_PX = 200;
const VISIBLE_BOXES = 2;
const WINDOW_HEIGHT_PX = BOX_HEIGHT_PX * VISIBLE_BOXES; 

const ScrollingBoxes = ({ className = '' }) => {
  const [offsetY, setOffsetY] = useState(0);
  const [transitionSpeed, setTransitionSpeed] = useState('transform 1s linear'); 
  
  const extendedSections = [...SECTIONS, ...SECTIONS.slice(0, VISIBLE_BOXES)]; 
  
  const totalSlides = extendedSections.length; 
  const totalScrollableSteps = totalSlides - VISIBLE_BOXES; 

  // --- Continuous Scrolling Loop Logic ---
  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setTransitionSpeed('transform 1s linear'); 

      setOffsetY(prevY => {
        const nextY = prevY - BOX_HEIGHT_PX;
        
        if (Math.abs(nextY) >= BOX_HEIGHT_PX * totalScrollableSteps) {
          
          setTimeout(() => {
            setTransitionSpeed('none'); 
            setOffsetY(0);             
          }, 1000); 

          return nextY; 
        }
        
        return nextY; 
      });

    }, 3500); 

    return () => clearInterval(scrollInterval);
  }, [totalScrollableSteps]); 

  return (
    // Outer Container (The main blue box)
    // ⬅️ Updated to max-w-2xl for guaranteed wider appearance.
    <div className={`px-4 py-3 rounded-2xl bg-[#452DFA]/85 shadow-2xl max-w-xl width-100vw flex-grow ${className}`}>
      
      <h1 className="text-white text-2xl font-extrabold text-center mb-4 tracking-wide leading-tight">
        PRIORITY NEEDS
      </h1>
      
      {/* --- Scrolling Window (400px high) --- */}
      <div 
        className="overflow-hidden rounded-xl shadow-lg" 
        style={{ height: `${WINDOW_HEIGHT_PX}px`, width: `487px` }} 
      >
        
        {/* --- Inner Track (Moves vertically) --- */}
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            transition: transitionSpeed,
          }}
        >
          
          {/* Map through the extended list */}
          {extendedSections.map((section, index) => (
            <div 
              key={`${section.id}-${index}`} 
              // Inner box uses w-full to ensure it fills the max-w-2xl parent container
              className="bg-black p-4 w-full flex flex-col justify-start" 
              style={{ height: `${BOX_HEIGHT_PX}px` }}
            >
              <h2 className="text-white text-md font-bold mb-3 uppercase border-b border-gray-700 pb-2">
                {section.area}
              </h2>
              <div className="overflow-auto flex-grow">
                {renderList(section.content)}
              </div>
            </div>
          ))}

        </div> 
      </div> 

    </div>
  );
};

export default ScrollingBoxes;