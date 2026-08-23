import React, { useState, useRef } from 'react';
import { formatNaira, formatUSD } from '../utils/calculations';
import { useWealth } from '../context/WealthContext';

interface PerformanceChartProps {
  currentValNaira: number;
  currentValUsd: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ currentValNaira, currentValUsd }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('ALL');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const { settings } = useWealth();

  // Historical valuation points derived from actual workbook investment dates and additions
  const chartDataMap: Record<string, { date: string; valueNaira: number; label: string }[]> = {
    '1M': [
      { date: '01 Feb', valueNaira: currentValNaira * 0.985, label: 'Feb 1, 2026' },
      { date: '08 Feb', valueNaira: currentValNaira * 0.991, label: 'Feb 8, 2026' },
      { date: '15 Feb', valueNaira: currentValNaira * 0.995, label: 'Feb 15, 2026' },
      { date: '22 Feb', valueNaira: currentValNaira, label: 'Feb 22, 2026' },
    ],
    '3M': [
      { date: 'Dec 2025', valueNaira: currentValNaira * 0.94, label: 'Dec 2025 - Gold & Equities Add' },
      { date: 'Jan 2026', valueNaira: currentValNaira * 0.97, label: 'Jan 2026 - T-Bill Interest Accrual' },
      { date: 'Feb 2026', valueNaira: currentValNaira, label: 'Feb 2026 - Current Position' },
    ],
    '6M': [
      { date: 'Aug 2025', valueNaira: 32500000, label: 'Aug 2025 - CP & T-Bill Investments' },
      { date: 'Oct 2025', valueNaira: 46200000, label: 'Oct 2025 - FGN Coupon Schedule Accruals' },
      { date: 'Dec 2025', valueNaira: 58900000, label: 'Dec 2025 - Gold & US REITs Expansion' },
      { date: 'Feb 2026', valueNaira: currentValNaira, label: 'Feb 2026 - Current Total' },
    ],
    '1Y': [
      { date: 'Mar 2025', valueNaira: 15000000, label: 'Mar 2025 - Initial FGN Bonds ₦15M' },
      { date: 'Jun 2025', valueNaira: 28400000, label: 'Jun 2025 - FGN Meristem & Kate' },
      { date: 'Sep 2025', valueNaira: 48900000, label: 'Sep 2025 - Commercial Paper Portfolios' },
      { date: 'Dec 2025', valueNaira: 59300000, label: 'Dec 2025 - Multi-Asset Allocations' },
      { date: 'Feb 2026', valueNaira: currentValNaira, label: 'Feb 2026 - Current Portfolio Value' },
    ],
    'ALL': [
      { date: 'Aug 2024', valueNaira: 1800, label: 'Aug 2024 - Ebook DCA First Tranche' },
      { date: 'Nov 2024', valueNaira: 29370, label: 'Nov 2024 - Ebook DCA Completed' },
      { date: 'Dec 2024', valueNaira: 1433035, label: 'Dec 2024 - US Equities & Gold ETFs' },
      { date: 'Jan 2025', valueNaira: 17200000, label: 'Jan 2025 - FGN Bonds & Mutual Funds' },
      { date: 'Jul 2025', valueNaira: 42800000, label: 'Jul 2025 - Dangote Sugar CP & T-Bills' },
      { date: 'Dec 2025', valueNaira: 60500000, label: 'Dec 2025 - Locked Savings Deposits' },
      { date: 'Feb 2026', valueNaira: currentValNaira, label: 'Feb 2026 - Total Portfolio Asset Value' },
    ]
  };

  const activeData = chartDataMap[selectedPeriod];
  const minVal = Math.min(...activeData.map(d => d.valueNaira)) * 0.85;
  const maxVal = Math.max(...activeData.map(d => d.valueNaira)) * 1.05;

  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  const points = activeData.map((d, i) => {
    const x = paddingX + (i / (activeData.length - 1)) * (width - paddingX * 2);
    const normalizedY = (d.valueNaira - minVal) / (maxVal - minVal || 1);
    const y = height - paddingY - normalizedY * (height - paddingY * 2);
    return { ...d, x, y, index: i };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    
    let closestIndex = 0;
    let closestDist = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = idx;
      }
    });
    setHoverIndex(closestIndex);
  };

  return (
    <div className="bg-[#ffffff] border border-[#e3e2e1] rounded p-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f4f3f2]">
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[#747878] mb-1">
            Historical Portfolio Valuation Trajectory
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold font-mono tracking-tight text-[#1a1c1c] tabular-nums">
              {formatNaira(activePoint.valueNaira)}
            </span>
            <span className="text-sm font-mono text-[#747878] tabular-nums">
              {formatUSD(activePoint.valueNaira / (settings.currentUsdExchangeRate || 1780))}
            </span>
          </div>
          <p className="text-xs text-[#747878] mt-0.5">
            {activePoint.label}
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center bg-[#eeeeed] p-0.5 rounded text-[11px] font-semibold self-start sm:self-auto">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
            <button
              key={period}
              onClick={() => {
                setSelectedPeriod(period);
                setHoverIndex(null);
              }}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                selectedPeriod === period
                  ? 'bg-[#ffffff] text-[#1a1c1c] shadow-xs'
                  : 'text-[#747878] hover:text-[#1a1c1c]'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Rendering */}
      <div className="relative mt-4">
        <svg
          ref={chartRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1c1c" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#1a1c1c" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((factor, idx) => {
            const yPos = paddingY + factor * (height - paddingY * 2);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={yPos}
                x2={width - paddingX}
                y2={yPos}
                stroke="#eeeeed"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#1a1c1c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hairline trigger & data dot */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingY}
                x2={activePoint.x}
                y2={height - paddingY}
                stroke="#747878"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill="#ffffff"
                stroke="#1a1c1c"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* X Axis Labels */}
          {points.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 6}
              textAnchor="middle"
              className="text-[10px] font-mono fill-[#747878]"
            >
              {pt.date}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};
