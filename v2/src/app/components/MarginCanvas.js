'use client';
import { useEffect, useRef } from 'react';

export default function MarginCanvas() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const updateCanvasSize = () => {
      canvas.width = 500;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    let animationFrameId;
    let startTime = Date.now();
    let scrollHeight = window.scrollY;

    const handleScroll = () => {
      scrollHeight = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    function draw() {
      const now = Date.now() - startTime;
      
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fillRect(0,0,window.innerHeight,window.innerHeight);
      ctx.strokeStyle = 'rgba(0,0,0,.5)';
      
      const maxHeight = window.innerHeight;
      const scrollPercent = Math.min(scrollHeight / (document.documentElement.scrollHeight - window.innerHeight), 1);
      let ht = maxHeight * (0.5 + scrollPercent * 0.5);
      
      for (let i=1; i<20; ++i) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${i/20 *  360}, 80%, 80%, 1)`;

        for (let j=0; j<(ht); ++j) {
          const pct_height = j/ht;
          const c = ((2*pct_height) ** 2);
          const x = 250 + Math.sin(-now/500 + (i/9) + j/50) * 50 * c;
          const y = j === 0 ? j : j + ht/3;
          ctx.lineTo(x,y);
        }

        ctx.stroke();
      }
      
      animationFrameId = window.requestAnimationFrame(draw);
    }
    
    draw();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={window.innerHeight}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        pointerEvents: 'none',
        opacity: 0.5
      }}
    />
  );
}