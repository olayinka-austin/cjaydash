import React from 'react';
import { useWealth } from '../context/WealthContext';
import { PerformanceChart } from './PerformanceChart';
import { AllocationDonutChart } from './AllocationDonutChart';
import { MetricCard } from './MetricCard';
import { CATEGORY_DETAILS, formatNaira, formatUSD, formatPercent } from '../utils/calculations';
import { TrendingUp, PieChart, ShieldCheck, DollarSign, ArrowUpRight } from 'lucide-react';
import { InvestmentCategory } from '../types';

export const AnalyticsScreen: React.FC = () => {
  const { summary, settings, setSelectedCategory, setActiveScreen } = useWealth();

  const handleOpenSheet = (catKey: string) => {
    setSelectedCategory(catKey as InvestmentCategory);
    setActiveScreen('investments');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e3e2e1] p-6 rounded">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1b6b51]" />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c]">Performance Intelligence &amp; Analytics</h1>
          </div>
          <p className="text-xs text-[#747878] mt-1">
            Yield analysis, currency risk distribution, and historical equity growth models
          </p>
        </div>
      </div>

      {/* Analytics Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="PORTFOLIO TOTAL RETURN"
          value={`+${((summary.totalGainOrLossNaira / (summary.totalInvestedNaira || 1)) * 100).toFixed(2)}%`}
          subtitle="Net return on invested book cost"
          highlight
        />
        <MetricCard
          label="TOTAL NET GAIN (NGN)"
          value={`+${formatNaira(summary.totalGainOrLossNaira)}`}
          subtitle="Unrealized + realized capital gains"
          trend={{
            value: formatNaira(summary.totalCurrentValueNaira),
            isPositive: true,
            label: 'current net worth'
          }}
        />
        <MetricCard
          label="USD REALIZED PROFIT"
          value={`+${formatUSD(summary.realizedProfitUsd)}`}
          subtitle="Direct foreign stocks + Gold ETF exits"
          trend={{
            value: `₦${Number(((summary?.realizedProfitUsd || 0) * (settings?.currentUsdExchangeRate || 1780)).toFixed(2)).toLocaleString()}`,
            isPositive: true,
            label: 'Naira value'
          }}
        />
        <MetricCard
          label="ANNUALIZED BOND YIELD"
          value={`+${formatNaira(summary.fgnQuarterlyInterestNaira * 4)}/yr`}
          subtitle="FGN Savings Bond passive coupon rate"
        />
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-5">
          <AllocationDonutChart />
        </div>
      </div>

      {/* Asset Class Yield Matrix */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">
            Asset Class Yield &amp; Risk Matrix
          </h3>
          <span className="text-xs font-mono font-semibold text-[#1a1c1c]">
            Audited Portfolio Performance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">TAG</th>
                <th className="py-3 px-4">ASSET CLASS</th>
                <th className="py-3 px-4">CURRENCY EXPOSURE</th>
                <th className="py-3 px-4 font-mono text-right">BOOK COST (₦)</th>
                <th className="py-3 px-4 font-mono text-right">CURRENT VALUE (₦)</th>
                <th className="py-3 px-4 font-mono text-right">WEIGHT</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {summary.assetAllocation.map((item) => {
                const detail = CATEGORY_DETAILS[item.category as keyof typeof CATEGORY_DETAILS];
                return (
                  <tr key={item.category} className="hover:bg-[#faf9f8] group">
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1]">
                        {item.tag}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1a1c1c]">{item.label}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {detail?.currency === 'USD' ? (
                        <span className="text-[#1b6b51]">USD (Foreign FX Hedge)</span>
                      ) : detail?.currency === 'DUAL' ? (
                        <span className="text-[#b45309]">Dual Currency (NGN/USD)</span>
                      ) : (
                        <span>NGN Sovereign / Corporate</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#747878] text-right">
                      {formatNaira(item.valueNaira)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c] text-right">
                      {formatNaira(item.valueNaira)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c] text-right">
                      {item.percentage}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenSheet(item.category)}
                        className="text-xs font-semibold text-[#1a1c1c] group-hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Analyze</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
