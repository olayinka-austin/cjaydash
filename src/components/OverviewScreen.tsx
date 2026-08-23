import React from 'react';
import { useWealth } from '../context/WealthContext';
import { MetricCard } from './MetricCard';
import { PerformanceChart } from './PerformanceChart';
import { AllocationDonutChart } from './AllocationDonutChart';
import { CATEGORY_DETAILS, formatNaira, formatUSD } from '../utils/calculations';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  Layers, 
  Calendar,
  FileSpreadsheet,
  Plus,
  Coins
} from 'lucide-react';

interface OverviewProps {
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
}

export const OverviewScreen: React.FC<OverviewProps> = ({ onOpenAddModal, onOpenImportModal }) => {
  const { summary, settings, setSelectedCategory, setActiveScreen } = useWealth();

  const handleCategoryCardClick = (catKey: string) => {
    setSelectedCategory(catKey as any);
    setActiveScreen('investments');
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e3e2e1] p-6 rounded">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c]">Financial Independence Portfolio</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#a6f2d1]/60 text-[#1b6b51] border border-[#1b6b51]/20">
              AUDITED 2025
            </span>
          </div>
          <p className="text-xs text-[#747878] mt-1">
            Consolidated valuation across 10 asset classes &middot; 100% synchronized with master workbook
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenImportModal}
            className="bg-[#faf9f8] hover:bg-[#f4f3f2] text-[#1a1c1c] border border-[#e3e2e1] px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel Import</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Top 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="TOTAL NET WORTH (NGN)"
          value={formatNaira(summary.totalCurrentValueNaira)}
          subtitle={`Book Cost: ${formatNaira(summary.totalInvestedNaira, false)}`}
          trend={{
            value: `+${((summary.totalGainOrLossNaira / (summary.totalInvestedNaira || 1)) * 100).toFixed(1)}%`,
            isPositive: summary.totalGainOrLossNaira >= 0,
            label: 'total yield'
          }}
          highlight
        />

        <MetricCard
          label="USD DENOMINATED ASSETS"
          value={formatUSD(summary.totalPortfolioWorthUsd)}
          subtitle={`Converted @ ₦${(settings?.currentUsdExchangeRate ?? 1780).toLocaleString()}/$`}
          trend={{
            value: `+${formatUSD(summary.realizedProfitUsd)}`,
            isPositive: true,
            label: 'realized profits'
          }}
        />

        <MetricCard
          label="PASSIVE BOND CASH FLOW"
          value={formatNaira(summary.fgnQuarterlyInterestNaira)}
          subtitle="Guaranteed quarterly coupon payout"
          trend={{
            value: `₦${((summary.fgnQuarterlyInterestNaira * 4) / 1000000).toFixed(1)}M/yr`,
            isPositive: true,
            label: 'annualized'
          }}
        />

        <MetricCard
          label="FIXED INCOME MATURITIES"
          value={formatNaira(summary.totalExpectedMaturityPayoutNaira)}
          subtitle="CP + T-Bills + Locked principal & interest"
          trend={{
            value: `${summary.activeInvestmentsCount} active`,
            isPositive: true,
            label: 'tranches'
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-5">
          <AllocationDonutChart />
        </div>
      </div>

      {/* 10 Category Quick Navigation Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1a1c1c]">Investment Categories (10 Classes)</h2>
            <p className="text-xs text-[#747878]">Select any asset class to open its dedicated ledger &amp; formula calculator</p>
          </div>
          <button
            onClick={() => setActiveScreen('investments')}
            className="text-xs font-semibold text-[#1a1c1c] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Sheets</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {summary.assetAllocation.map((cat) => {
            const detail = CATEGORY_DETAILS[cat.category as keyof typeof CATEGORY_DETAILS];
            return (
              <div
                key={cat.category}
                onClick={() => handleCategoryCardClick(cat.category)}
                className="bg-[#ffffff] border border-[#e3e2e1] hover:border-[#1a1c1c] p-3.5 rounded cursor-pointer transition-all duration-150 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1]">
                      {cat.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#747878] group-hover:text-[#1a1c1c]">
                      {cat.percentage}%
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#1a1c1c] mt-2 group-hover:text-[#1b6b51] transition-colors line-clamp-1">
                    {cat.label}
                  </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#f4f3f2] flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-[#1a1c1c] tabular-nums">
                    {formatNaira(cat.valueNaira, false)}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-[#747878] group-hover:text-[#1a1c1c] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
