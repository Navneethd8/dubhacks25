"use client";

import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';

// Helper function to generate some dummy data points
const N = 30; // Number of data points
const generatePoints = () =>
  [...Array(N).keys()].map(() => ({
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360,
    size: Math.random() / 3,
    color: ['red', 'white', 'blue', 'yellow'][Math.round(Math.random() * 3)],
    label: `Point at ${Math.round((Math.random() - 0.5) * 180)} latitude`, // Tooltip label
  }));

const GlobeComponent = () => {
  const globeEl = useRef();
  const [pointsData, setPointsData] = useState([]);
  const [globeReady, setGlobeReady] = useState(false);

  // Use useEffect to run client-side logic and load data
  useEffect(() => {
    // Check if window/document is defined to prevent SSR issues (e.g., in Next.js)
    if (typeof window !== 'undefined') {
      setPointsData(generatePoints());
      setGlobeReady(true);
      
      // Optional: Auto-rotate the globe
      if (globeEl.current) {
        globeEl.current.controls().autoRotate = true;
        globeEl.current.controls().autoRotateSpeed = 0.5;
      }
    }
  }, []);

  // Set the canvas size to fill the parent container (Tailwind)
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Define point properties using accessor functions for flexibility
  const getPointLat = (d) => d.lat;
  const getPointLng = (d) => d.lng;
  const getPointColor = (d) => d.color;
  const getPointAltitude = (d) => d.size * 0.2; // Altitude proportional to 'size'
  const getPointRadius = (d) => 0.5; // Fixed point radius

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-gray-900 overflow-hidden">
      <div className="relative w-full h-full">
        <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-white z-10 p-2 bg-black bg-opacity-50 rounded shadow-lg">
          🌏 Interactive Data Globe
        </h1>
        {globeReady && (
          <Globe
            ref={globeEl}
            width={width}
            height={height}
            // Globe configuration
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            // Points Layer configuration
            pointsData={pointsData}
            pointLabel="label"
            pointLat={getPointLat}
            pointLng={getPointLng}
            pointColor={getPointColor}
            pointAltitude={getPointAltitude}
            pointRadius={getPointRadius}
            // Interaction
            onPointClick={(point) => {
              console.log('Clicked point:', point);
              alert(`Clicked point: ${point.label}`);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GlobeComponent;