import React, { useMemo } from 'react';
import { useWealth } from '../context/WealthContext';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from './MetricCard';
import { PerformanceChart } from './PerformanceChart';
import { AllocationDonutChart } from './AllocationDonutChart';
import { CATEGORY_DETAILS, formatNaira, formatUSD, formatFinancialValue } from '../utils/calculations';
import { 
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  AlertCircle,
  CalendarCheck,
  ShieldCheck,
  RefreshCw,
  FolderPlus
} from 'lucide-react';

interface OverviewProps {
  onOpenAddModal: () => void;
  onOpenAddPassiveIncomeModal: () => void;
  onOpenImportModal: () => void;
}

export const OverviewScreen: React.FC<OverviewProps> = ({ 
  onOpenAddModal, 
  onOpenAddPassiveIncomeModal, 
  onOpenImportModal 
}) => {
  const { summary, settings, setSelectedCategory, setActiveScreen, seedInitialWorkbookToUserFirestore } = useWealth();
  const { user } = useAuth();

  // Dynamic Time-Based Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let salutation = 'Good Morning';
    if (hour >= 12 && hour < 17) {
      salutation = 'Good Afternoon';
    } else if (hour >= 17 || hour < 5) {
      salutation = 'Good Evening';
    }
    // Dynamic user display name from authenticated user profile
    const displayName = user?.displayName || settings?.preferredDisplayName || (user?.email ? user.email.split('@')[0] : 'CJ');
    return `${salutation}, ${displayName}.`;
  }, [user?.displayName, user?.email, settings?.preferredDisplayName]);

  // Smart Contextual Insight strictly from real Firestore portfolio figures
  const contextualInsight = useMemo((): string | null => {
    if (!summary || summary.totalInvestedNaira <= 0) {
      return null;
    }

    // 1. Pending Maturities priority
    if (summary.pendingMaturitiesCount > 0) {
      return `You have ${summary.pendingMaturitiesCount} fixed income ${summary.pendingMaturitiesCount === 1 ? 'investment' : 'investments'} maturing within the next 30 days.`;
    }

    // 2. Passive Income Run-Rate priority
    if (summary.totalQuarterlyPassiveIncomeNaira > 0) {
      const annualPassive = summary.totalQuarterlyPassiveIncomeNaira * 4;
      return `Your passive income run-rate is ${formatNaira(annualPassive, false)}/year.`;
    }

    // 3. Portfolio Cumulative Yield
    if (summary.totalGainOrLossNaira !== 0 && summary.totalInvestedNaira > 0) {
      const gainPct = ((summary.totalGainOrLossNaira / summary.totalInvestedNaira) * 100).toFixed(1);
      if (summary.totalGainOrLossNaira > 0) {
        return `Your portfolio is up +${gainPct}% (+${formatNaira(summary.totalGainOrLossNaira, false)}) across active positions.`;
      } else {
        return `Your consolidated portfolio performance is currently at ${gainPct}% relative to cost basis.`;
      }
    }

    return null;
  }, [summary]);

  // Formatted Last Updated Information
  const formattedLastUpdated = useMemo(() => {
    const dateStr = settings?.lastRateUpdate;
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      if (isToday) {
        return `Today at ${timeStr}`;
      }
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
    } catch (e) {
      return null;
    }
  }, [settings?.lastRateUpdate]);

  const handleCategoryCardClick = (catKey: string) => {
    setSelectedCategory(catKey as any);
    setActiveScreen('investments');
  };

  const isUsdPrimary = settings?.currencyDisplay === 'USD' || settings?.currencyDisplay === 'USD_PRIMARY';
  const isDual = settings?.currencyDisplay === 'ALL';

  const hasInvestments = summary && summary.totalInvestedNaira > 0;

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner & Overview Header */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            {/* Dynamic Local-Time Greeting */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2]">
                {greeting}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#a6f2d1]/60 dark:bg-[#1b6b51]/30 text-[#1b6b51] dark:text-[#60d3a7] border border-[#1b6b51]/20 dark:border-[#1b6b51]/40">
                AUDITED 2025/2026
              </span>
            </div>

            {/* Concise Welcoming Subtitle */}
            <p className="text-xs sm:text-[13px] text-[#747878] dark:text-[#8c9290]">
              Here's your portfolio at a glance.
            </p>

            {/* Smart Contextual Insight & Last Updated Info */}
            <div className="flex items-center gap-3 pt-1 flex-wrap text-xs">
              {contextualInsight && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f4f3f2] dark:bg-[#222625] text-[#1a1c1c] dark:text-[#e1e3e2] font-medium text-[11px] border border-[#e3e2e1] dark:border-[#2d3130]">
                  <Sparkles className="w-3.5 h-3.5 text-[#1b6b51] dark:text-[#60d3a7] shrink-0" />
                  <span>{contextualInsight}</span>
                </div>
              )}

              {formattedLastUpdated && (
                <div className="inline-flex items-center gap-1 text-[11px] text-[#747878] dark:text-[#8c9290]">
                  <Clock className="w-3 h-3" />
                  <span>Last updated: {formattedLastUpdated}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              onClick={onOpenImportModal}
              className="bg-[#faf9f8] hover:bg-[#f4f3f2] dark:bg-[#222625] dark:hover:bg-[#282c2b] text-[#1a1c1c] dark:text-[#e1e3e2] border border-[#e3e2e1] dark:border-[#2d3130] px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel Import</span>
            </button>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={onOpenAddModal}
                className="bg-accent hover:opacity-95 text-white dark:text-[#111313] px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Investment</span>
              </button>
              <button
                onClick={onOpenAddPassiveIncomeModal}
                className="bg-[#faf9f8] hover:bg-[#f4f3f2] dark:bg-[#222625] dark:hover:bg-[#282c2b] text-[#1a1c1c] dark:text-[#e1e3e2] border border-[#e3e2e1] dark:border-[#2d3130] px-3.5 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3 text-accent" />
                <span>Add Passive Income Source</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State vs. Populated Dashboard */}
      {!hasInvestments ? (
        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-[#f4f3f2] dark:bg-[#222625] text-[#1a1c1c] dark:text-[#e1e3e2] flex items-center justify-center mx-auto">
            <FolderPlus className="w-6 h-6 text-accent" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
              Your investment journey starts here.
            </h2>
            <p className="text-xs sm:text-sm text-[#747878] dark:text-[#8c9290] max-w-md mx-auto">
              Add your first investment to begin tracking your portfolio, or synchronize the pre-configured master workbook dataset.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2.5 pt-4 max-w-xs mx-auto">
            <button
              onClick={onOpenAddModal}
              className="w-full bg-accent hover:opacity-95 text-white dark:text-[#111313] px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Investment</span>
            </button>
            <button
              onClick={onOpenAddPassiveIncomeModal}
              className="w-full bg-[#faf9f8] hover:bg-[#f4f3f2] dark:bg-[#222625] dark:hover:bg-[#282c2b] text-[#1a1c1c] dark:text-[#e1e3e2] border border-[#e3e2e1] dark:border-[#2d3130] px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-accent" />
              <span>Add Passive Income Source</span>
            </button>
            <button
              onClick={() => seedInitialWorkbookToUserFirestore()}
              className="text-xs text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] underline mt-1 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Import Master Workbook</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top 4 Core Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label={isUsdPrimary ? "TOTAL NET WORTH (USD)" : isDual ? "TOTAL NET WORTH (NGN & USD)" : "TOTAL NET WORTH (NGN)"}
              value={formatFinancialValue(summary.totalCurrentValueNaira, settings)}
              subtitle={`Book Cost: ${formatFinancialValue(summary.totalInvestedNaira, settings)}`}
              trend={{
                value: `+${((summary.totalGainOrLossNaira / (summary.totalInvestedNaira || 1)) * 100).toFixed(1)}%`,
                isPositive: summary.totalGainOrLossNaira >= 0,
                label: 'total yield'
              }}
              highlight
            />

            <MetricCard
              label="USD DENOMINATED ASSETS"
              value={formatFinancialValue(summary.currencyExposure.usdPortionNaira, settings)}
              subtitle={`Converted @ ₦${(settings?.currentUsdExchangeRate ?? 1780).toLocaleString()}/$`}
              trend={{
                value: `+${formatFinancialValue(summary.realizedProfitUsd * (settings?.currentUsdExchangeRate || 1780), settings)}`,
                isPositive: true,
                label: 'realized profits'
              }}
            />

            <MetricCard
              label="PASSIVE BOND CASH FLOW"
              value={formatFinancialValue(summary.fgnQuarterlyInterestNaira, settings)}
              subtitle="Guaranteed quarterly coupon payout"
              trend={{
                value: isUsdPrimary 
                  ? `$${(((summary.fgnQuarterlyInterestNaira * 4) / (settings?.currentUsdExchangeRate || 1780)) / 1000).toFixed(1)}k/yr`
                  : `₦${((summary.fgnQuarterlyInterestNaira * 4) / 1000000).toFixed(1)}M/yr`,
                isPositive: true,
                label: 'annualized'
              }}
            />

            <MetricCard
              label="FIXED INCOME MATURITIES"
              value={formatFinancialValue(summary.totalExpectedMaturityPayoutNaira, settings)}
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
                <h2 className="text-sm font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">Investment Categories (10 Classes)</h2>
                <p className="text-xs text-[#747878] dark:text-[#8c9290]">Select any asset class to open its dedicated ledger &amp; formula calculator</p>
              </div>
              <button
                onClick={() => setActiveScreen('investments')}
                className="text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Sheets</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {summary.assetAllocation.map((cat) => {
                return (
                  <div
                    key={cat.category}
                    onClick={() => handleCategoryCardClick(cat.category)}
                    className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] hover:border-accent dark:hover:border-accent p-3.5 rounded cursor-pointer transition-all duration-150 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f4f3f2] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130]">
                          {cat.tag}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#747878] dark:text-[#8c9290] group-hover:text-accent">
                          {cat.percentage}%
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-[#1a1c1c] dark:text-[#e1e3e2] mt-2 group-hover:text-accent transition-colors line-clamp-1">
                        {cat.label}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#f4f3f2] dark:border-[#222625] flex items-center justify-between">
                      <span className="text-[11px] font-mono font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] tabular-nums">
                        {formatFinancialValue(cat.valueNaira, settings)}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-[#747878] dark:text-[#8c9290] group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
