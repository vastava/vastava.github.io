// import React, { useEffect, useRef } from 'react';

// export default function MarginCanvas2() {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     const updateCanvasSize = () => {
//       canvas.width = window.innerHeight;
//       canvas.height = window.innerHeight;
//     };

//     updateCanvasSize();
//     window.addEventListener('resize', updateCanvasSize);

//     let t = 0;
//     let scrollHeight = window.scrollY;

//     const handleScroll = () => {
//       scrollHeight = window.scrollY;
//     };

//     window.addEventListener('scroll', handleScroll);

//     function draw() {
//       t += 1;
//       ctx.fillStyle = 'rgba(255,255,255,1)';
//       ctx.fillRect(0, 0, window.innerHeight, window.innerHeight);
//       ctx.strokeStyle = 'rgba(0,0,0,.5)';
      
//       const maxHeight = window.innerHeight;
//       const scrollPercent = Math.min(scrollHeight / (document.documentElement.scrollHeight - window.innerHeight), 1);
//       let ht = maxHeight * (0.5 + scrollPercent * 0.5);

//       ctx.beginPath();
//       for (let i = 0; i < window.innerHeight; i++) {
//         ctx.lineTo(
//           i,
//           ht + Math.sin(i * 0.01 + t * 0.05) * 20
//         );
//       }
//       ctx.stroke();
//     }

//     let animationFrameId;

//     const render = () => {
//       draw();
//       animationFrameId = window.requestAnimationFrame(render);
//     };
//     render();

//     return () => {
//       window.cancelAnimationFrame(animationFrameId);
//       window.removeEventListener('resize', updateCanvasSize);
//       window.removeEventListener('scroll', handleScroll);
//     };
//   }, []);

//   return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
// }

'use client';
import { useEffect, useRef } from 'react';

export default function MarginCanvas2() {
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
    let t = 0;

    function draw() {
      t += 1;
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fillRect(0, 0, window.innerHeight, window.innerHeight);
      ctx.strokeStyle = 'rgba(0,0,0,.5)';
      let ht = window.innerHeight/1;

      for (let j = 1; j < 20; j++) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${j/20 * 360}, 80%, 80%, .8)`;
        
        for (let i = 0; i < ht; i++) {
          const percent_height = i/ht;
          const c = (-Math.pow(2 * percent_height - 1, 2) + 1);
          const x = 250 + Math.sin(-t/50 + (j/10) + i/50) * 50 * c;
          const y = i === 0 ? i : i;
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
      }
      
      animationFrameId = window.requestAnimationFrame(draw);
    }
    
    draw();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
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
        left: 0,
        pointerEvents: 'none',
        opacity: 0.5
      }}
    />
  );
}