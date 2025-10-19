// NewsList.jsx
"use client";
import { useEffect } from "react";

function NeedsList({ onData }) {
  useEffect(() => {
    fetch("https://051b7yn3oi.execute-api.us-east-1.amazonaws.com/prod/confidence")
      .then(res => res.json())
      .then(data => {
        const parsedData = Array.isArray(data) ? data : JSON.parse(data.body || "[]");

        const filteredData = parsedData.filter(item => Number(item.confidence) !== 0);

        const cardData = filteredData.map(item => ({
          location: item.location || "No Title",
          support: item.support || "",
          confidence: item.confidence || 0,
          prio: item.prio || "No needs"
        }));

        if (onData) onData(cardData);
      })
      .catch(err => console.error(err));
  }, [onData]);

  return null;
}

export default NeedsList;
