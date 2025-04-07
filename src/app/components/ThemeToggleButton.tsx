// src/app/components/ThemeToggleButton.tsx
'use client';
import { useTheme } from "@/app/context/ThemeContext";
import { SunFill, MoonFill } from "react-bootstrap-icons";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="btn btn-outline-dark">
      {theme === "dark" ? <SunFill /> : <MoonFill />}
    </button>
  );
}

