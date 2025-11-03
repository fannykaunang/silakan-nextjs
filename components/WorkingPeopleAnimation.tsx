// components/WorkingPeopleAnimation.tsx
// Animated SVG of 2 people working on computers

"use client";
import React, { useEffect, useState } from "react";

interface WorkingPeopleAnimationProps {
  theme?: "light" | "dark";
  className?: string;
}

export default function WorkingPeopleAnimation({
  theme = "dark",
  className = "",
}: WorkingPeopleAnimationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Skin tones
  const papuaSkin = "#8B4513"; // Papua (coklat gelap)
  const sawoMatangSkin = "#D2691E"; // Sawo matang

  // Theme colors
  const colors = {
    bg: theme === "light" ? "#ffffff" : "#1f2937",
    desk: theme === "light" ? "#9ca3af" : "#4b5563",
    laptop: theme === "light" ? "#6b7280" : "#374151",
    screen: theme === "light" ? "#3b82f6" : "#60a5fa",
    chair: theme === "light" ? "#6366f1" : "#818cf8",
    hair: "#1f2937",
    shirt1: "#3b82f6",
    shirt2: "#10b981",
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg">
        {/* Styles for animations */}
        <defs>
          <style>{`
            @keyframes typing {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-3px); }
            }
            
            @keyframes blink {
              0%, 49%, 100% { opacity: 1; }
              50%, 99% { opacity: 0; }
            }
            
            @keyframes screenGlow {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 0.6; }
            }
            
            @keyframes mouseMove {
              0%, 100% { transform: translate(0, 0); }
              25% { transform: translate(5px, -2px); }
              50% { transform: translate(-3px, 3px); }
              75% { transform: translate(3px, -3px); }
            }
            
            .hand-typing {
              animation: typing 0.5s ease-in-out infinite;
            }
            
            .eyes-blink {
              animation: blink 3s ease-in-out infinite;
            }
            
            .screen-glow {
              animation: screenGlow 2s ease-in-out infinite;
            }
            
            .mouse-move {
              animation: mouseMove 4s ease-in-out infinite;
            }
          `}</style>
        </defs>

        {/* Background */}
        <rect width="800" height="400" fill="transparent" />

        {/* Person 1 - Papua (Left) */}
        <g id="person1" transform="translate(150, 100)">
          {/* Chair */}
          <rect
            x="-40"
            y="120"
            width="80"
            height="100"
            rx="10"
            fill={colors.chair}
            opacity="0.8"
          />
          <rect
            x="-40"
            y="210"
            width="20"
            height="60"
            rx="5"
            fill={colors.chair}
            opacity="0.6"
          />
          <rect
            x="20"
            y="210"
            width="20"
            height="60"
            rx="5"
            fill={colors.chair}
            opacity="0.6"
          />

          {/* Desk */}
          <rect
            x="-80"
            y="150"
            width="200"
            height="15"
            rx="5"
            fill={colors.desk}
            opacity="0.9"
          />

          {/* Laptop */}
          <g id="laptop1">
            {/* Laptop base */}
            <rect
              x="-30"
              y="135"
              width="80"
              height="10"
              rx="2"
              fill={colors.laptop}
            />
            {/* Laptop screen */}
            <rect
              x="-25"
              y="80"
              width="70"
              height="55"
              rx="3"
              fill={colors.laptop}
            />
            {/* Screen display */}
            <rect
              x="-20"
              y="85"
              width="60"
              height="45"
              rx="2"
              fill={colors.screen}
              className="screen-glow"
            />
            {/* Screen content lines */}
            <rect
              x="-15"
              y="90"
              width="30"
              height="2"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="-15"
              y="95"
              width="40"
              height="2"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="-15"
              y="100"
              width="35"
              height="2"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="-15"
              y="105"
              width="25"
              height="2"
              fill="#ffffff"
              opacity="0.7"
            />
          </g>

          {/* Body */}
          <ellipse cx="0" cy="100" rx="35" ry="45" fill={colors.shirt1} />

          {/* Arms */}
          <ellipse
            cx="-25"
            cy="110"
            rx="12"
            ry="35"
            fill={colors.shirt1}
            transform="rotate(-20 -25 110)"
          />
          <ellipse
            cx="25"
            cy="110"
            rx="12"
            ry="35"
            fill={colors.shirt1}
            transform="rotate(20 25 110)"
          />

          {/* Hands on keyboard */}
          <g className="hand-typing">
            <ellipse cx="-20" cy="145" rx="8" ry="6" fill={papuaSkin} />
            <ellipse cx="20" cy="145" rx="8" ry="6" fill={papuaSkin} />
          </g>

          {/* Neck */}
          <rect x="-8" y="50" width="16" height="20" fill={papuaSkin} />

          {/* Head */}
          <circle cx="0" cy="30" r="25" fill={papuaSkin} />

          {/* Hair */}
          <ellipse cx="0" cy="15" rx="26" ry="20" fill={colors.hair} />

          {/* Eyes */}
          <g className="eyes-blink">
            <circle cx="-8" cy="28" r="3" fill="#ffffff" />
            <circle cx="-8" cy="28" r="1.5" fill="#000000" />
            <circle cx="8" cy="28" r="3" fill="#ffffff" />
            <circle cx="8" cy="28" r="1.5" fill="#000000" />
          </g>

          {/* Mouth */}
          <path
            d="M -6 38 Q 0 42 6 38"
            stroke={colors.hair}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Person 2 - Sawo Matang (Right) */}
        <g id="person2" transform="translate(550, 100)">
          {/* Chair */}
          <rect
            x="-40"
            y="120"
            width="80"
            height="100"
            rx="10"
            fill={colors.chair}
            opacity="0.8"
          />
          <rect
            x="-40"
            y="210"
            width="20"
            height="60"
            rx="5"
            fill={colors.chair}
            opacity="0.6"
          />
          <rect
            x="20"
            y="210"
            width="20"
            height="60"
            rx="5"
            fill={colors.chair}
            opacity="0.6"
          />

          {/* Desk */}
          <rect
            x="-100"
            y="150"
            width="200"
            height="15"
            rx="5"
            fill={colors.desk}
            opacity="0.9"
          />

          {/* Laptop */}
          <g id="laptop2">
            <rect
              x="-30"
              y="135"
              width="80"
              height="10"
              rx="2"
              fill={colors.laptop}
            />
            <rect
              x="-25"
              y="80"
              width="70"
              height="55"
              rx="3"
              fill={colors.laptop}
            />
            <rect
              x="-20"
              y="85"
              width="60"
              height="45"
              rx="2"
              fill={colors.screen}
              className="screen-glow"
            />
            <rect
              x="-15"
              y="90"
              width="35"
              height="2"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="-15"
              y="95"
              width="45"
              height="2"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="-15"
              y="100"
              width="30"
              height="2"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="-15"
              y="105"
              width="40"
              height="2"
              fill="#ffffff"
              opacity="0.7"
            />
          </g>

          {/* Mouse (animated) */}
          <g className="mouse-move">
            <ellipse
              cx="60"
              cy="145"
              rx="8"
              ry="10"
              fill={colors.laptop}
              opacity="0.8"
            />
          </g>

          {/* Body */}
          <ellipse cx="0" cy="100" rx="35" ry="45" fill={colors.shirt2} />

          {/* Arms */}
          <ellipse
            cx="-25"
            cy="110"
            rx="12"
            ry="35"
            fill={colors.shirt2}
            transform="rotate(-20 -25 110)"
          />
          <ellipse
            cx="25"
            cy="110"
            rx="12"
            ry="35"
            fill={colors.shirt2}
            transform="rotate(20 25 110)"
          />

          {/* Left hand typing */}
          <ellipse
            cx="-20"
            cy="145"
            rx="8"
            ry="6"
            fill={sawoMatangSkin}
            className="hand-typing"
          />

          {/* Right hand on mouse */}
          <ellipse
            cx="55"
            cy="145"
            rx="8"
            ry="6"
            fill={sawoMatangSkin}
            className="mouse-move"
          />

          {/* Neck */}
          <rect x="-8" y="50" width="16" height="20" fill={sawoMatangSkin} />

          {/* Head */}
          <circle cx="0" cy="30" r="25" fill={sawoMatangSkin} />

          {/* Hair */}
          <ellipse cx="0" cy="15" rx="26" ry="20" fill={colors.hair} />

          {/* Eyes */}
          <g className="eyes-blink">
            <circle cx="-8" cy="28" r="3" fill="#ffffff" />
            <circle cx="-8" cy="28" r="1.5" fill="#000000" />
            <circle cx="8" cy="28" r="3" fill="#ffffff" />
            <circle cx="8" cy="28" r="1.5" fill="#000000" />
          </g>

          {/* Smile */}
          <path
            d="M -6 38 Q 0 42 6 38"
            stroke={colors.hair}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Floating code particles */}
        <g opacity="0.3">
          <text
            x="100"
            y="50"
            fill={colors.screen}
            fontSize="20"
            className="screen-glow">
            {"<>"}
          </text>
          <text
            x="650"
            y="70"
            fill={colors.screen}
            fontSize="18"
            className="screen-glow">
            {"{ }"}
          </text>
          <text
            x="300"
            y="80"
            fill={colors.screen}
            fontSize="16"
            className="screen-glow">
            01
          </text>
          <text
            x="500"
            y="60"
            fill={colors.screen}
            fontSize="14"
            className="screen-glow">
            {"</>"}
          </text>
          <text
            x="200"
            y="350"
            fill={colors.screen}
            fontSize="12"
            className="screen-glow">
            function()
          </text>
          <text
            x="600"
            y="340"
            fill={colors.screen}
            fontSize="12"
            className="screen-glow">
            data
          </text>
        </g>
      </svg>
    </div>
  );
}
