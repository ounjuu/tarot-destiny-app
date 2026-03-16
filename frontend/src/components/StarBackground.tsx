"use client";

import { useState, useEffect } from "react";

// 별이 반짝이는 배경
export default function StarBackground() {
  const [stars, setStars] = useState<
    { id: number; left: string; top: string; size: number; duration: string; delay: string }[]
  >([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        duration: `${Math.random() * 3 + 2}s`,
        delay: `${Math.random() * 3}s`,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star absolute rounded-full bg-white/70"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            "--duration": star.duration,
            "--delay": star.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
