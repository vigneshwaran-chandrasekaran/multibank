import { useEffect, useRef } from "react";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  positive: boolean;
}

export default function Sparkline({ data, width = 80, height = 32, positive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 3;

    const color = positive ? "#0ecb81" : "#f6465d";
    const gradColor = positive ? "rgba(14,203,129,0.15)" : "rgba(246,70,93,0.15)";

    const points = data.map((v, i) => ({
      x: pad + (i / (data.length - 1)) * (width - pad * 2),
      y: pad + ((max - v) / range) * (height - pad * 2),
    }));

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, gradColor);
    grad.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.lineTo(points[0].x, height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();
  }, [data, width, height, positive]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: "block" }}
      aria-hidden="true"
    />
  );
}
