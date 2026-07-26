import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [ringPosition, setRingPosition] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const cursorRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if device supports touch input
    const checkMobile = () => {
      const touchCapable = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0;
      setIsMobile(touchCapable);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('a') ||
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.closest('[role="button"]') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        setHovered(true);
      }
    };

    const handleMouseOut = () => {
      setHovered(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    // Dynamic animation loop for the trailing ring using spring lerp dynamics
    const updateRing = () => {
      const ease = 0.15; // Spring dynamics damping factor
      const targetX = cursorRef.current.x;
      const targetY = cursorRef.current.y;

      const currentX = ringRef.current.x;
      const currentY = ringRef.current.y;

      // Lerp logic
      const nextX = currentX + (targetX - currentX) * ease;
      const nextY = currentY + (targetY - currentY) * ease;

      ringRef.current = { x: nextX, y: nextY };
      setRingPosition({ x: nextX, y: nextY });

      requestRef.current = requestAnimationFrame(updateRing);
    };

    requestRef.current = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <div
        className={`custom-cursor-ring ${hovered ? 'hovered' : ''}`}
        style={{
          left: `${ringPosition.x}px`,
          top: `${ringPosition.y}px`,
        }}
      />
      <div
        className={`custom-cursor-dot ${hovered ? 'hovered' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
};
