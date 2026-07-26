import React, { useEffect, useRef } from 'react';

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulation resolution (lower resolution upscaled via canvas size for performance)
    const simWidth = 160;
    const simHeight = 120;
    
    let buffer1 = new Float32Array(simWidth * simHeight);
    let buffer2 = new Float32Array(simWidth * simHeight);
    let tempBuffer = new Float32Array(simWidth * simHeight);
    const damping = 0.975;

    // Output ImageData buffer
    const imgData = ctx.createImageData(simWidth, simHeight);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Disturb water surface
    const disturb = (x: number, y: number, amount: number) => {
      // Prevent border disturbances to avoid simulation artifacts
      if (x < 3 || x >= simWidth - 3 || y < 3 || y >= simHeight - 3) return;

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const rx = x + dx;
          const ry = y + dy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const weight = 1 / (dist + 1);
          buffer1[ry * simWidth + rx] += amount * weight;
        }
      }
    };

    // Track mouse movement
    let lastX = -1;
    let lastY = -1;

    const handleMouseMove = (e: MouseEvent) => {
      // Map screen coordinates to simulation grid
      const rect = canvas.getBoundingClientRect();
      const scaleX = simWidth / rect.width;
      const scaleY = simHeight / rect.height;
      
      const mx = Math.floor((e.clientX - rect.left) * scaleX);
      const my = Math.floor((e.clientY - rect.top) * scaleY);

      if (lastX !== -1 && lastY !== -1) {
        // Calculate velocity to make faster cursor movements create bigger ripples
        const dx = mx - lastX;
        const dy = my - lastY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed > 1) {
          disturb(mx, my, Math.min(6, speed * 0.7));
        }
      } else {
        disturb(mx, my, 2.5);
      }

      lastX = mx;
      lastY = my;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = simWidth / rect.width;
      const scaleY = simHeight / rect.height;
      const mx = Math.floor((touch.clientX - rect.left) * scaleX);
      const my = Math.floor((touch.clientY - rect.top) * scaleY);

      disturb(mx, my, 3.5);
    };

    // Also trigger ripples on clicks
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = simWidth / rect.width;
      const scaleY = simHeight / rect.height;
      const mx = Math.floor((e.clientX - rect.left) * scaleX);
      const my = Math.floor((e.clientY - rect.top) * scaleY);
      disturb(mx, my, 12); // big splash on click
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchmove', handleTouchMove);

    resizeCanvas();

    // Simulation loop
    let animationFrameId: number;

    const updateSimulation = () => {
      // Propagation algorithm
      for (let y = 1; y < simHeight - 1; y++) {
        for (let x = 1; x < simWidth - 1; x++) {
          const idx = y * simWidth + x;
          
          // Neighbor sum propagation
          buffer2[idx] = (
            buffer1[idx - 1] +
            buffer1[idx + 1] +
            buffer1[idx - simWidth] +
            buffer1[idx + simWidth]
          ) * 0.5 - buffer2[idx];

          // Damping/attenuation
          buffer2[idx] *= damping;
        }
      }

      // Swap buffers
      tempBuffer = buffer1;
      buffer1 = buffer2;
      buffer2 = tempBuffer;
    };

    const render = () => {
      updateSimulation();

      // Render simulation heightmap to canvas pixels
      for (let i = 0; i < buffer1.length; i++) {
        const heightVal = buffer1[i];
        
        // Calculate slope differences (light refractions)
        const left = i % simWidth === 0 ? 0 : buffer1[i - 1];
        const right = i % simWidth === simWidth - 1 ? 0 : buffer1[i + 1];
        const top = i < simWidth ? 0 : buffer1[i - simWidth];
        const bottom = i >= buffer1.length - simWidth ? 0 : buffer1[i + simWidth];

        // Normal estimation/slope
        const dx = right - left;
        const dy = bottom - top;
        const shade = Math.floor((dx + dy) * 96); // scale displacement

        const pixelIndex = i * 4;

        // Draw watery neon blue/cyan ripples
        // Base color is a deep ocean blue, adding white highlight shadows based on ripples
        imgData.data[pixelIndex] = Math.min(255, Math.max(0, 0 + shade));      // Red
        imgData.data[pixelIndex + 1] = Math.min(255, Math.max(0, 102 + shade * 1.5)); // Green (neon cyan scale)
        imgData.data[pixelIndex + 2] = Math.min(255, Math.max(0, 255 + shade));      // Blue
        
        // Muted transparency to blend nicely over the data center background
        const heightMagnitude = Math.abs(heightVal);
        imgData.data[pixelIndex + 3] = Math.min(100, Math.max(0, 15 + heightMagnitude * 400 + Math.abs(shade) * 2)); // Alpha
      }

      // Draw low-res image onto canvas, browser automatically stretches and smooths it
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = simWidth;
      tempCanvas.height = simHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(imgData, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 bg-transparent select-none"
      style={{ imageRendering: 'auto' }}
    />
  );
};
