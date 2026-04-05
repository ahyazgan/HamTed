import { useState, useRef, useEffect } from "react";
import { getTrendLabel } from "../data/market";

export default function PriceChart({ history, unit, trend }) {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [range, setRange] = useState(30);

  const data = history.slice(-range);
  const trendInfo = getTrendLabel(trend);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;

    const prices = data.map(d => d.price);
    const min = Math.min(...prices) * 0.998;
    const max = Math.max(...prices) * 1.002;
    const rangeY = max - min || 1;

    const xStep = cw / (data.length - 1);
    const getY = (price) => ch - 30 - ((price - min) / rangeY) * (ch - 50);

    // Clear
    ctx.clearRect(0, 0, cw, ch);

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border").trim() || "#E8E5DF";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const y = 20 + i * ((ch - 50) / 4);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cw, y);
      ctx.stroke();
      // Label
      const val = max - (i / 4) * rangeY;
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-ter").trim() || "#A09E96";
      ctx.font = "9px Outfit";
      ctx.fillText(val.toFixed(1), 4, y - 3);
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    const isUp = prices[prices.length - 1] >= prices[0];
    const lineColor = isUp ? "#2E7D42" : "#B0423A";
    grad.addColorStop(0, lineColor + "20");
    grad.addColorStop(1, lineColor + "02");

    ctx.beginPath();
    ctx.moveTo(0, getY(prices[0]));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(i * xStep, getY(prices[i]));
    }
    ctx.lineTo((data.length - 1) * xStep, ch - 30);
    ctx.lineTo(0, ch - 30);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(0, getY(prices[0]));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(i * xStep, getY(prices[i]));
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // End dot
    const lastX = (data.length - 1) * xStep;
    const lastY = getY(prices[prices.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

    // Date labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-ter").trim() || "#A09E96";
    ctx.font = "9px Outfit";
    [0, Math.floor(data.length / 2), data.length - 1].forEach(i => {
      if (data[i]) {
        const d = data[i].date.slice(5);
        ctx.fillText(d, i * xStep, ch - 8);
      }
    });
  }, [data, range]);

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const idx = Math.round((x / rect.width) * (data.length - 1));
    if (data[idx]) {
      setTooltip({ x, date: data[idx].date, price: data[idx].price });
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-range">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setRange(d)} className={`chart-range-btn ${range === d ? "chart-range-active" : ""}`}>{d}G</button>
          ))}
        </div>
        <div className="chart-trend" style={{ color: trendInfo.color }}>
          {trendInfo.icon} {trendInfo.text}
        </div>
      </div>
      <div className="chart-wrap" onMouseMove={handleMouse} onMouseLeave={() => setTooltip(null)}>
        <canvas ref={canvasRef} className="chart-canvas" />
        {tooltip && (
          <div className="chart-tooltip" style={{ left: Math.min(tooltip.x, 260) }}>
            <div className="chart-tooltip-date">{tooltip.date}</div>
            <div className="chart-tooltip-price">{tooltip.price.toLocaleString("tr-TR")} {unit}</div>
          </div>
        )}
      </div>
    </div>
  );
}
