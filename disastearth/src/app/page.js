"use client";

import { useState } from "react";

import NewsPages from './components/newsPages';
import NeedsPages from './components/needsPages';
import WaffleHouseIndex from './components/waffleHouse';
import MetricsBox from './components/metricBox';
import Globe from './components/Globe';

import NewsList from './backend/newsList';
import NeedsList from './backend/needsList';
import TotalsList from './backend/totals';
import Confidence from './backend/confidence';


export default function Home() {
  const [newsData, setNewsData] = useState([]);
  const [needsData, setNeedsData] = useState([]);
  const [totalsData, setTotalsData] = useState([]);
  const [confidence, setConfidence] = useState(0);

  
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
          <NewsList onData={setNewsData} />
          {/* Scrollable card receives live API data */}
          <NewsPages cardData={newsData} height={400} width={560} />
        </div>

        <div className="fixed top-16 right-157.5">
          <NeedsList onData={setNeedsData} />
          <NeedsPages cardData={needsData} height='552' width='240' />
        </div>

        <div className="fixed bottom-23 right-15 max-w-140 w-full">
          <Confidence onData={(avg) => setConfidence(avg)} />
          <WaffleHouseIndex n={confidence} />
        </div>

        <div className='fixed bottom-23 left-15'>
          <TotalsList onData={setTotalsData} />
          <MetricsBox metrics={totalsData} itemWidth='150' itemHeight='100'/>
        </div>

        <div className='fixed top-16 left-15 rounded-2xl bg-[#452DFA]/35 z=-50'>
          <Globe/>
        </div>

      </main>
    </div>
  );
}
