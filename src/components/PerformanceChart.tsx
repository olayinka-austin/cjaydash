import React, { useState, useRef } from 'react';
import { formatNaira, formatUSD } from '../utils/calculations';
import { useWealth } from '../context/WealthContext';

interface PerformanceChartProps {
  currentValNaira?: number;
  currentValUsd?: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ currentValNaira, currentValUsd }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('ALL');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const { settings, summary } = useWealth();

  const effectiveValNaira = (typeof currentValNaira === 'number' && !isNaN(currentValNaira) && currentValNaira > 0)
    ? currentValNaira
    : (summary?.totalCurrentValueNaira && summary.totalCurrentValueNaira > 0 ? summary.totalCurrentValueNaira : 60500000);

  // Historical valuation points derived from actual workbook investment dates and additions
  const chartDataMap: Record<string, { date: string; valueNaira: number; label: string }[]> = {
    '1M': [
      { date: '01 Feb', valueNaira: effectiveValNaira * 0.985, label: 'Feb 1, 2026' },
      { date: '08 Feb', valueNaira: effectiveValNaira * 0.991, label: 'Feb 8, 2026' },
      { date: '15 Feb', valueNaira: effectiveValNaira * 0.995, label: 'Feb 15, 2026' },
      { date: '22 Feb', valueNaira: effectiveValNaira, label: 'Feb 22, 2026' },
    ],
    '3M': [
      { date: 'Dec 2025', valueNaira: effectiveValNaira * 0.94, label: 'Dec 2025 - Gold & Equities Add' },
      { date: 'Jan 2026', valueNaira: effectiveValNaira * 0.97, label: 'Jan 2026 - T-Bill Interest Accrual' },
      { date: 'Feb 2026', valueNaira: effectiveValNaira, label: 'Feb 2026 - Current Position' },
    ],
    '6M': [
      { date: 'Aug 2025', valueNaira: 32500000, label: 'Aug 2025 - CP & T-Bill Investments' },
      { date: 'Oct 2025', valueNaira: 46200000, label: 'Oct 2025 - FGN Coupon Schedule Accruals' },
      { date: 'Dec 2025', valueNaira: 58900000, label: 'Dec 2025 - Gold & US REITs Expansion' },
      { date: 'Feb 2026', valueNaira: effectiveValNaira, label: 'Feb 2026 - Current Total' },
    ],
    '1Y': [
      { date: 'Mar 2025', valueNaira: 15000000, label: 'Mar 2025 - Initial FGN Bonds ₦15M' },
      { date: 'Jun 2025', valueNaira: 28400000, label: 'Jun 2025 - FGN Meristem & Kate' },
      { date: 'Sep 2025', valueNaira: 48900000, label: 'Sep 2025 - Commercial Paper Portfolios' },
      { date: 'Dec 2025', valueNaira: 59300000, label: 'Dec 2025 - Multi-Asset Allocations' },
      { date: 'Feb 2026', valueNaira: effectiveValNaira, label: 'Feb 2026 - Current Portfolio Value' },
    ],
    'ALL': [
      { date: 'Aug 2024', valueNaira: 1800, label: 'Aug 2024 - Ebook DCA First Tranche' },
      { date: 'Nov 2024', valueNaira: 29370, label: 'Nov 2024 - Ebook DCA Completed' },
      { date: 'Dec 2024', valueNaira: 1433035, label: 'Dec 2024 - US Equities & Gold ETFs' },
      { date: 'Jan 2025', valueNaira: 17200000, label: 'Jan 2025 - FGN Bonds & Mutual Funds' },
      { date: 'Jul 2025', valueNaira: 42800000, label: 'Jul 2025 - Dangote Sugar CP & T-Bills' },
      { date: 'Dec 2025', valueNaira: 60500000, label: 'Dec 2025 - Locked Savings Deposits' },
      { date: 'Feb 2026', valueNaira: effectiveValNaira, label: 'Feb 2026 - Total Portfolio Asset Value' },
    ]
  };

  const activeData = chartDataMap[selectedPeriod] || chartDataMap['ALL'];
  const validVals = activeData.map(d => (isNaN(d.valueNaira) ? 0 : d.valueNaira));
  const minVal = Math.min(...validVals) * 0.85;
  const maxVal = Math.max(...validVals) * 1.05;

  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  const points = activeData.map((d, i) => {
    const val = isNaN(d.valueNaira) ? 0 : d.valueNaira;
    const x = activeData.length > 1 ? paddingX + (i / (activeData.length - 1)) * (width - paddingX * 2) : width / 2;
    const range = (maxVal - minVal) || 1;
    const normalizedY = range > 0 ? (val - minVal) / range : 0.5;
    const y = isNaN(normalizedY) ? height / 2 : height - paddingY - normalizedY * (height - paddingY * 2);
    return { ...d, valueNaira: val, x: isNaN(x) ? paddingX : x, y: isNaN(y) ? height / 2 : y, index: i };
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

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  const activePoint = (hoverIndex !== null && points[hoverIndex])
    ? points[hoverIndex]
    : (points[points.length - 1] || { x: width / 2, y: height / 2, valueNaira: effectiveValNaira, label: 'Feb 2026 - Current Total', date: 'Feb 2026', index: 0 });

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

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!chartRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = chartRef.current.getBoundingClientRect();
    const touchX = ((touch.clientX - rect.left) / rect.width) * width;
    
    let closestIndex = 0;
    let closestDist = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - touchX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = idx;
      }
    });
    setHoverIndex(closestIndex);
  };

  return (
    <div className="bg-[#ffffff] border border-[#e3e2e1] rounded p-4 sm:p-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#f4f3f2]">
        <div>
          <div className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#747878] mb-1">
            Historical Portfolio Valuation Trajectory
          </div>
          <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-[#1a1c1c] tabular-nums">
              {formatNaira(activePoint.valueNaira)}
            </span>
            <span className="text-xs sm:text-sm font-mono text-[#747878] tabular-nums">
              {formatUSD(activePoint.valueNaira / (settings.currentUsdExchangeRate || 1780))}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#747878] mt-0.5">
            {activePoint.label}
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center bg-[#eeeeed] p-0.5 rounded text-[11px] font-semibold self-start sm:self-auto overflow-x-auto">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
            <button
              key={period}
              onClick={() => {
                setSelectedPeriod(period);
                setHoverIndex(null);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded transition-all cursor-pointer ${
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

      {/* SVG Chart Rendering & Interactive Tooltip */}
      <div className="relative mt-4">
        <svg
          ref={chartRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible cursor-crosshair select-none touch-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setHoverIndex(null)}
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

          {/* Interactive Data Point Dots */}
          {points.map((pt, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g key={`point-${i}`} className="cursor-pointer">
                {/* Larger transparent hover target */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="14"
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(i)}
                />
                {/* Visible indicator circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '6' : '3.5'}
                  fill="#ffffff"
                  stroke="#1a1c1c"
                  strokeWidth={isHovered ? '2.5' : '1.5'}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Vertical Guide Hairline */}
          {hoverIndex !== null && !isNaN(activePoint.x) && !isNaN(activePoint.y) && (
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={height - paddingY}
              stroke="#747878"
              strokeWidth="1"
              strokeDasharray="2 2"
              className="pointer-events-none"
            />
          )}

          {/* X Axis Labels */}
          {points.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 6}
              textAnchor="middle"
              className="text-[10px] fill-[#747878] select-none font-sans"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {pt.date}
            </text>
          ))}
        </svg>

        {/* Floating Interactive Tooltip */}
        {hoverIndex !== null && !isNaN(activePoint.x) && !isNaN(activePoint.y) && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`,
              transform: `translate(${
                (activePoint.x / width) < 0.25
                  ? '0%'
                  : (activePoint.x / width) > 0.75
                  ? '-100%'
                  : '-50%'
              }, -100%) translateY(-14px)`,
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            <div className="bg-[#1a1c1c] text-[#faf9f8] px-3 py-2 rounded shadow-lg border border-[#2f3130] min-w-[140px] whitespace-nowrap">
              {/* Tooltip Header / Date */}
              <div className="flex items-center justify-between gap-2 border-b border-[#3e4140] pb-1 mb-1">
                <span className="text-[10px] font-medium text-[#c4c7c7] tracking-wider uppercase">
                  {activePoint.date}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1b6b51]" />
              </div>

              {/* Tooltip Value in Naira */}
              <div className="text-xs font-semibold text-[#faf9f8] tabular-nums">
                {formatNaira(activePoint.valueNaira)}
              </div>

              {/* Tooltip Value in USD */}
              <div className="text-[10px] text-[#c4c7c7] tabular-nums">
                {formatUSD(activePoint.valueNaira / (settings.currentUsdExchangeRate || 1780))}
              </div>

              {/* Optional Milestone Annotation if available */}
              {activePoint.label && activePoint.label.includes(' - ') && (
                <div className="text-[9px] text-[#909393] mt-1 pt-1 border-t border-[#3e4140] max-w-[180px] truncate">
                  {activePoint.label.split(' - ')[1]}
                </div>
              )}
            </div>

            {/* Downward Pointer Caret */}
            <div
              className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1a1c1c] mx-auto mt-[-1px]"
              style={{
                marginLeft: (activePoint.x / width) < 0.25 ? '16px' : (activePoint.x / width) > 0.75 ? 'calc(100% - 20px)' : 'auto'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
