import React, { useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  
  const [{ scroll }, api] = useSpring(() => ({
    scroll: 0,
    config: { mass: 1, tension: 280, friction: 60 }
  }));

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      api.start({ scroll: scrollY });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [api]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gridSize = 30;
    const cellSize = Math.max(canvas.width, canvas.height) / gridSize;
    
    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.1)';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += cellSize) {
        for (let y = 0; y < canvas.height; y += cellSize) {
          const time = Date.now() * 0.001;
          const distanceFromCenter = Math.sqrt(
            Math.pow(x - canvas.width / 2, 2) + 
            Math.pow(y - canvas.height / 2, 2)
          );
          
          const angle = Math.atan2(y - canvas.height / 2, x - canvas.width / 2);
          const wave = Math.sin(distanceFromCenter * 0.02 - time) * 5;
          
          ctx.beginPath();
          ctx.arc(
            x + Math.cos(angle + time) * wave,
            y + Math.sin(angle + time) * wave,
            2,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(147, 51, 234, ${0.1 + Math.sin(time + distanceFromCenter * 0.005) * 0.05})`;
          ctx.fill();
        }
      }
    };

    let animationFrame;
    const animate = () => {
      drawGrid();
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <animated.div
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
          transform: scroll.to(y => `translateY(${y * 0.1}px)`),
          zIndex: 1
        }}
      />
    </>
  );
};

export default AnimatedBackground;