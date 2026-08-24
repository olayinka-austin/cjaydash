import React, { useState, useMemo } from 'react';
import { useWealth } from '../context/WealthContext';
import { 
  BookOpen, 
  Globe, 
  Coins, 
  Plus, 
  Search, 
  Calendar, 
  Filter, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Layers,
  Info
} from 'lucide-react';
import { formatNaira, formatUSD, formatDate, convertNairaToUsd, convertUsdToNaira } from '../utils/calculations';
import { MarketReferenceRecord, MarketReferenceType, InvestmentCategory } from '../types';

export const MarketReferencesScreen: React.FC = () => {
  const { 
    marketReferences, 
    addMarketReference, 
    updateMarketReference, 
    deleteMarketReference,
    settings,
    ubaDcaRecords,
    foreignStockBuys,
    foreignStockSells,
    nigerianStockBuys,
    goldEtfBuys,
    goldEtfSells,
    setActiveScreen,
    setSelectedCategory
  } = useWealth();

  // Filters and search states
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | MarketReferenceType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<MarketReferenceRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MarketReferenceRecord | null>(null);

  // Form states for add/edit
  const [formData, setFormData] = useState<{
    date: string;
    rate: string;
    type: MarketReferenceType;
    source: string;
    remark: string;
    relatedInvestmentCategory?: InvestmentCategory;
  }>({
    date: new Date().toISOString().split('T')[0],
    rate: '',
    type: 'usd_ngn',
    source: '',
    remark: '',
  });

  const [formError, setFormError] = useState<string>('');

  // Sorted and filtered references
  const filteredReferences = useMemo(() => {
    return marketReferences
      .filter(record => {
        if (selectedTypeFilter !== 'all' && record.type !== selectedTypeFilter) return false;
        if (selectedDateFilter && record.date !== selectedDateFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSource = record.source?.toLowerCase().includes(q);
          const matchRemark = record.remark?.toLowerCase().includes(q);
          const matchDate = record.date.includes(q);
          const matchRate = record.rate.toString().includes(q);
          return matchSource || matchRemark || matchDate || matchRate;
        }
        return true;
      })
      .sort((a, b) => {
        const comp = a.date.localeCompare(b.date);
        return sortOrder === 'desc' ? -comp : comp;
      });
  }, [marketReferences, selectedTypeFilter, selectedDateFilter, searchQuery, sortOrder]);

  const usdNgnReferences = useMemo(() => {
    return filteredReferences.filter(r => r.type === 'usd_ngn');
  }, [filteredReferences]);

  const goldUsdReferences = useMemo(() => {
    return filteredReferences.filter(r => r.type === 'gold_usd');
  }, [filteredReferences]);

  // Latest rates calculation from actual stored data
  const latestUsdNgnRecord = useMemo(() => {
    const usdList = [...marketReferences].filter(r => r.type === 'usd_ngn').sort((a, b) => b.date.localeCompare(a.date));
    return usdList.length > 0 ? usdList[0] : null;
  }, [marketReferences]);

  const latestGoldUsdRecord = useMemo(() => {
    const goldList = [...marketReferences].filter(r => r.type === 'gold_usd').sort((a, b) => b.date.localeCompare(a.date));
    return goldList.length > 0 ? goldList[0] : null;
  }, [marketReferences]);

  // Connected investment entries lookup for selected date query
  const investmentsOnSelectedDate = useMemo(() => {
    if (!selectedDateFilter) return [];
    const results: Array<{
      category: InvestmentCategory;
      categoryLabel: string;
      title: string;
      amountNaira?: number;
      amountUsd?: number;
      rateUsed?: number;
      ticker?: string;
    }> = [];

    // UBA DCA
    ubaDcaRecords.forEach(r => {
      if (r.date === selectedDateFilter) {
        results.push({
          category: 'uba_dca',
          categoryLabel: 'UBA Domiciliary DCA',
          title: `UBA DCA Deposit ($${r.amountUsd})`,
          amountUsd: r.amountUsd,
          amountNaira: r.nairaEquivalent,
          rateUsed: r.fxRateNgnPerUsd
        });
      }
    });

    // Foreign Stock Buys
    foreignStockBuys.forEach(r => {
      if (r.date === selectedDateFilter) {
        results.push({
          category: 'foreign_stocks',
          categoryLabel: 'Foreign Stocks (Buy)',
          title: `${r.ticker} Stock Purchase (${r.shares} shs @ $${r.buyPriceUsd})`,
          amountUsd: r.totalCostUsd,
          amountNaira: r.totalCostNaira,
          rateUsed: r.fxRateNgnPerUsd,
          ticker: r.ticker
        });
      }
    });

    // Foreign Stock Sells
    foreignStockSells.forEach(r => {
      if (r.date === selectedDateFilter) {
        results.push({
          category: 'foreign_stocks',
          categoryLabel: 'Foreign Stocks (Sell)',
          title: `${r.ticker} Stock Sale (${r.sharesSold} shs @ $${r.sellPriceUsd})`,
          amountUsd: r.netProceedsUsd,
          amountNaira: r.netProceedsNaira,
          rateUsed: r.fxRateNgnPerUsd,
          ticker: r.ticker
        });
      }
    });

    // Gold ETF Buys
    goldEtfBuys.forEach(r => {
      if (r.date === selectedDateFilter) {
        results.push({
          category: 'gold_etfs',
          categoryLabel: 'Gold ETFs (Buy)',
          title: `${r.ticker} Gold ETF Purchase (${r.units} units @ $${r.costPerUnitUsd})`,
          amountUsd: r.totalCostUsd,
          amountNaira: r.totalCostNaira,
          rateUsed: r.fxRateNgnPerUsd,
          ticker: r.ticker
        });
      }
    });

    // Gold ETF Sells
    goldEtfSells.forEach(r => {
      if (r.date === selectedDateFilter) {
        results.push({
          category: 'gold_etfs',
          categoryLabel: 'Gold ETFs (Sell)',
          title: `${r.ticker} Gold ETF Liquidation (${r.unitsSold} units @ $${r.sellPricePerUnitUsd})`,
          amountUsd: r.totalProceedsUsd,
          amountNaira: r.totalProceedsNaira,
          rateUsed: r.fxRateNgnPerUsd,
          ticker: r.ticker
        });
      }
    });

    // Nigerian Stocks
    nigerianStockBuys.forEach(r => {
      if (r.date === selectedDateFilter) {
        results.push({
          category: 'nigerian_stocks',
          categoryLabel: 'Nigerian Stocks (Buy)',
          title: `${r.ticker} NGX Purchase (${r.shares} shs @ ₦${r.buyPriceNaira})`,
          amountNaira: r.totalCostNaira,
          amountUsd: r.equivalentCostUsd,
          rateUsed: r.exchangeRateUsed,
          ticker: r.ticker
        });
      }
    });

    return results;
  }, [selectedDateFilter, ubaDcaRecords, foreignStockBuys, foreignStockSells, goldEtfBuys, goldEtfSells, nigerianStockBuys]);

  // Exact date match for reference rates
  const exactDateUsdRef = useMemo(() => {
    if (!selectedDateFilter) return null;
    return marketReferences.find(r => r.type === 'usd_ngn' && r.date === selectedDateFilter);
  }, [selectedDateFilter, marketReferences]);

  const exactDateGoldRef = useMemo(() => {
    if (!selectedDateFilter) return null;
    return marketReferences.find(r => r.type === 'gold_usd' && r.date === selectedDateFilter);
  }, [selectedDateFilter, marketReferences]);

  // Handle Form Open
  const handleOpenAddModal = (defaultType: MarketReferenceType = 'usd_ngn') => {
    setEditingRecord(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      rate: '',
      type: defaultType,
      source: '',
      remark: ''
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (record: MarketReferenceRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      rate: record.rate.toString(),
      type: record.type,
      source: record.source || '',
      remark: record.remark || '',
      relatedInvestmentCategory: record.relatedInvestmentCategory
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveReference = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsedRate = parseFloat(formData.rate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      setFormError('Please enter a valid rate/price greater than 0.');
      return;
    }

    if (!formData.date) {
      setFormError('Please select a valid reference date.');
      return;
    }

    try {
      if (editingRecord) {
        await updateMarketReference(editingRecord.id, {
          date: formData.date,
          rate: parsedRate,
          type: formData.type,
          source: formData.source.trim() || 'Manual Reference Entry',
          remark: formData.remark.trim() || undefined,
          relatedInvestmentCategory: formData.relatedInvestmentCategory
        });
      } else {
        await addMarketReference({
          date: formData.date,
          rate: parsedRate,
          type: formData.type,
          source: formData.source.trim() || 'Manual Reference Entry',
          remark: formData.remark.trim() || undefined,
          relatedInvestmentCategory: formData.relatedInvestmentCategory
        });
      }
      setIsAddModalOpen(false);
      setEditingRecord(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save reference record.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    try {
      await deleteMarketReference(deletingRecord.id);
      setDeletingRecord(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleNavigateToCategory = (cat: InvestmentCategory) => {
    setSelectedCategory(cat);
    setActiveScreen('investments');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 sm:p-6 rounded">
        <div>
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#1b6b51] dark:text-[#60d3a7]" />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2]">Market References</h1>
          </div>
          <p className="text-xs text-[#747878] dark:text-[#8c9290] mt-1 max-w-2xl">
            Historical USD/NGN exchange rate benchmarks and Gold/USD spot references linked to your investment portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAddModal('usd_ngn')}
            className="bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] px-3.5 py-2 rounded text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reference</span>
          </button>
        </div>
      </div>

      {/* Top Summary Cards (Displayed when actual data exists) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: USD / NGN Latest Reference */}
        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#1b6b51] dark:text-[#60d3a7] uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              USD / NGN LATEST BENCHMARK
            </span>
            {latestUsdNgnRecord && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f4f3f2] dark:bg-[#222625] text-[#747878] dark:text-[#8c9290] border border-[#e3e2e1] dark:border-[#2d3130]">
                {formatDate(latestUsdNgnRecord.date)}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#e1e3e2] mt-2">
            {latestUsdNgnRecord ? `₦${latestUsdNgnRecord.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1.5 flex items-center justify-between">
            <span className="truncate">{latestUsdNgnRecord?.source || 'No rate points recorded'}</span>
            <span className="font-mono font-medium shrink-0 ml-1">{marketReferences.filter(r => r.type === 'usd_ngn').length} pts</span>
          </div>
        </div>

        {/* Card 2: Gold / USD Latest Reference */}
        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#1b6b51] dark:text-[#60d3a7] uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              GOLD / USD SPOT BENCHMARK
            </span>
            {latestGoldUsdRecord && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f4f3f2] dark:bg-[#222625] text-[#747878] dark:text-[#8c9290] border border-[#e3e2e1] dark:border-[#2d3130]">
                {formatDate(latestGoldUsdRecord.date)}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#e1e3e2] mt-2">
            {latestGoldUsdRecord ? `$${latestGoldUsdRecord.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / oz` : '—'}
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1.5 flex items-center justify-between">
            <span className="truncate">{latestGoldUsdRecord?.source || 'No spot points recorded'}</span>
            <span className="font-mono font-medium shrink-0 ml-1">{marketReferences.filter(r => r.type === 'gold_usd').length} pts</span>
          </div>
        </div>

        {/* Card 3: Active Terminal Configuration */}
        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1b6b51] dark:text-[#60d3a7]" />
              ACTIVE SYSTEM VALUATION
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#e8f5e9] dark:bg-[#13382c] text-[#1b6b51] dark:text-[#60d3a7]">
              LIVE
            </span>
          </div>
          <div className="text-sm font-semibold font-mono text-[#1a1c1c] dark:text-[#e1e3e2] mt-2 flex items-center justify-between">
            <span>USD: ₦{settings.currentUsdExchangeRate.toFixed(2)}</span>
            <span>Gold: ${settings.currentGoldSpotPriceUsd.toFixed(2)}</span>
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1.5">
            Default valuation rates applied across real-time portfolio sheets
          </div>
        </div>
      </div>

      {/* Date-Based Reference Lookup Tool */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f4f3f2] dark:border-[#222625]">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
              Date-Based Market Reference Lookup
            </h3>
            <p className="text-xs text-[#747878] dark:text-[#8c9290]">
              Query exact historical exchange rates, gold spot prices, and connected trades for any specific transaction date.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] text-xs px-3 py-1.5 rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] font-mono cursor-pointer"
              />
            </div>
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter('')}
                className="text-xs text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] px-2 py-1.5 rounded hover:bg-[#f4f3f2] dark:hover:bg-[#222625] transition-colors cursor-pointer"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Date Lookup Result Banner if Date Selected */}
        {selectedDateFilter ? (
          <div className="bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] p-4 rounded space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] flex items-center gap-2">
                <span>Reference Query for:</span>
                <span className="font-mono bg-[#ffffff] dark:bg-[#191c1b] px-2 py-0.5 rounded border border-[#e3e2e1] dark:border-[#2d3130] font-bold">
                  {formatDate(selectedDateFilter)} ({selectedDateFilter})
                </span>
              </div>
              <div className="text-xs text-[#747878] dark:text-[#8c9290]">
                {investmentsOnSelectedDate.length} connected portfolio trade(s)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* USD/NGN on this date */}
              <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-3 rounded">
                <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">
                  USD / NGN Reference Rate
                </div>
                {exactDateUsdRef ? (
                  <div className="mt-1">
                    <span className="text-lg font-bold font-mono text-[#1b6b51] dark:text-[#60d3a7]">
                      ₦{exactDateUsdRef.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <p className="text-[11px] text-[#747878] dark:text-[#8c9290] mt-0.5">
                      Source: {exactDateUsdRef.source || 'Standard Reference'}
                    </p>
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-[#747878] dark:text-[#8c9290] italic">
                    No exact USD/NGN market reference recorded for this date.
                  </div>
                )}
              </div>

              {/* Gold/USD on this date */}
              <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-3 rounded">
                <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">
                  Gold / USD Spot Price
                </div>
                {exactDateGoldRef ? (
                  <div className="mt-1">
                    <span className="text-lg font-bold font-mono text-[#1b6b51] dark:text-[#60d3a7]">
                      ${exactDateGoldRef.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / oz
                    </span>
                    <p className="text-[11px] text-[#747878] dark:text-[#8c9290] mt-0.5">
                      Source: {exactDateGoldRef.source || 'Standard Benchmark'}
                    </p>
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-[#747878] dark:text-[#8c9290] italic">
                    No exact Gold/USD spot benchmark recorded for this date.
                  </div>
                )}
              </div>
            </div>

            {/* Connected Portfolio Trades on this Date */}
            {investmentsOnSelectedDate.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#e3e2e1] dark:border-[#2d3130]">
                <div className="text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#1b6b51] dark:text-[#60d3a7]" />
                  Portfolio Trades Executed on {formatDate(selectedDateFilter)}:
                </div>
                <div className="space-y-1.5">
                  {investmentsOnSelectedDate.map((trade, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f4f3f2] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] font-semibold">
                          {trade.categoryLabel}
                        </span>
                        <span className="font-medium text-[#1a1c1c] dark:text-[#e1e3e2]">{trade.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {trade.rateUsed && (
                          <span className="font-mono text-xs text-[#747878] dark:text-[#8c9290]">
                            Rate: ₦{trade.rateUsed.toFixed(2)}
                          </span>
                        )}
                        <button
                          onClick={() => handleNavigateToCategory(trade.category)}
                          className="text-[11px] text-[#1b6b51] dark:text-[#60d3a7] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Sheet</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Quick preset date tags */
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#747878] dark:text-[#8c9290]">
            <span className="font-medium">Quick Dates:</span>
            {['2024-12-01', '2025-02-01', '2025-07-21', '2025-12-02', '2025-12-03', '2025-12-16'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDateFilter(d)}
                className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#f4f3f2] dark:bg-[#222625] text-[#1a1c1c] dark:text-[#e1e3e2] hover:bg-[#e3e2e1] dark:hover:bg-[#2d3130] transition-colors cursor-pointer border border-[#e3e2e1] dark:border-[#2d3130]"
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-3 sm:p-4 rounded">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <button
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTypeFilter === 'all'
                ? 'bg-[#1a1c1c] text-[#faf9f8] dark:bg-[#e1e3e2] dark:text-[#111313]'
                : 'text-[#747878] dark:text-[#8c9290] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
            }`}
          >
            All References ({marketReferences.length})
          </button>
          <button
            onClick={() => setSelectedTypeFilter('usd_ngn')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedTypeFilter === 'usd_ngn'
                ? 'bg-[#1a1c1c] text-[#faf9f8] dark:bg-[#e1e3e2] dark:text-[#111313]'
                : 'text-[#747878] dark:text-[#8c9290] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
            }`}
          >
            <Globe className="w-3 h-3" />
            USD / NGN Rates ({marketReferences.filter(r => r.type === 'usd_ngn').length})
          </button>
          <button
            onClick={() => setSelectedTypeFilter('gold_usd')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedTypeFilter === 'gold_usd'
                ? 'bg-[#1a1c1c] text-[#faf9f8] dark:bg-[#e1e3e2] dark:text-[#111313]'
                : 'text-[#747878] dark:text-[#8c9290] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
            }`}
          >
            <Coins className="w-3 h-3" />
            Gold / USD Prices ({marketReferences.filter(r => r.type === 'gold_usd').length})
          </button>
        </div>

        {/* Search input & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#747878] dark:text-[#8c9290]" />
            <input
              type="text"
              placeholder="Search source or remark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
            />
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded transition-colors cursor-pointer"
            title={sortOrder === 'desc' ? 'Sorted Newest First' : 'Sorted Oldest First'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION A: USD / NGN Exchange Rate Reference Table */}
      {(selectedTypeFilter === 'all' || selectedTypeFilter === 'usd_ngn') && (
        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
              <div>
                <h2 className="text-sm font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  USD / NGN Exchange Rate References
                </h2>
                <p className="text-[11px] text-[#747878] dark:text-[#8c9290]">
                  Chronological foreign exchange benchmarks applied to dollar deposits and offshore trades.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenAddModal('usd_ngn')}
              className="text-xs font-semibold text-[#1b6b51] dark:text-[#60d3a7] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add USD Rate</span>
            </button>
          </div>

          {usdNgnReferences.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#747878] dark:text-[#8c9290] space-y-2">
              <p>No USD/NGN exchange rate reference records found.</p>
              <button
                onClick={() => handleOpenAddModal('usd_ngn')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f3f2] dark:bg-[#222625] text-[#1a1c1c] dark:text-[#e1e3e2] rounded text-xs font-medium border border-[#e3e2e1] dark:border-[#2d3130] hover:bg-[#e3e2e1] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First USD/NGN Rate
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#faf9f8] dark:bg-[#151817] border-b border-[#e3e2e1] dark:border-[#2d3130] text-[#747878] dark:text-[#8c9290] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Exchange Rate</th>
                    <th className="py-3 px-4">Source / Context</th>
                    <th className="py-3 px-4">Connected Investment Trade</th>
                    <th className="py-3 px-4">Remarks / Ledger Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f3f2] dark:divide-[#222625]">
                  {usdNgnReferences.map((record) => (
                    <tr 
                      key={record.id} 
                      className="hover:bg-[#faf9f8] dark:hover:bg-[#1e2221] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-[#1a1c1c] dark:text-[#e1e3e2] whitespace-nowrap">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm text-[#1b6b51] dark:text-[#60d3a7] whitespace-nowrap">
                        ₦{record.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#1a1c1c] dark:text-[#e1e3e2]">
                        {record.source || 'General Reference'}
                      </td>
                      <td className="py-3 px-4">
                        {record.relatedInvestmentCategory ? (
                          <button
                            onClick={() => handleNavigateToCategory(record.relatedInvestmentCategory!)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f4f3f2] dark:bg-[#222625] text-[#1b6b51] dark:text-[#60d3a7] hover:bg-[#e3e2e1] dark:hover:bg-[#2d3130] transition-colors cursor-pointer"
                          >
                            <span>View Sheet</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#747878] dark:text-[#8c9290]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#747878] dark:text-[#8c9290] max-w-xs truncate">
                        {record.remark || '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(record)}
                            className="p-1 text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] rounded transition-colors cursor-pointer"
                            title="Edit Reference"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(record)}
                            className="p-1 text-[#ba1a1a] dark:text-[#ffb4ab] hover:bg-[#ffdad6] dark:hover:bg-[#93000a]/20 rounded transition-colors cursor-pointer"
                            title="Delete Reference"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION B: Gold / USD Reference Price Table */}
      {(selectedTypeFilter === 'all' || selectedTypeFilter === 'gold_usd') && (
        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
              <div>
                <h2 className="text-sm font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  Gold / USD Reference Price
                </h2>
                <p className="text-[11px] text-[#747878] dark:text-[#8c9290]">
                  Spot gold benchmark prices per troy ounce recorded at dates of ETF allocations and liquidations.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenAddModal('gold_usd')}
              className="text-xs font-semibold text-[#1b6b51] dark:text-[#60d3a7] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Gold Price</span>
            </button>
          </div>

          {goldUsdReferences.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#747878] dark:text-[#8c9290] space-y-2">
              <p>No Gold/USD reference price records found.</p>
              <button
                onClick={() => handleOpenAddModal('gold_usd')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f3f2] dark:bg-[#222625] text-[#1a1c1c] dark:text-[#e1e3e2] rounded text-xs font-medium border border-[#e3e2e1] dark:border-[#2d3130] hover:bg-[#e3e2e1] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Gold Benchmark
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#faf9f8] dark:bg-[#151817] border-b border-[#e3e2e1] dark:border-[#2d3130] text-[#747878] dark:text-[#8c9290] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Spot Benchmark</th>
                    <th className="py-3 px-4">Source / Context</th>
                    <th className="py-3 px-4">Connected ETF Instrument</th>
                    <th className="py-3 px-4">Remarks / Ledger Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f3f2] dark:divide-[#222625]">
                  {goldUsdReferences.map((record) => (
                    <tr 
                      key={record.id} 
                      className="hover:bg-[#faf9f8] dark:hover:bg-[#1e2221] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-[#1a1c1c] dark:text-[#e1e3e2] whitespace-nowrap">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm text-[#1b6b51] dark:text-[#60d3a7] whitespace-nowrap">
                        ${record.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / oz
                      </td>
                      <td className="py-3 px-4 font-medium text-[#1a1c1c] dark:text-[#e1e3e2]">
                        {record.source || 'Spot Reference'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleNavigateToCategory('gold_etfs')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f4f3f2] dark:bg-[#222625] text-[#1b6b51] dark:text-[#60d3a7] hover:bg-[#e3e2e1] dark:hover:bg-[#2d3130] transition-colors cursor-pointer"
                        >
                          <span>Gold ETFs</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-[#747878] dark:text-[#8c9290] max-w-xs truncate">
                        {record.remark || '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(record)}
                            className="p-1 text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] rounded transition-colors cursor-pointer"
                            title="Edit Reference"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(record)}
                            className="p-1 text-[#ba1a1a] dark:text-[#ffb4ab] hover:bg-[#ffdad6] dark:hover:bg-[#93000a]/20 rounded transition-colors cursor-pointer"
                            title="Delete Reference"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Information Footer */}
      <div className="bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] p-4 rounded flex items-start gap-3 text-xs text-[#747878] dark:text-[#8c9290]">
        <Info className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">Market Reference Architecture Note:</span>
          <p className="mt-0.5">
            Reference rates in this section provide historical audit transparency for FX conversions and spot commodity valuations across all 10 investment sheets. Adding or updating reference data here securely syncs with your Firestore database.
          </p>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
                <h3 className="text-sm font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  {editingRecord ? 'Edit Market Reference' : 'Add Market Reference'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReference} className="p-4 sm:p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-[#ffdad6] dark:bg-[#93000a]/30 border border-[#ba1a1a] rounded text-xs text-[#ba1a1a] dark:text-[#ffb4ab] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Reference Type Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider mb-1.5">
                  Reference Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'usd_ngn' })}
                    className={`py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.type === 'usd_ngn'
                        ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                        : 'border-[#e3e2e1] dark:border-[#2d3130] text-[#747878] dark:text-[#8c9290] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>USD / NGN Rate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'gold_usd' })}
                    className={`py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.type === 'gold_usd'
                        ? 'bg-[#1a1c1c] text-[#faf9f8] border-[#1a1c1c] dark:bg-[#e1e3e2] dark:text-[#111313] dark:border-[#e1e3e2]'
                        : 'border-[#e3e2e1] dark:border-[#2d3130] text-[#747878] dark:text-[#8c9290] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Gold / USD Spot</span>
                  </button>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider mb-1">
                  Reference Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] text-xs px-3 py-2 rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] font-mono cursor-pointer"
                />
              </div>

              {/* Rate / Price Input */}
              <div>
                <label className="block text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider mb-1">
                  {formData.type === 'usd_ngn' ? 'Exchange Rate (₦ per $ USD) *' : 'Spot Gold Price ($ USD per oz) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#747878] dark:text-[#8c9290]">
                    {formData.type === 'usd_ngn' ? '₦' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder={formData.type === 'usd_ngn' ? '1675.00' : '3365.02'}
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] text-xs pl-8 pr-3 py-2 rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] font-mono"
                  />
                </div>
              </div>

              {/* Source / Context */}
              <div>
                <label className="block text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider mb-1">
                  Source / Context
                </label>
                <input
                  type="text"
                  placeholder={formData.type === 'usd_ngn' ? 'e.g., Foreign Stock Buy, UBA DCA, Official FX' : 'e.g., GLD Buy Spot Benchmark, Market Fix'}
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] text-xs px-3 py-2 rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
                />
              </div>

              {/* Optional Category Link */}
              <div>
                <label className="block text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider mb-1">
                  Connected Sheet (Optional)
                </label>
                <select
                  value={formData.relatedInvestmentCategory || ''}
                  onChange={(e) => setFormData({ ...formData, relatedInvestmentCategory: (e.target.value as InvestmentCategory) || undefined })}
                  className="w-full bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] text-xs px-3 py-2 rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] cursor-pointer"
                >
                  <option value="">None / General Reference</option>
                  <option value="foreign_stocks">Foreign Stocks</option>
                  <option value="gold_etfs">Gold ETFs</option>
                  <option value="uba_dca">UBA Domiciliary DCA</option>
                  <option value="nigerian_stocks">Nigerian Stocks</option>
                  <option value="fgn_bonds">FGN Savings Bonds</option>
                  <option value="commercial_papers">Commercial Papers</option>
                  <option value="treasury_bills">Treasury Bills</option>
                  <option value="mutual_funds">Mutual Funds</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional audit notes or trade reference context..."
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] text-xs px-3 py-2 rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e3e2e1] dark:border-[#2d3130]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-semibold text-[#747878] dark:text-[#8c9290] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-semibold bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] transition-all cursor-pointer shadow-xs"
                >
                  {editingRecord ? 'Save Changes' : 'Create Reference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded w-full max-w-sm shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#ffdad6] dark:bg-[#93000a]/30 text-[#ba1a1a] dark:text-[#ffb4ab] flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  Delete Reference Entry?
                </h3>
                <p className="text-xs text-[#747878] dark:text-[#8c9290] mt-0.5">
                  Are you sure you want to remove this market reference point?
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#faf9f8] dark:bg-[#151817] border border-[#e3e2e1] dark:border-[#2d3130] rounded text-xs space-y-1 font-mono">
              <div>Date: <span className="font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">{formatDate(deletingRecord.date)}</span></div>
              <div>Rate: <span className="font-semibold text-[#1b6b51] dark:text-[#60d3a7]">{deletingRecord.type === 'usd_ngn' ? `₦${deletingRecord.rate.toFixed(2)}` : `$${deletingRecord.rate.toFixed(2)}/oz`}</span></div>
              <div className="font-sans text-[11px] text-[#747878] dark:text-[#8c9290]">Source: {deletingRecord.source || 'Manual entry'}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingRecord(null)}
                className="px-3.5 py-1.5 rounded text-xs font-semibold text-[#747878] dark:text-[#8c9290] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 rounded text-xs font-semibold bg-[#ba1a1a] hover:bg-[#93000a] text-[#ffffff] transition-all cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
