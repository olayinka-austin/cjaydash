import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { formatNaira, formatUSD } from '../utils/calculations';

export const AllocationDonutChart: React.FC = () => {
  const { summary, setSelectedCategory, setActiveScreen } = useWealth();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const allocations = (summary?.assetAllocation || []).filter(a => a && a.valueNaira > 0);
  const totalVal = summary?.totalCurrentValueNaira || 1;

  // Compute SVG Donut paths
  let cumulativeAngle = 0;
  const radius = 70;
  const innerRadius = 46;
  const cx = 100;
  const cy = 100;

  const segments = allocations.map((item, idx) => {
    const fraction = item.valueNaira / totalVal;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const x1 = cx + radius * Math.cos(startAngle - Math.PI / 2);
    const y1 = cy + radius * Math.sin(startAngle - Math.PI / 2);
    const x2 = cx + radius * Math.cos(endAngle - Math.PI / 2);
    const y2 = cy + radius * Math.sin(endAngle - Math.PI / 2);

    const x3 = cx + innerRadius * Math.cos(endAngle - Math.PI / 2);
    const y3 = cy + innerRadius * Math.sin(endAngle - Math.PI / 2);
    const x4 = cx + innerRadius * Math.cos(startAngle - Math.PI / 2);
    const y4 = cy + innerRadius * Math.sin(startAngle - Math.PI / 2);

    const largeArc = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      pathData,
      idx
    };
  });

  const activeItem = hoveredIdx !== null ? allocations[hoveredIdx] : null;

  return (
    <div className="bg-[#ffffff] border border-[#e3e2e1] rounded p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#f4f3f2]">
        <div>
          <h2 className="text-sm font-semibold text-[#1a1c1c]">Asset Class Allocation</h2>
          <p className="text-xs text-[#747878]">Strategic distribution across 10 asset classes</p>
        </div>
        <span className="text-xs font-mono font-semibold text-[#1a1c1c]">
          {allocations.length} Active Classes
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-4">
        {/* SVG Donut Visual */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 200 200" className="w-48 h-48 overflow-visible">
            {segments.map((seg) => (
              <path
                key={seg.category}
                d={seg.pathData}
                fill={seg.color}
                opacity={hoveredIdx === null || hoveredIdx === seg.idx ? 1 : 0.4}
                className="transition-all duration-200 cursor-pointer hover:scale-105 origin-center"
                onMouseEnter={() => setHoveredIdx(seg.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => {
                  setSelectedCategory(seg.category);
                  setActiveScreen('investments');
                }}
              />
            ))}
          </svg>

          {/* Center Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeItem ? (
              <>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#747878]">
                  {activeItem.percentage}%
                </span>
                <span className="text-xs font-bold text-[#1a1c1c] max-w-[90px] truncate">
                  {activeItem.label}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#747878]">
                  Total Assets
                </span>
                <span className="text-xs font-bold font-mono text-[#1a1c1c]">
                  {formatNaira(summary.totalCurrentValueNaira, false)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend & Breakdown List */}
        <div className="md:col-span-7 space-y-2 max-h-56 overflow-y-auto pr-1">
          {allocations.map((item, idx) => (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => {
                setSelectedCategory(item.category);
                setActiveScreen('investments');
              }}
              className={`flex items-center justify-between p-2 rounded text-xs transition-all cursor-pointer ${
                hoveredIdx === idx ? 'bg-[#f4f3f2] font-semibold' : 'hover:bg-[#faf9f8]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#1a1c1c] truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-mono">
                <span className="text-[#747878]">{item.percentage}%</span>
                <span className="font-semibold text-[#1a1c1c] tabular-nums">
                  {formatNaira(item.valueNaira, false)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
