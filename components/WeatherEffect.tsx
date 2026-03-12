import React, { useEffect, useRef, useState } from 'react';

interface WeatherEffectProps {
  rainfall: number; // mm
  windLevel: number; // level
}

interface Particle {
  x: number;
  y: number;
  z: number; // depth (0.2 - 1.0)
  l: number; // length
  xs: number; // x speed
  ys: number; // y speed
}

export const WeatherEffect: React.FC<WeatherEffectProps> = ({ rainfall, windLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { clientWidth, clientHeight } = canvasRef.current.parentElement;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    
    window.addEventListener('resize', handleResize);
    // Initial size
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    
    // Rain intensity mapping
    const isRain = rainfall > 0.1;
    
    let particleCount = 0;
    if (isRain) {
       particleCount = Math.min(2000, Math.max(50, Math.floor(rainfall * 25)));
    } else if (windLevel > 2) {
       // Only show wind effect if wind is significant (Level 2+)
       particleCount = Math.min(150, Math.max(20, windLevel * 15));
    }
    
    // Wind factor
    const windFactor = Math.min(3.0, windLevel * 0.3); 

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const createParticle = (): Particle => {
      const z = Math.random() * 0.8 + 0.2; // Depth
      
      let p: Particle;
      
      if (isRain) {
          const speedMultiplier = z * (1 + rainfall / 150);
          p = {
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            z: z,
            l: Math.random() * 20 * z + 10,
            ys: (Math.random() * 10 + 15) * speedMultiplier,
            xs: 0
          };
          // Wind affects x-speed relative to fall speed
          p.xs = windFactor * p.ys * 0.5;
      } else {
          // Wind only (dust/air lines)
          const speed = (Math.random() * 5 + 5) * (windLevel / 2) * z;
          p = {
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            z: z,
            l: Math.random() * 50 * z + 20, // Longer lines for wind
            ys: (Math.random() - 0.5) * 2, // Slight vertical drift
            xs: speed
          };
      }

      return p;
    };

    initParticles();

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      ctx.lineWidth = isRain ? 1.5 : 1.0;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.xs, p.y + p.ys);
        
        // Opacity based on depth
        if (isRain) {
             ctx.strokeStyle = `rgba(220, 230, 255, ${p.z * 0.5})`;
        } else {
             // Wind streaks - white/gray, lower opacity
             ctx.strokeStyle = `rgba(255, 255, 255, ${p.z * 0.15})`;
        }
        ctx.stroke();

        // Move
        p.x += p.xs;
        p.y += p.ys;

        // Reset if out of bounds
        const isOutOfBounds = p.y > dimensions.height || p.y < -50 || p.x > dimensions.width || p.x < -dimensions.width;
        
        if (isOutOfBounds) {
          if (isRain) {
              p.y = -p.l;
              p.x = Math.random() * dimensions.width;
              if (windFactor > 0) p.x = Math.random() * dimensions.width - dimensions.width * 0.5;
              if (windFactor < 0) p.x = Math.random() * dimensions.width + dimensions.width * 0.5;
          } else {
              // Reset for wind (horizontal)
              p.x = -p.l; // Start from left
              p.y = Math.random() * dimensions.height;
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [rainfall, windLevel, dimensions]);

  if (rainfall <= 0 && windLevel <= 0) return null;

  return (
    <canvas 
      ref={canvasRef} 
      width={dimensions.width} 
      height={dimensions.height} 
      className="absolute inset-0 pointer-events-none z-20 mix-blend-screen opacity-90"
    />
  );
};
