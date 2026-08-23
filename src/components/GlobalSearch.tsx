import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  ChevronRight,
  TrendingUp,
  Landmark,
  Building2,
  PieChart,
  Shield,
  Layers,
  ArrowUpRight,
  Sparkles,
  FileText,
  DollarSign,
  Calendar,
  Wallet
} from 'lucide-react';
import { useWealth } from '../context/WealthContext';
import { InvestmentCategory } from '../types';
import { CATEGORY_DETAILS, formatNaira, formatUSD, formatPercent, formatDate } from '../utils/calculations';

export interface SearchResultItem {
  id: string;
  category: InvestmentCategory | 'documents';
  title: string;
  subtitle: string;
  symbolOrTicker?: string;
  platform?: string;
  primaryValue: string;
  secondaryValue?: string;
  status?: string;
  date?: string;
  rawSearchText: string;
  actionType: 'sheet' | 'document';
}

export const GlobalSearch: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setActiveScreen,
    setSelectedCategory,
    ubaDcaRecords,
    foreignStockBuys,
    foreignStockSells,
    nigerianStockBuys,
    nigerianStockSells,
    ebookDcaRecords,
    commercialPaperRecords,
    treasuryBillRecords,
    mutualFundRecords,
    fgnBondRecords,
    goldEtfBuys,
    goldEtfSells,
    lockedSavingsRecords,
    documents
  } = useWealth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedFilterGroup, setSelectedFilterGroup] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileSearchOpen(false);
        setSelectedIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Consolidate and index all searchable records across all 10 modules + documents
  const allIndexedRecords: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. UBA DCA
    ubaDcaRecords.forEach((r, idx) => {
      const title = `UBA Domiciliary DCA Deposit #${idx + 1}`;
      const subtitle = `$${(r.amountUsd || 0).toLocaleString()} @ ₦${(r.ratePerUsd || 0).toLocaleString()}/$`;
      items.push({
        id: r.id,
        category: 'uba_dca',
        title,
        subtitle,
        symbolOrTicker: 'USD/NGN',
        platform: r.destination || 'UBA Domiciliary',
        primaryValue: formatNaira(r.totalCostNaira || 0),
        secondaryValue: formatUSD(r.amountUsd || 0),
        date: r.date,
        rawSearchText: `uba dca domiciliary usd dollar ${r.destination || ''} ${r.remark || ''} ${r.date || ''} ${r.amountUsd} ${r.ratePerUsd} ${r.totalCostNaira}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // 2. Foreign Stocks Buys & Sells
    foreignStockBuys.forEach((r) => {
      const sym = r.symbol || 'US Stock';
      items.push({
        id: r.id,
        category: 'foreign_stocks',
        title: `${sym} - US Equity Buy Lot`,
        subtitle: `${r.qty} units @ ${formatUSD(r.unitPriceUsd)}`,
        symbolOrTicker: sym,
        platform: 'Bamboo / US Broker',
        primaryValue: formatUSD(r.totalAmountUsd || 0),
        secondaryValue: formatNaira(r.totalAmountNaira || 0),
        date: r.date,
        status: 'Active Lot',
        rawSearchText: `foreign stocks us equities buy ${sym} realty income apple microsoft amazon bamboo broker ${r.date || ''} ${r.qty} ${r.unitPriceUsd} ${r.totalAmountUsd}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    foreignStockSells.forEach((r) => {
      const sym = r.symbol || 'US Stock';
      const isProfit = (r.profitOrLossUsd || 0) >= 0;
      items.push({
        id: r.id,
        category: 'foreign_stocks',
        title: `${sym} - US Equity Sell Execution`,
        subtitle: `${r.qty} units sold @ ${formatUSD(r.unitPriceUsd)}`,
        symbolOrTicker: sym,
        platform: 'Bamboo / US Broker',
        primaryValue: `${isProfit ? '+' : ''}${formatUSD(r.profitOrLossUsd || 0)} P/L`,
        secondaryValue: `${isProfit ? '+' : ''}${formatNaira(r.profitOrLossNaira || 0)}`,
        date: r.date,
        status: 'Realized Exit',
        rawSearchText: `foreign stocks us equities sell exit ${sym} profit loss realized bamboo broker ${r.date || ''} ${r.remarks || ''}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // 3. Nigerian Stocks Buys & Sells
    nigerianStockBuys.forEach((r) => {
      const sym = r.symbol || 'NGX Stock';
      items.push({
        id: r.id,
        category: 'nigerian_stocks',
        title: `${sym} - NGX Equity Buy`,
        subtitle: `${r.qty?.toLocaleString()} units @ ${formatNaira(r.unitPriceNaira)}`,
        symbolOrTicker: sym,
        platform: 'NGX / Nigerian Broker',
        primaryValue: formatNaira(r.totalAmountNaira || 0),
        secondaryValue: formatUSD(r.amountUsd || 0),
        date: r.tradeDate,
        status: 'Active Holding',
        rawSearchText: `nigerian stocks ngx equities buy ${sym} accesscorp gtco zenithbank mtnn transcorp trove chaka broker ${r.tradeDate || ''} ${r.qty} ${r.unitPriceNaira}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    nigerianStockSells.forEach((r) => {
      const sym = r.symbol || 'NGX Stock';
      const isProfit = (r.profitOrLossNaira || 0) >= 0;
      items.push({
        id: r.id,
        category: 'nigerian_stocks',
        title: `${sym} - NGX Equity Sell Execution`,
        subtitle: `${r.qty?.toLocaleString()} units sold @ ${formatNaira(r.unitPriceNaira)}`,
        symbolOrTicker: sym,
        platform: 'NGX Broker',
        primaryValue: `${isProfit ? '+' : ''}${formatNaira(r.profitOrLossNaira || 0)} P/L`,
        secondaryValue: `${isProfit ? '+' : ''}${formatUSD(r.profitOrLossUsd || 0)}`,
        date: r.tradeDate,
        status: 'Realized Exit',
        rawSearchText: `nigerian stocks ngx sell exit ${sym} profit loss realized ${r.tradeDate || ''} ${r.remarks || ''}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // 4. Ebook DCA
    ebookDcaRecords.forEach((r, idx) => {
      items.push({
        id: r.id,
        category: 'ebook_dca',
        title: `E-Book DCA Lot #${idx + 1} (${r.destination || 'OPTIMUS'})`,
        subtitle: `$${(r.amountUsd || 0).toLocaleString()} @ ₦${(r.ratePerUsd || 0).toLocaleString()}/$ (O REITs)`,
        symbolOrTicker: 'O REITs',
        platform: r.destination || 'Optimus',
        primaryValue: formatNaira(r.totalCostNaira || 0),
        secondaryValue: formatUSD(r.amountUsd || 0),
        date: r.date,
        rawSearchText: `ebook dca optimus realty income o reits dollar cost averaging ${r.remark || ''} ${r.destination || ''} ${r.date || ''}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // 5. Commercial Papers
    commercialPaperRecords.forEach((r) => {
      items.push({
        id: r.id,
        category: 'commercial_papers',
        title: `${r.issuer || 'Commercial Paper'} (${r.tenorDays} Days)`,
        subtitle: `Rate: ${r.ratePercent}% p.a. &middot; Matures ${r.maturityDate || ''}`,
        symbolOrTicker: 'CP',
        platform: r.platformUsed || 'FMDQ / Issuer',
        primaryValue: formatNaira(r.amountInvestedNaira || 0),
        secondaryValue: `+${formatNaira(r.interestEarnedNaira || 0)} Int`,
        date: r.investmentDate,
        status: r.status || 'Active',
        rawSearchText: `commercial paper cp ${r.issuer || ''} dangote sugar flour mills fbn quest afrinvest fmdq ${r.platformUsed || ''} ${r.month || ''} ${r.ratePercent}% ${r.amountInvestedNaira} ${r.tenorDays} ${r.status || ''}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // 6. Treasury Bills
    treasuryBillRecords.forEach((r) => {
      items.push({
        id: r.id,
        category: 'treasury_bills',
        title: `Nigerian Treasury Bill (${r.tenorDays} Days)`,
        subtitle: `Rate: ${r.ratePercent}% p.a. &middot; Matures ${r.maturityDate || ''}`,
        symbolOrTicker: 'NTB',
        platform: r.platformUsed || 'CBN / Bank',
        primaryValue: formatNaira(r.amountInvestedNaira || 0),
        secondaryValue: `+${formatNaira(r.interestEarnedNaira || 0)} Int`,
        date: r.investmentDate,
        status: r.status || 'Active',
        rawSearchText: `treasury bills ntb cbn stanbic central bank government debt ${r.platformUsed || ''} ${r.month || ''} ${r.ratePercent}% ${r.amountInvestedNaira} ${r.tenorDays} ${r.status || ''}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // 7. Mutual Funds
    mutualFundRecords.forEach((r) => {
      const isGain = (r.gainOrLossNaira || 0) >= 0;
      items.push({
        id: r.id,
        category: 'mutual_funds',
        title: r.fundName || 'Mutual Fund Asset',
        subtitle: `${(r.unitsPurchased || 0).toLocaleString()} Units @ ₦${r.currentNavPerUnitNaira || 0} NAV`,
        symbolOrTicker: 'MF',
        platform: 'Fund Manager',
        primaryValue: formatNaira(r.currentValueNaira || r.amountInvestedNaira || 0),
        secondaryValue: `${isGain ? '+' : ''}${formatNaira(r.gainOrLossNaira || 0)} P/L`,
        date: r.investmentDate,
        status: r.status || 'Active',
        rawSearchText: `mutual funds money market arm aggressive growth leadway stanbic ibtc fbnquest fund ${r.fundName || ''} ${r.month || ''} ${r.status || ''}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // 8. FGN Bonds
    fgnBondRecords.forEach((r) => {
      items.push({
        id: r.id,
        category: 'fgn_bonds',
        title: `FGN Savings Bond (${r.tenorYears}Y) - ${r.investmentMonth || ''}`,
        subtitle: `Coupon: ${r.interestRatePercent}% p.a. (Quarterly: ${r.paymentMonths?.join(', ') || 'Qtr'})`,
        symbolOrTicker: 'FGN',
        platform: r.broker || 'DMO / Primary Dealer',
        primaryValue: formatNaira(r.amountInvestedNaira || 0),
        secondaryValue: `+${formatNaira(r.quarterlyInterestNaira || 0)}/qtr`,
        date: `${r.investmentMonth} ${r.investmentYear}`,
        status: r.status || 'Active',
        rawSearchText: `fgn bonds federal government sovereign savings bond dmo debt management office meristem afrinvest ${r.broker || ''} ${r.investmentMonth || ''} ${r.investmentYear || ''} ${r.interestRatePercent}% ${r.amountInvestedNaira}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // 9. Gold ETFs
    goldEtfBuys.forEach((r) => {
      const ticker = r.ticker || 'GLD';
      items.push({
        id: r.id,
        category: 'gold_etfs',
        title: `${ticker} - Gold Bullion ETF Buy`,
        subtitle: `${r.qty} units @ ${formatUSD(r.unitPriceUsd)} (Spot: ${formatUSD(r.goldSpotPriceUsdPerOz)}/oz)`,
        symbolOrTicker: ticker,
        platform: 'Global Gold ETF',
        primaryValue: formatUSD(r.totalAmountUsd || 0),
        secondaryValue: formatNaira(r.totalAmountNaira || 0),
        date: r.date,
        status: 'Bullion Asset',
        rawSearchText: `gold etf gld iau sgol spot bullion physical gold commodity hedge ${ticker} ${r.date || ''} ${r.qty} ${r.unitPriceUsd}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    goldEtfSells.forEach((r) => {
      const ticker = r.ticker || 'GLD';
      const isProfit = (r.profitOrLossUsd || 0) >= 0;
      items.push({
        id: r.id,
        category: 'gold_etfs',
        title: `${ticker} - Gold Bullion ETF Sell`,
        subtitle: `${r.qty} units sold @ ${formatUSD(r.unitPriceUsd)}`,
        symbolOrTicker: ticker,
        platform: 'Global Gold ETF',
        primaryValue: `${isProfit ? '+' : ''}${formatUSD(r.profitOrLossUsd || 0)} P/L`,
        secondaryValue: `${isProfit ? '+' : ''}${formatNaira(r.profitOrLossNaira || 0)}`,
        date: r.date,
        status: 'Realized Exit',
        rawSearchText: `gold etf sell exit profit ${ticker} ${r.date || ''}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // 10. Locked Savings
    lockedSavingsRecords.forEach((r) => {
      items.push({
        id: r.id,
        category: 'locked_savings',
        title: `${r.appOrPlatform || 'Fintech'} - ${r.savingsPackage || 'Locked Savings'}`,
        subtitle: `Rate: ${r.interestRatePercentPerAnnum}% p.a. &middot; ${r.durationDays} Days Tenor`,
        symbolOrTicker: 'SAVINGS',
        platform: r.appOrPlatform || 'Fintech App',
        primaryValue: formatNaira(r.amountInvestedNaira || 0),
        secondaryValue: `Matures: ${formatNaira(r.expectedInterestPlusCapitalNaira || 0)}`,
        date: r.investmentDate,
        status: r.status || 'Active',
        rawSearchText: `locked savings piggyvest fairmoney cowrywise palmpay kuda safelock fintech high yield ${r.appOrPlatform || ''} ${r.savingsPackage || ''} ${r.interestRatePercentPerAnnum}% ${r.durationDays} ${r.amountInvestedNaira}`.toLowerCase(),
        actionType: 'sheet'
      });
    });

    // Documents Vault
    (documents || []).forEach((doc) => {
      items.push({
        id: doc.id,
        category: 'documents',
        title: doc.name || 'Investment Document',
        subtitle: `${doc.fileType?.toUpperCase()} &middot; ${doc.fileSize} &middot; Category: ${doc.category}`,
        symbolOrTicker: 'DOC',
        platform: 'Document Vault',
        primaryValue: doc.category.toUpperCase(),
        secondaryValue: doc.uploadDate,
        date: doc.uploadDate,
        rawSearchText: `document contract receipt certificate note pdf ${doc.name || ''} ${doc.category || ''} ${doc.notes || ''}`.toLowerCase(),
        actionType: 'document'
      });
    });

    return items;
  }, [
    ubaDcaRecords,
    foreignStockBuys,
    foreignStockSells,
    nigerianStockBuys,
    nigerianStockSells,
    ebookDcaRecords,
    commercialPaperRecords,
    treasuryBillRecords,
    mutualFundRecords,
    fgnBondRecords,
    goldEtfBuys,
    goldEtfSells,
    lockedSavingsRecords,
    documents
  ]);

  // Filter and rank search results
  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const terms = query.split(/\s+/).filter(Boolean);

    const matches = allIndexedRecords.filter((record) => {
      // Filter group check
      if (selectedFilterGroup !== 'all') {
        if (selectedFilterGroup === 'stocks' && !['foreign_stocks', 'nigerian_stocks', 'ebook_dca'].includes(record.category)) {
          return false;
        }
        if (selectedFilterGroup === 'fixed_income' && !['commercial_papers', 'treasury_bills', 'fgn_bonds'].includes(record.category)) {
          return false;
        }
        if (selectedFilterGroup === 'savings' && !['locked_savings', 'uba_dca', 'mutual_funds'].includes(record.category)) {
          return false;
        }
        if (selectedFilterGroup === 'commodities' && record.category !== 'gold_etfs') {
          return false;
        }
        if (selectedFilterGroup === 'documents' && record.category !== 'documents') {
          return false;
        }
      }

      // Check all query terms
      return terms.every((term) => record.rawSearchText.includes(term));
    });

    // Ranking algorithm:
    // 1. Exact Ticker / Symbol match
    // 2. Title starts with query
    // 3. Category match
    // 4. General match
    return matches.sort((a, b) => {
      const aSymbolExact = a.symbolOrTicker?.toLowerCase() === query;
      const bSymbolExact = b.symbolOrTicker?.toLowerCase() === query;
      if (aSymbolExact && !bSymbolExact) return -1;
      if (!aSymbolExact && bSymbolExact) return 1;

      const aTitleStarts = a.title.toLowerCase().startsWith(query);
      const bTitleStarts = b.title.toLowerCase().startsWith(query);
      if (aTitleStarts && !bTitleStarts) return -1;
      if (!aTitleStarts && bTitleStarts) return 1;

      return 0;
    });
  }, [allIndexedRecords, searchQuery, selectedFilterGroup]);

  // Handle keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
        handleSelectResult(filteredResults[selectedIndex]);
      } else if (filteredResults.length > 0) {
        handleSelectResult(filteredResults[0]);
      }
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.actionType === 'document') {
      setActiveScreen('documents');
    } else if (item.category !== 'documents') {
      setActiveScreen('investments');
      setSelectedCategory(item.category);
    }
    setIsOpen(false);
    setIsMobileSearchOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getCategoryBadgeColor = (cat: InvestmentCategory | 'documents') => {
    if (cat === 'documents') return 'bg-[#747878] text-[#faf9f8]';
    return CATEGORY_DETAILS[cat]?.color || '#1a1c1c';
  };

  const getCategoryTag = (cat: InvestmentCategory | 'documents') => {
    if (cat === 'documents') return 'DOC';
    return CATEGORY_DETAILS[cat]?.tag || 'INV';
  };

  const getCategoryLabel = (cat: InvestmentCategory | 'documents') => {
    if (cat === 'documents') return 'Vault Document';
    return CATEGORY_DETAILS[cat]?.label || 'Investment';
  };

  // Quick jump suggestions for empty state
  const quickSuggestions = [
    { label: 'O (Realty Income)', query: 'O' },
    { label: 'Dangote Sugar CP', query: 'Dangote' },
    { label: 'ACCESSCORP', query: 'ACCESSCORP' },
    { label: 'GLD Gold ETF', query: 'GLD' },
    { label: 'FGN Bond 2028', query: 'FGN' },
    { label: 'FairMoney Savings', query: 'FairMoney' },
    { label: 'Treasury Bills', query: 'Treasury' }
  ];

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl mx-2 sm:mx-4 md:mx-6">
      {/* Search Input Bar (Desktop & Tablet) */}
      <div className="relative">
        <div className="flex items-center w-full bg-[#ffffff] border border-[#e3e2e1] hover:border-[#c4c7c7] focus-within:border-[#1a1c1c] rounded transition-colors shadow-2xs">
          <div className="pl-3 pr-2 py-2 text-[#747878] flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search all records by symbol, name, category, broker (e.g. O, GLD, ACCESSCORP, Dangote)..."
            className="w-full bg-transparent py-1.5 text-xs text-[#1a1c1c] placeholder-[#747878] focus:outline-none"
          />

          <div className="flex items-center gap-1 pr-2.5">
            {searchQuery ? (
              <button
                onClick={handleClear}
                className="p-1 text-[#747878] hover:text-[#1a1c1c] hover:bg-[#f4f3f2] rounded transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[#747878] bg-[#f4f3f2] border border-[#e3e2e1] rounded">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Live Search Results Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#ffffff] border border-[#e3e2e1] rounded shadow-xl z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Filter Chips Bar */}
          <div className="bg-[#faf9f8] border-b border-[#e3e2e1] px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-semibold text-[#747878] uppercase tracking-wider mr-1 shrink-0">
              Filter:
            </span>
            {[
              { id: 'all', label: 'All Records' },
              { id: 'stocks', label: 'Equities (US & NGX)' },
              { id: 'fixed_income', label: 'Fixed Income & Bonds' },
              { id: 'savings', label: 'Savings & Mutual Funds' },
              { id: 'commodities', label: 'Gold & Commodities' },
              { id: 'documents', label: 'Vault Documents' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilterGroup(f.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilterGroup === f.id
                    ? 'bg-[#1a1c1c] text-[#faf9f8]'
                    : 'bg-[#ffffff] text-[#444748] hover:bg-[#f4f3f2] border border-[#e3e2e1]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Results List Viewport */}
          <div ref={resultsContainerRef} className="max-h-[380px] overflow-y-auto divide-y divide-[#f4f3f2]">
            {searchQuery.trim() === '' ? (
              /* Empty state / Search Launcher */
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-[#747878]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Quick Suggestions</span>
                  <span className="text-[10px]">Total {allIndexedRecords.length} indexed records</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickSuggestions.map((item) => (
                    <button
                      key={item.query}
                      onClick={() => {
                        setSearchQuery(item.query);
                        inputRef.current?.focus();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#faf9f8] hover:bg-[#eeeeed] border border-[#e3e2e1] rounded text-xs text-[#1a1c1c] font-medium transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#1b6b51]" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#f4f3f2] flex items-center justify-between text-[11px] text-[#747878]">
                  <span>Navigate with <kbd className="font-mono bg-[#f4f3f2] px-1 py-0.5 rounded border border-[#e3e2e1]">↑</kbd> <kbd className="font-mono bg-[#f4f3f2] px-1 py-0.5 rounded border border-[#e3e2e1]">↓</kbd> and <kbd className="font-mono bg-[#f4f3f2] px-1 py-0.5 rounded border border-[#e3e2e1]">Enter</kbd></span>
                  <span>Press <kbd className="font-mono bg-[#f4f3f2] px-1 py-0.5 rounded border border-[#e3e2e1]">Esc</kbd> to close</span>
                </div>
              </div>
            ) : filteredResults.length > 0 ? (
              /* Results List */
              <>
                <div className="px-3 py-1.5 bg-[#faf9f8] text-[10px] font-semibold uppercase tracking-wider text-[#747878] flex items-center justify-between">
                  <span>Matched {filteredResults.length} {filteredResults.length === 1 ? 'Record' : 'Records'}</span>
                  <span>Press Enter to View</span>
                </div>

                {filteredResults.map((item, index) => {
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={`${item.category}-${item.id}-${index}`}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#f4f3f2]' : 'hover:bg-[#faf9f8]'
                      }`}
                    >
                      {/* Left Details */}
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shrink-0 text-[#ffffff]"
                          style={{
                            backgroundColor: typeof getCategoryBadgeColor(item.category) === 'string' && getCategoryBadgeColor(item.category).startsWith('#') 
                              ? getCategoryBadgeColor(item.category) 
                              : '#1a1c1c'
                          }}
                        >
                          {getCategoryTag(item.category)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#1a1c1c] truncate">
                              {item.title}
                            </span>
                            {item.symbolOrTicker && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#eeeeed] text-[#1a1c1c] shrink-0">
                                {item.symbolOrTicker}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#747878] truncate">
                            <span>{item.subtitle}</span>
                            {item.platform && (
                              <>
                                <span>&middot;</span>
                                <span className="text-[#444748]">{item.platform}</span>
                              </>
                            )}
                            {item.date && (
                              <>
                                <span>&middot;</span>
                                <span>{item.date}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Values */}
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-xs text-[#1a1c1c] font-mono">
                          {item.primaryValue}
                        </div>
                        {item.secondaryValue && (
                          <div className="text-[11px] text-[#747878] font-mono">
                            {item.secondaryValue}
                          </div>
                        )}
                      </div>

                      <ChevronRight className={`w-4 h-4 text-[#747878] transition-transform ${isSelected ? 'translate-x-0.5 text-[#1a1c1c]' : ''}`} />
                    </div>
                  );
                })}
              </>
            ) : (
              /* No Results State */
              <div className="p-6 text-center">
                <Search className="w-6 h-6 text-[#747878] mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-xs text-[#1a1c1c]">No investment records found</p>
                <p className="text-[11px] text-[#747878] mt-1 max-w-xs mx-auto">
                  No matches for &ldquo;{searchQuery}&rdquo;. Try searching by ticker (O, GLD), issuer (Dangote), fund name, or platform.
                </p>
                <button
                  onClick={handleClear}
                  className="mt-3 px-3 py-1 bg-[#1a1c1c] text-[#faf9f8] rounded text-xs font-semibold cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          {filteredResults.length > 0 && (
            <div className="bg-[#faf9f8] border-t border-[#e3e2e1] px-3 py-2 flex items-center justify-between text-[11px] text-[#747878]">
              <span>Click any record to jump straight to its spreadsheet ledger</span>
              <button
                onClick={() => {
                  setActiveScreen('transactions');
                  setIsOpen(false);
                }}
                className="font-semibold text-[#1a1c1c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Ledger</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
