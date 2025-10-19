"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { TextureLoader, ShaderMaterial, Vector2 } from "three";
import * as solar from "solar-calculator";

// Prevent SSR errors
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const VELOCITY = 1; // minutes per frame

// Custom day/night shader
const dayNightShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;
    uniform vec2 globeRotation;
    varying vec3 vNormal;
    varying vec2 vUv;

    float toRad(in float a) { return a * PI / 180.0; }

    vec3 Polar2Cartesian(in vec2 c) {
      float theta = toRad(90.0 - c.x);
      float phi = toRad(90.0 - c.y);
      return vec3(
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      float invLon = toRad(globeRotation.x);
      float invLat = -toRad(globeRotation.y);
      mat3 rotX = mat3(
        1,0,0,
        0,cos(invLat),-sin(invLat),
        0,sin(invLat),cos(invLat)
      );
      mat3 rotY = mat3(
        cos(invLon),0,sin(invLon),
        0,1,0,
        -sin(invLon),0,cos(invLon)
      );
      vec3 rotatedSunDir = rotX * rotY * Polar2Cartesian(sunPosition);
      float intensity = dot(normalize(vNormal), normalize(rotatedSunDir));
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      float blendFactor = smoothstep(-0.1,0.1,intensity);
      gl_FragColor = mix(nightColor, dayColor, blendFactor);
    }
  `
};

const exampleEvents = [
  {
    id: "1",
    lat: 34.05,
    lon: -118.25,
    name: "Los Angeles",
    type: "wildfire",
    severity: 3,
    contacts: ["911", "LA Fire Department"],
    timestamp: "2025-10-19T08:00:00Z",
    peopleAffected: 1200
  },
  {
    id: "2",
    lat: 29.76,
    lon: -95.37,
    name: "Houston",
    type: "flood",
    severity: 2,
    contacts: ["911", "Houston Emergency Services"],
    timestamp: "2025-10-19T09:30:00Z",
    peopleAffected: 800
  },
  {
    id: "3",
    lat: 40.71,
    lon: -74.01,
    name: "New York City",
    type: "hurricane",
    severity: 4,
    contacts: ["911", "NYC Emergency Management"],
    timestamp: "2025-10-19T10:15:00Z",
    peopleAffected: 5000
  },
  {
    id: "4",
    lat: 37.77,
    lon: -122.42,
    name: "San Francisco",
    type: "earthquake",
    severity: 5,
    contacts: ["911", "San Francisco Emergency Services"],
    timestamp: "2025-10-19T11:00:00Z",
    peopleAffected: 3000
  },
  {
    id: "5",
    lat: 25.76,
    lon: -80.19,
    name: "Miami",
    type: "flood",
    severity: 1,
    contacts: ["911", "Miami Emergency Management"],
    timestamp: "2025-10-19T12:45:00Z",
    peopleAffected: 600
  }
];

// Calculate sun position based on timestamp
const sunPosAt = (dt) => {
  const day = new Date(+dt).setUTCHours(0,0,0,0);
  const t = solar.century(dt);
  const longitude = (day - dt)/864e5*360 - 180;
  return [longitude - solar.equationOfTime(t)/4, solar.declination(t)];
};

export default function DayNightGlobe() {
  const globeRef = useRef(); // <-- define globeRef here
  const [dt, setDt] = useState(+new Date());
  const [globeMaterial, setGlobeMaterial] = useState();

  const [isHovered, setIsHovered] = useState(false);
  const defaultView = { lng: 0, lat: 0 }; // default rotation
  const rotateSpeed = -0.1; // degrees per frame
  const returnSpeed = 0.02; // interpolation speed when returning to default

  const [selectedEvent, setSelectedEvent] = useState(null);

  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedEvent(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Animate time
  useEffect(() => {
    let frame;
    const iterateTime = () => {
      setDt((dt) => dt + VELOCITY * 60 * 1000);
      frame = requestAnimationFrame(iterateTime);
    };
    iterateTime();
    return () => cancelAnimationFrame(frame);
  }, []);

  // Load day/night textures and shader material
  useEffect(() => {
    Promise.all([
      new TextureLoader().loadAsync('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg'),
      new TextureLoader().loadAsync('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
    ]).then(([dayTex, nightTex]) => {
      setGlobeMaterial(new ShaderMaterial({
        uniforms: {
          dayTexture: { value: dayTex },
          nightTexture: { value: nightTex },
          sunPosition: { value: new Vector2() },
          globeRotation: { value: new Vector2() },
        },
        vertexShader: dayNightShader.vertexShader,
        fragmentShader: dayNightShader.fragmentShader,
      }));
    });
  }, []);

  // Update sun position each frame
  useEffect(() => {
    if (globeMaterial) {
      globeMaterial.uniforms.sunPosition.value.set(...sunPosAt(dt));
    }
  }, [dt, globeMaterial]);

  // Update globe rotation from user interactions
  const handleZoom = useCallback(({ lng, lat }) => {
    if (globeMaterial) globeMaterial.uniforms.globeRotation.value.set(lng, lat);
  }, [globeMaterial]);

  const pointsData = exampleEvents.map(event => ({
    ...event,          // keep all event properties
    lat: event.lat,    // latitude
    lng: event.lon,    // longitude (react-globe.gl expects 'lng')
    size: event.size,         // optional: fixed point size
    color: (() => {    // color based on disaster type
      switch (event.type) {
        case "wildfire": return "red";
        case "flood": return "blue";
        case "hurricane": return "green";
        case "earthquake": return "orange";
        default: return "white";
      }
    })()
  }));

  useEffect(() => {
    let frame;

    const animate = () => {
      if (!globeRef.current) {
        frame = requestAnimationFrame(animate);
        return;
      }

      // get current pointOfView
      const pov = globeRef.current.pointOfView() || { lng: 0, lat: 0 };

      let lng = pov.lng;
      let lat = pov.lat;

      if (!isHovered) {
        // auto-rotate horizontally
        lng += rotateSpeed;
        if (lng > 360) lng -= 360;

        // smoothly return latitude to 0
        lat += (0 - lat) * returnSpeed;
        globeRef.current.pointOfView({ lng, lat }, 0);
        frame = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [isHovered]);


  return (

    <div
        style={{
          zIndex: 1000,
          borderRadius: "15px",  // <-- rounded corners
          overflow: "hidden",          
        }}
        onMouseEnter={() => setIsHovered(true)}  // pause on hover
        onMouseLeave={() => setIsHovered(false)} // resume on leave
      >
        <Globe
          ref={globeRef}
          width={500}
          height={470}
          pointsData={pointsData}
          pointAltitude={d => 0.05 + (d.severity ?? 1) * 0.05} // spike height
          pointColor={(d) => d.color}
          pointRadius={1}
          pointLabel={d => `<b>${d.name}</b><b>:</b> ${d.type}
          <br/><b>Severity</b><b>:</b> ${d.severity}`}
          onPointClick={d => setSelectedEvent(d)}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          onZoom={handleZoom}/>

      {selectedEvent && (
        <div
          ref={modalRef}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "12px",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            borderRadius: "8px",
            zIndex: 1000,
            maxWidth: "240px"
          }}
        >
          <h3 className="font-extrabold">{selectedEvent.name || "Unknown Location"}</h3>
          <p><b>Coordinates:</b> {selectedEvent.lat.toFixed(2)}, {selectedEvent.lng.toFixed(2)}</p>
          <p><b>Type:</b> {selectedEvent.type}</p>
          <p><b>Severity:</b> {selectedEvent.severity}</p>
          <p><b>People Affected:</b> {selectedEvent.peopleAffected}</p>
          <p><b>Contacts:</b> {selectedEvent.contacts.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
