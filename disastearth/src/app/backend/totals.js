// NewsList.jsx
"use client";
import { useEffect } from "react";

function TotalsList({ onData }) {
  useEffect(() => {
    fetch("https://051b7yn3oi.execute-api.us-east-1.amazonaws.com/prod/totals")
      .then(res => res.json())
      .then(data => {
        const parsedData = Array.isArray(data)
          ? data
          : JSON.parse(data.body || "[]");

        const formatNumber = (num) => {
            if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
            if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
            if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
            return num.toString();
          };

        // Transform API data
        const cardData = parsedData.map(item => {
          return {
            people: Number(item.people) || 0,
          };
        });

        const totalPeople = cardData.reduce(
          (acc, item) => acc + item.people,
          0
        );

        const totalItems = cardData.length;

        // Build metrics array
        const metrics = [
          { value: totalItems.toString(), label: "ACTIVE EVENTS", color: "text-red-500" },
          { value: formatNumber(totalPeople), label: "PEOPLE AFFECTED", color: "text-yellow-500" },
          { value: "1", label: "DAYS SINCE EVENT", color: "text-green-500" },
        ];

        if (onData) onData(metrics);
      })
      .catch(err => console.error(err));
  }, [onData]);

  return null;
}

export default TotalsList;
