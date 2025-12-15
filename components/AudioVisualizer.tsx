import React, { useRef, useEffect } from 'react';
import { AudioVisualizerProps } from '../types';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, frequencyData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!isRecording || !frequencyData) {
        // Draw idle line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#e5e7eb'; // gray-200
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      const barWidth = (width / frequencyData.length) * 2.5;
      let x = 0;

      for (let i = 0; i < frequencyData.length; i++) {
        const barHeight = (frequencyData[i] / 255) * height;

        // Use a gradient
        const gradient = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
        gradient.addColorStop(0, '#34d399');
        gradient.addColorStop(1, '#059669');

        ctx.fillStyle = gradient;
        
        // Center the bars vertically
        const y = (height - barHeight) / 2;
        
        // Draw rounded bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();

        x += barWidth + 1;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isRecording, frequencyData]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={60} 
      className="w-full h-[60px] rounded-lg bg-white/50 backdrop-blur-sm"
    />
  );
};
