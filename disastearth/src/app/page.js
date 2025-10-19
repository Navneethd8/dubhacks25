import ScrollableCard from './components/scrolling';
import WaffleHouseIndex from './components/waffleHouse';
import MetricsBox from './components/metricBox';
import InteractiveGlobe from './components/interactiveGlobe';

export default function Home() {
  
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

        <div className="fixed top-16 right-14">
          <ScrollableCard className="max-w-80" />
        </div>

        <div className="fixed top-16 right-80">
          <ScrollableCard className="max-w-80" />
        </div>

        <div className = "fixed bottom-23 right-14 max-w-129 w-full">
          <WaffleHouseIndex />
        </div>

        <div className='fixed bottom-23 left-14'>
          <MetricsBox/>
        </div>

        {/* Renders the Globe component with a specific width on the page */}
        <div className="max-w-4xl mx-auto">
          <InteractiveGlobe className="border-4 border-blue-500" />
        </div>

      </main>
    </div>
  );
}
