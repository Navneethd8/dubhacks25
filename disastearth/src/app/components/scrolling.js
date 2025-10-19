// ScrollableCard.jsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAutoLoopScroll } from "./autoScroll";

const ScrollableCard = ({ cardData = [], height = 400, width = 400 }) => {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure content height for seamless looping
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, [cardData]);

  const scrollHandlers = useAutoLoopScroll(scrollRef, contentRef);

  // Render a single card with title and summary as paragraph
  const renderCard = (title, summary) => (
    <div className="bg-black rounded-xl p-4 mb-3 shadow-lg w-full">
      <h2 className="text-white text-md font-bold mb-2">{title}</h2>
      <p className="text-white text-sm">{summary || "No summary available"}</p>
    </div>
  );

  const renderAllCards = (ref) => (
    <div ref={ref} className="flex flex-col">
      {cardData.map((data, index) => (
        <React.Fragment key={index}>
          {renderCard(data.title, data.summary)}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div
      className="mx-auto p-3 rounded-xl bg-[#452DFA]/85 shadow-2xl flex flex-col"
      style={{ width: `${width}px` }}
    >
      <h1 className="text-white text-2xl font-extrabold text-center mb-4 tracking-wide leading-tight flex-shrink-0">
        PRIORITY NEEDS
      </h1>

      <div
        ref={scrollRef}
        {...scrollHandlers}
        className="overflow-y-auto hide-scrollbar flex-grow"
        style={{ height: `${height}px` }}
      >
        {renderAllCards(contentRef)}
        <div style={{ height: `${contentHeight}px` }}>{renderAllCards(null)}</div>
      </div>
    </div>
  );
};

export default ScrollableCard;
