// ScrollableCard.jsx

"use client"; // Keep this directive for client-side hooks

import React, { useRef } from 'react';
import { useAutoLoopScroll } from './autoScroll'; // Ensure the path is correct

const ScrollableCard = ({ className = '' }) => { 
      // 1. Create three separate sets of refs for the three scrollable boxes
  const scrollRef1 = useRef(null);
  const contentRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const contentRef2 = useRef(null);
  const scrollRef3 = useRef(null);
  const contentRef3 = useRef(null);
  
  // 2. Call the custom hook three times to initiate independent scrolling logic
  const scrollHandlers1 = useAutoLoopScroll(scrollRef1, contentRef1);
  const scrollHandlers2 = useAutoLoopScroll(scrollRef2, contentRef2);
  const scrollHandlers3 = useAutoLoopScroll(scrollRef3, contentRef3);

  // Define content for each card
  const listItems1 = ['Water Bottles', 'Toilet Paper', 'Lumber', 'Emergency Blankets', 'Canned Food', 'First-Aid Kits'];
  const listItems2 = ['Area A: North Sector', 'Area B: South Dock', 'Area C: West Gate', 'Area D: Central Hub', 'Area E: East Wing', 'Area F: Maintenance'];
  const listItems3 = ['Shelter Kit (Level 1)', 'Medical Supplies (Level 2)', 'Power Tools (Level 3)', 'Rations (Level 4)', 'Communication Gear (Level 5)', 'Fuel Reserves (Level 6)'];


  // Helper function to render a list and return its JSX
  const renderList = (ref, items) => (
    <ul ref={ref} className="text-white text-sm space-y-1">
      {items.map((item, index) => (
        <li key={index}>&rarr; {item}</li>
      ))}
    </ul>
  );

  return (
    <div className='${className} max-w-80 mx-auto px-2 py-3 rounded-xl bg-[#452DFA]/85 shadow-2xl'> 
      
      <h1 className="text-white text-2xl font-extrabold text-center mb-2 tracking-wide leading-tight">
        PRIORITY NEEDS
      </h1>

      {/* --- Card 1: Needs List --- */}
      <div className="bg-black rounded-xl p-3 mb-3 shadow-lg">
        <h2 className="text-white text-md font-bold mb-2">SUPPLY NEEDS</h2>
        <div 
          className="max-h-[70px] overflow-y-auto hide-scrollbar"
          ref={scrollRef1} 
          {...scrollHandlers1} // Apply hover handlers
        >
          {renderList(contentRef1, listItems1)} 
          {renderList(null, listItems1)} {/* Duplicate list for seamless loop */}
        </div>
      </div>

      {/* --- Card 2: Location List --- */}
      <div className="bg-black rounded-xl p-3 mb-3 shadow-lg">
        <h2 className="text-white text-md font-bold mb-2">DEPLOYMENT AREAS</h2>
        <div 
          className="max-h-[70px] overflow-y-auto hide-scrollbar"
          ref={scrollRef2} 
          {...scrollHandlers2} // Apply hover handlers
        >
          {renderList(contentRef2, listItems2)} 
          {renderList(null, listItems2)} {/* Duplicate list for seamless loop */}
        </div>
      </div>

      {/* --- Card 3: Status List --- */}
      <div className="bg-black rounded-xl p-3 shadow-lg">
        <h2 className="text-white text-md font-bold mb-2">STATUS LEVELS</h2>
        <div 
          className="max-h-[70px] overflow-y-auto hide-scrollbar"
          ref={scrollRef3} 
          {...scrollHandlers3} // Apply hover handlers
        >
          {renderList(contentRef3, listItems3)} 
          {renderList(null, listItems3)} {/* Duplicate list for seamless loop */}
        </div>
      </div>
      
    </div>

    

    
  );
};

export default ScrollableCard;