"use client";
import { useEffect } from "react";

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
  
function Events({ exampleEvents }) {
  useEffect(() => {
    fetch("")
      .then(res => res.json())
      .then(exampleEvents => {

    if (onData) onData(clampedValue);
      })
      .catch(err => console.error("Fetch error:", err));
  }, [onData]);

  return null; // No UI
}

export default Events;
