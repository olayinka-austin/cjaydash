import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  label: string;
  value: string;
  secondaryValue?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  badge?: string;
  caption?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  label,
  value,
  secondaryValue,
  trend,
  badge,
  caption,
  onClick
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-[#ffffff] border border-[#e3e2e1] rounded p-5 flex flex-col justify-between transition-all duration-150 relative ${
        onClick ? 'cursor-pointer hover:border-[#747878] hover:shadow-xs' : ''
      }`}
    >
      {/* Top row: Label caps & optional badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#747878] truncate">
          {label}
        </span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1] shrink-0">
            {badge}
          </span>
        )}
      </div>

      {/* Main Primary Value */}
      <div className="space-y-1 my-1">
        <div className="text-2xl lg:text-[26px] font-semibold tracking-tight text-[#1a1c1c] font-mono tabular-nums leading-none">
          {value}
        </div>
        {secondaryValue && (
          <div className="text-xs font-mono text-[#747878] tabular-nums">
            {secondaryValue}
          </div>
        )}
      </div>

      {/* Bottom row: Trend or caption */}
      {(trend || caption) && (
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#f4f3f2] text-xs">
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold font-mono ${
                  trend.isNeutral
                    ? 'bg-[#eeeeed] text-[#444748]'
                    : trend.isPositive !== false
                    ? 'bg-[#a6f2d1]/50 text-[#1b6b51]'
                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}
              >
                {trend.isNeutral ? (
                  <Minus className="w-3 h-3" />
                ) : trend.isPositive !== false ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {trend.value}
              </span>
              {trend.label && <span className="text-[11px] text-[#747878]">{trend.label}</span>}
            </div>
          )}
          {caption && !trend && (
            <span className="text-[11px] text-[#747878] truncate">{caption}</span>
          )}
        </div>
      )}
    </div>
  );
};
