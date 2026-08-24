import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  label: string;
  value: string;
  secondaryValue?: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  badge?: string;
  caption?: string;
  highlight?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  label,
  value,
  secondaryValue,
  subtitle,
  trend,
  badge,
  caption,
  highlight = false,
  onClick
}) => {
  const displaySecondary = secondaryValue || subtitle;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded p-5 flex flex-col justify-between transition-all duration-150 relative ${
        highlight ? 'ring-1 ring-[#1a1c1c]/10 dark:ring-[#e1e3e2]/20' : ''
      } ${
        onClick ? 'cursor-pointer hover:border-[#747878] dark:hover:border-[#8c9290] hover:shadow-xs' : ''
      }`}
    >
      {/* Top row: Label caps & optional badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#747878] dark:text-[#8c9290] truncate">
          {label}
        </span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#f4f3f2] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130] shrink-0">
            {badge}
          </span>
        )}
      </div>

      {/* Main Primary Value */}
      <div className="space-y-1 my-1">
        <div className="text-2xl lg:text-[26px] font-semibold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2] font-mono tabular-nums leading-none">
          {value}
        </div>
        {displaySecondary && (
          <div className="text-xs font-mono text-[#747878] dark:text-[#8c9290] tabular-nums">
            {displaySecondary}
          </div>
        )}
      </div>

      {/* Bottom row: Trend or caption */}
      {(trend || caption) && (
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#f4f3f2] dark:border-[#222625] text-xs">
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold font-mono ${
                  trend.isNeutral
                    ? 'bg-[#eeeeed] text-[#444748] dark:bg-[#222625] dark:text-[#c2c7c5]'
                    : trend.isPositive !== false
                    ? 'bg-[#a6f2d1]/50 text-[#1b6b51] dark:bg-[#1b6b51]/30 dark:text-[#60d3a7]'
                    : 'bg-[#ffdad6] text-[#ba1a1a] dark:bg-[#ba1a1a]/30 dark:text-[#ff897d]'
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
              {trend.label && (
                <span className="text-[11px] text-[#747878] dark:text-[#8c9290]">{trend.label}</span>
              )}
            </div>
          )}
          {caption && !trend && (
            <span className="text-[11px] text-[#747878] dark:text-[#8c9290] truncate">{caption}</span>
          )}
        </div>
      )}
    </div>
  );
};
