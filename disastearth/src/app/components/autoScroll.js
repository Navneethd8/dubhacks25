// src/hooks/useAutoLoopScroll.js

import { useEffect, useState } from 'react';

// This custom hook handles the continuous, looping scroll
// It returns a ref to attach to the scrollable container
export const useAutoLoopScroll = (scrollRef, contentRef, scrollStep = 0.5, intervalDelay = 30) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    const contentElement = contentRef.current;
    
    // Check if both refs are attached to DOM elements
    if (!element || !contentElement) return;

    let scrollPosition = element.scrollTop;
    // The loop limit is the height of the original content (the first instance)
    const scrollLimit = contentElement.clientHeight;

    const startScrolling = () => {
      if (isHovered) {
        return; // Pause scrolling if hovered
      }

      scrollPosition += scrollStep;

      // Check if we have scrolled past the original content's height
      if (scrollPosition >= scrollLimit) {
        // Snap back one full content height for the seamless loop
        scrollPosition = scrollPosition - scrollLimit; 
      }
      
      element.scrollTop = scrollPosition;
    };

    // Set up the interval
    const scrollInterval = setInterval(startScrolling, intervalDelay);

    // Cleanup: Clear the interval when the component unmounts
    return () => clearInterval(scrollInterval);
  }, [isHovered, scrollRef, contentRef, scrollStep, intervalDelay]);

  // Return the hover handlers so the component can pause the scrolling
  return { 
    onMouseEnter: () => setIsHovered(true), 
    onMouseLeave: () => setIsHovered(false) 
  };
};