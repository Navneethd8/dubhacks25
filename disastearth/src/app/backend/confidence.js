"use client";
import { useEffect } from "react";

function Confidence({ onData }) {
  useEffect(() => {
    fetch("https://051b7yn3oi.execute-api.us-east-1.amazonaws.com/prod/totals")
      .then(res => res.json())
      .then(data => {
        const parsedData = Array.isArray(data)
          ? data
          : JSON.parse(data.body || "[]");

        const supportMap = {
          "Unknown": 0,
          "Minimal Support": 1,
          "Moderate Support": 2,
          "High Support": 3,
        };

        // Keep as objects
        const cardData = parsedData.map(item => {
          const supportValue = supportMap[item.support] ?? 0;
          const confidence = parseFloat(item.confidence) || 0;
          return { confidence, support: supportValue };
        });

        const totalWeightedConfidenceRaw = cardData.reduce(
          (acc, item) => acc + item.confidence * item.support,
          0
        );

        const averageConfidence = cardData.length > 0
          ? totalWeightedConfidenceRaw / cardData.length
          : 0;

        // Clamp to 0–100 and send to parent
        const clampedValue = Math.min(Math.max(averageConfidence * 100, 0), 100);

        console.log("Confidence fetched:", averageConfidence, "→ clamped:", clampedValue);

        if (onData) onData(clampedValue);
      })
      .catch(err => console.error("Fetch error:", err));
  }, [onData]);

  return null; // No UI
}

export default Confidence;
