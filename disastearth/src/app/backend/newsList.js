// NewsList.jsx
"use client";
import { useEffect } from "react";

function NewsList({ onData }) {
  useEffect(() => {
    fetch("https://051b7yn3oi.execute-api.us-east-1.amazonaws.com/prod/news")
      .then(res => res.json())
      .then(data => {
        const parsedData = Array.isArray(data) ? data : JSON.parse(data.body || "[]");

        // Transform API data: only take title and summary and url, ensure summary is a string
        const cardData = parsedData.map(item => ({
          title: item.title || "No Title",
          summary: typeof item.summary === "string" ? item.summary : "",
          url: item.url || ""
        }));

        if (onData) onData(cardData);
      })
      .catch(err => console.error(err));
  }, [onData]);

  return null;
}

export default NewsList;
