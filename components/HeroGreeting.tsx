"use client";

import { useEffect, useState } from "react";

function greetingForHour(h: number): { icon: string; text: string } {
  if (h >= 5 && h < 12)
    return { icon: "🌅", text: "Good morning — the signal is warm." };
  if (h >= 12 && h < 17)
    return { icon: "☀️", text: "Afternoon frequency locked in." };
  if (h >= 17 && h < 21)
    return { icon: "🌇", text: "Evening desk is lit." };
  return { icon: "🌙", text: "Late-night broadcast is live." };
}

export function HeroGreeting() {
  const [g, setG] = useState({
    icon: "🌙",
    text: "Late-night broadcast is live.",
  });

  useEffect(() => {
    setG(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <div className="hero-greeting">
      <span className="greeting-icon" aria-hidden>
        {g.icon}
      </span>
      <span className="greeting-text">
        <span className="time-emote">{g.text}</span>
      </span>
    </div>
  );
}
