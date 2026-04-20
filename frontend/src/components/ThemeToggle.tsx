"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");

    // meta theme-color 업데이트
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next ? "#f5f0e8" : "#0a0a1a");
  };

  return (
    <button
      onClick={toggle}
      className="text-gold/50 text-lg cursor-pointer transition-transform active:scale-90"
      aria-label="테마 전환"
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}
