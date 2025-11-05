// components/ui/PageTransition.tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fade out
    setIsVisible(false);

    // Fade in after route change (using requestAnimationFrame instead of setTimeout)
    let animationFrame: number;
    const fadeIn = () => {
      animationFrame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
    };

    fadeIn();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [pathname]);

  return (
    <div
      className={`transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}>
      {children}
    </div>
  );
}
