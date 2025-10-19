"use client";

import ScrollableCard from './components/scrolling';
import WaffleHouseIndex from './components/waffleHouse';
import MetricsBox from './components/metricBox';
import NewsList from './backend/newsList';
import { useState } from "react";


export default function Home() {
  const [cardData, setCardData] = useState([]);

  
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

        <div className="fixed -top-50 left-0 w-full">
          <svg
            viewBox="0 0 1200 500"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-[300px]" 
            preserveAspectRatio="none" >
            {/* Top line */}
            <path
              d="M0 360 L30 360 L50 420 L1150 420 L1170 360 L1200 360"
              stroke="white"
              strokeWidth="2"
              fill="none"
              transform="translate(0, 0)"
            />
          </svg>
        </div>

        <div className="fixed -bottom-5 left-0 w-full">
          <svg
            viewBox="0 0 1200 500"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-[300px]" 
            preserveAspectRatio="none" >
            {/* Bottom line */}
            <path
              d="M0 420 L30 420 L50 360 L1150 360 L1170 420 L1200 420"
              stroke="white"
              strokeWidth="2"
              fill="none"
              transform="translate(0, 0)"
            />
          </svg>
        </div>

        <div className="fixed -bottom-5 left-0 w-full">
          <svg
            viewBox="0 0 1200 500"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-[300px]" 
            preserveAspectRatio="none" >
            {/* Bottom Center line */}
            <path
              d="M70 400 L1130 400"
              stroke="white"
              strokeWidth="2"
              fill="none"
              transform="translate(0, 0)"
            />
          </svg>
        </div>

        <div className='fixed top-16 right-15'>
      {/* Fetch news and update cardData */}
      <NewsList onData={setCardData} />

      {/* Scrollable card receives live API data */}
      <ScrollableCard cardData={cardData} height={400} width={500} />
    </div>

        <div className="fixed top-16 right-150">
          <ScrollableCard height='550' width='240' />
        </div>

        <div className = "fixed bottom-23 right-15 max-w-130 w-full">
          <WaffleHouseIndex />
        </div>

        <div className='fixed bottom-23 left-15'>
          <MetricsBox itemWidth='150' itemHeight='100'/>
        </div>

        <NewsList />

      </main>
    </div>
  );
}
