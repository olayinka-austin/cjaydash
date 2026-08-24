import React from 'react';
import { useWealth } from '../context/WealthContext';
import { AllocationDonutChart } from './AllocationDonutChart';
import { PerformanceChart } from './PerformanceChart';
import { MetricCard } from './MetricCard';
import { CATEGORY_DETAILS, formatNaira, formatUSD, formatFinancialValue } from '../utils/calculations';
import { ArrowUpRight, DollarSign, Layers, ShieldCheck, TrendingUp } from 'lucide-react';
import { InvestmentCategory } from '../types';

export const PortfolioScreen: React.FC = () => {
  const { summary, settings, setSelectedCategory, setActiveScreen } = useWealth();

  const handleSelectCategory = (catKey: string) => {
    setSelectedCategory(catKey as InvestmentCategory);
    setActiveScreen('investments');
  };

  const isUsdPrimary = settings?.currencyDisplay === 'USD' || settings?.currencyDisplay === 'USD_PRIMARY';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e3e2e1] p-6 rounded">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c]">Strategic Portfolio &amp; Asset Allocation</h1>
          <p className="text-xs text-[#747878] mt-1">
            Consolidated valuation breakdown and target weight distribution across all 10 investment asset classes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#747878] font-semibold">Total Portfolio Net Worth</span>
            <div className="text-lg font-bold font-mono text-[#1a1c1c]">{formatFinancialValue(summary.totalCurrentValueNaira, settings)}</div>
          </div>
        </div>
      </div>

      {/* Top Level Portfolio Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={isUsdPrimary ? "TOTAL INVESTED CAPITAL (USD)" : "TOTAL INVESTED CAPITAL (NGN)"}
          value={formatFinancialValue(summary.totalInvestedNaira, settings)}
          subtitle="Cumulative cost basis across all asset classes"
        />
        <MetricCard
          label={isUsdPrimary ? "TOTAL NET WORTH (USD)" : "TOTAL NET WORTH (NGN)"}
          value={formatFinancialValue(summary.totalCurrentValueNaira, settings)}
          subtitle={`Converted @ ₦${(settings?.currentUsdExchangeRate ?? 1780).toLocaleString()}/$`}
          trend={{
            value: `+${((summary.totalGainOrLossNaira / (summary.totalInvestedNaira || 1)) * 100).toFixed(1)}%`,
            isPositive: summary.totalGainOrLossNaira >= 0,
            label: 'total return'
          }}
          highlight
        />
        <MetricCard
          label="USD ASSETS VALUATION"
          value={formatFinancialValue(summary.currencyExposure.usdPortionNaira, settings)}
          subtitle="Direct foreign stocks, UBA DCA &amp; Gold ETFs"
        />
        <MetricCard
          label="ACTIVE ASSET CLASSES"
          value={`${(summary?.assetAllocation || []).filter(a => a && a.valueNaira > 0).length} of 10`}
          subtitle="Diversified multi-asset strategy"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AllocationDonutChart />
        </div>
        <div className="lg:col-span-7">
          <PerformanceChart />
        </div>
      </div>

      {/* Detailed Asset Class Allocation Table */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">
              Asset Class Allocation &amp; Weight Distribution
            </h3>
            <p className="text-[11px] text-[#747878]">Click any asset class row to open its dedicated spreadsheet ledger</p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#1a1c1c]">
            Total Allocation: 100.0%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">TAG</th>
                <th className="py-3 px-4">ASSET CLASS</th>
                <th className="py-3 px-4">CURRENCY</th>
                <th className="py-3 px-4 font-mono text-right">CURRENT VALUE</th>
                <th className="py-3 px-4 font-mono text-right">WEIGHT (%)</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {summary.assetAllocation.map((item) => {
                const detail = CATEGORY_DETAILS[item.category as keyof typeof CATEGORY_DETAILS];
                return (
                  <tr
                    key={item.category}
                    onClick={() => handleSelectCategory(item.category)}
                    className="hover:bg-[#f4f3f2]/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1] group-hover:border-[#1a1c1c]">
                        {item.tag}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1a1c1c] group-hover:text-[#1b6b51] transition-colors">
                      {item.label}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {detail?.currency === 'USD' ? (
                        <span className="text-[#1b6b51]">USD ($)</span>
                      ) : detail?.currency === 'DUAL' ? (
                        <span className="text-[#b45309]">USD/NGN</span>
                      ) : (
                        <span>NGN (₦)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1a1c1c] text-right tabular-nums">
                      {formatFinancialValue(item.valueNaira, settings)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c] text-right">
                      {item.percentage}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-semibold text-[#1a1c1c] group-hover:underline inline-flex items-center gap-1">
                        <span>Open Sheet</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#f4f3f2] font-bold border-t-2 border-[#e3e2e1] text-xs">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 font-bold text-[#1a1c1c]">TOTAL CONSOLIDATED PORTFOLIO</td>
                <td className="py-3.5 px-4 font-mono text-[#1a1c1c] text-right text-sm">{formatFinancialValue(summary.totalCurrentValueNaira, settings)}</td>
                <td className="py-3.5 px-4 font-mono text-[#1a1c1c] text-right">100.0%</td>
                <td className="py-3.5 px-4 text-center text-[#1b6b51]">Audited</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
