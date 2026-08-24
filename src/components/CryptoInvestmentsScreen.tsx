import React, { useState, useMemo } from 'react';
import { useWealth } from '../context/WealthContext';
import { CryptoInvestmentRecord } from '../types';
import { formatFinancialValue, formatPercent } from '../utils/calculations';
import { 
  Coins, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Edit2, 
  DollarSign, 
  ArrowUpRight, 
  Wallet,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';

export const CryptoInvestmentsScreen: React.FC = () => {
  const { cryptoInvestments, addCryptoInvestment, updateCryptoInvestment, deleteCryptoInvestment, settings, summary } = useWealth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState<'ALL' | 'USD' | 'NGN'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CryptoInvestmentRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    cryptoName: '',
    ticker: '',
    investmentDate: new Date().toISOString().split('T')[0],
    quantity: '',
    purchasePrice: '',
    purchaseCurrency: 'USD' as 'USD' | 'NGN',
    exchange: '',
    transactionFee: '',
    currentPrice: '',
    notes: ''
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      cryptoName: '',
      ticker: '',
      investmentDate: new Date().toISOString().split('T')[0],
      quantity: '',
      purchasePrice: '',
      purchaseCurrency: 'USD',
      exchange: '',
      transactionFee: '0',
      currentPrice: '',
      notes: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: CryptoInvestmentRecord) => {
    setEditingRecord(rec);
    setFormData({
      cryptoName: rec.cryptoName || '',
      ticker: rec.ticker || '',
      investmentDate: rec.investmentDate || new Date().toISOString().split('T')[0],
      quantity: String(rec.quantity || ''),
      purchasePrice: String(rec.purchasePrice || ''),
      purchaseCurrency: rec.purchaseCurrency || 'USD',
      exchange: rec.exchange || '',
      transactionFee: String(rec.transactionFee || 0),
      currentPrice: String(rec.currentPrice || rec.purchasePrice || ''),
      notes: rec.notes || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cryptoName.trim() || !formData.ticker.trim()) {
      setFormError('Please enter a Cryptocurrency Name and Ticker Symbol.');
      return;
    }
    const qty = parseFloat(formData.quantity);
    const buyPrice = parseFloat(formData.purchasePrice);
    const fee = parseFloat(formData.transactionFee) || 0;
    const curPrice = parseFloat(formData.currentPrice) || buyPrice;

    if (isNaN(qty) || qty <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
      setFormError('Please enter valid positive numbers for Quantity and Purchase Price.');
      return;
    }

    const totalCost = (qty * buyPrice) + fee;
    const currentValue = qty * curPrice;
    const unrealizedGainLoss = currentValue - totalCost;
    const returnOnInvestmentPct = totalCost > 0 ? (unrealizedGainLoss / totalCost) * 100 : 0;

    const payload = {
      cryptoName: formData.cryptoName.trim(),
      ticker: formData.ticker.trim().toUpperCase(),
      investmentDate: formData.investmentDate,
      quantity: qty,
      purchasePrice: buyPrice,
      purchaseCurrency: formData.purchaseCurrency,
      exchange: formData.exchange.trim() || 'Cold Wallet / Exchange',
      transactionFee: fee,
      totalCost,
      currentPrice: curPrice,
      currentValue,
      unrealizedGainLoss,
      returnOnInvestmentPct,
      notes: formData.notes.trim()
    };

    try {
      if (editingRecord) {
        await updateCryptoInvestment(editingRecord.id, payload);
      } else {
        await addCryptoInvestment(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save cryptocurrency holding.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your crypto holdings?`)) {
      await deleteCryptoInvestment(id);
    }
  };

  // Filtered List
  const filteredRecords = useMemo(() => {
    return cryptoInvestments.filter(rec => {
      const matchesQuery = 
        (rec.cryptoName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.ticker || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.exchangeOrPlatform || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCurrency = selectedCurrencyFilter === 'ALL' || rec.purchaseCurrency === selectedCurrencyFilter;
      return matchesQuery && matchesCurrency;
    });
  }, [cryptoInvestments, searchQuery, selectedCurrencyFilter]);

  // Aggregated screen metrics
  const screenMetrics = useMemo(() => {
    const usdRate = settings?.currentUsdExchangeRate || 1780;
    let totalInvestedNaira = 0;
    let totalCurrentValueNaira = 0;

    cryptoInvestments.forEach(rec => {
      const cost = rec.purchaseCurrency === 'NGN' ? rec.totalCost : rec.totalCost * usdRate;
      const value = rec.purchaseCurrency === 'NGN' ? rec.currentValue : rec.currentValue * usdRate;
      totalInvestedNaira += cost;
      totalCurrentValueNaira += value;
    });

    const totalUnrealizedNaira = totalCurrentValueNaira - totalInvestedNaira;
    const totalRoi = totalInvestedNaira > 0 ? (totalUnrealizedNaira / totalInvestedNaira) * 100 : 0;

    // Largest asset
    let topHolding: CryptoInvestmentRecord | null = null;
    let maxVal = -1;
    cryptoInvestments.forEach(rec => {
      const val = rec.purchaseCurrency === 'NGN' ? rec.currentValue / usdRate : rec.currentValue;
      if (val > maxVal) {
        maxVal = val;
        topHolding = rec;
      }
    });

    return {
      totalInvestedNaira,
      totalCurrentValueNaira,
      totalUnrealizedNaira,
      totalRoi,
      topHolding,
      totalHoldingsCount: cryptoInvestments.length
    };
  }, [cryptoInvestments, settings?.currentUsdExchangeRate]);

  return (
    <div className="space-y-6">
      {/* Category Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f59e0b]/10 text-[#b45309] dark:bg-[#f59e0b]/20 dark:text-[#fbbf24] border border-[#f59e0b]/30">
              CATEGORY 1 &middot; INVESTMENT ASSET
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2] mt-1.5 flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#f59e0b]" />
            <span>Crypto Investments (Long-Term Holdings)</span>
          </h1>
          <p className="text-xs sm:text-[13px] text-[#747878] dark:text-[#8c9290] mt-1">
            Spot cryptocurrency balances, hardware wallet custody, cost basis, live valuation, and ROI tracking.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] px-4 py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Crypto Asset</span>
        </button>
      </div>

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">TOTAL CRYPTO VALUATION</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#e1e3e2] mt-1">
            {formatFinancialValue(screenMetrics.totalCurrentValueNaira, settings)}
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">
            {screenMetrics.totalHoldingsCount} active asset {screenMetrics.totalHoldingsCount === 1 ? 'position' : 'positions'}
          </div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">TOTAL CAPITAL INVESTED</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#e1e3e2] mt-1">
            {formatFinancialValue(screenMetrics.totalInvestedNaira, settings)}
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">
            Cumulative purchase cost + fees
          </div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">UNREALIZED PROFIT / LOSS</div>
          <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${screenMetrics.totalUnrealizedNaira >= 0 ? 'text-[#1b6b51] dark:text-[#60d3a7]' : 'text-[#ba1a1a] dark:text-[#ff897d]'}`}>
            {screenMetrics.totalUnrealizedNaira >= 0 ? '+' : ''}{formatFinancialValue(screenMetrics.totalUnrealizedNaira, settings)}
          </div>
          <div className="text-xs font-semibold mt-1">
            <span className={screenMetrics.totalRoi >= 0 ? 'text-[#1b6b51] dark:text-[#60d3a7]' : 'text-[#ba1a1a] dark:text-[#ff897d]'}>
              {screenMetrics.totalRoi >= 0 ? '+' : ''}{formatPercent(screenMetrics.totalRoi)} overall ROI
            </span>
          </div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">PRIMARY CRYPTO ASSET</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#e1e3e2] mt-1 truncate">
            {screenMetrics.topHolding ? `${screenMetrics.topHolding.ticker} (${screenMetrics.topHolding.cryptoName})` : 'None'}
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">
            {screenMetrics.topHolding ? `Valued at ${screenMetrics.topHolding.purchaseCurrency === 'USD' ? '$' : '₦'}${screenMetrics.topHolding.currentValue.toLocaleString()}` : 'No records registered'}
          </div>
        </div>
      </div>

      {/* Table Controls & Filter Bar */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-4 rounded flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#747878] dark:text-[#8c9290]" />
          <input
            type="text"
            placeholder="Search coin, ticker, exchange, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290]">Currency:</span>
          {(['ALL', 'USD', 'NGN'] as const).map(curr => (
            <button
              key={curr}
              onClick={() => setSelectedCurrencyFilter(curr)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                selectedCurrencyFilter === curr
                  ? 'bg-[#1a1c1c] text-[#faf9f8] dark:bg-[#e1e3e2] dark:text-[#111313]'
                  : 'bg-[#faf9f8] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130]'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Crypto Holdings Table */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded overflow-hidden transition-colors shadow-xs">
        <div className="p-4 bg-[#f4f3f2] dark:bg-[#222625] border-b border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#f59e0b]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c] dark:text-[#e1e3e2]">
              Cryptocurrency Portfolio Ledger ({filteredRecords.length})
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#747878] dark:text-[#8c9290]">
            Audited Spot Positions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f8] dark:bg-[#191c1b] text-[#444748] dark:text-[#c2c7c5] border-b border-[#e3e2e1] dark:border-[#2d3130] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ASSET / TICKER</th>
                <th className="py-3 px-4">PURCHASE DATE</th>
                <th className="py-3 px-4 font-mono text-right">QUANTITY</th>
                <th className="py-3 px-4 font-mono text-right">BUY PRICE</th>
                <th className="py-3 px-4 font-mono text-right">TOTAL COST</th>
                <th className="py-3 px-4 font-mono text-right">CURRENT PRICE</th>
                <th className="py-3 px-4 font-mono text-right">CURRENT VALUE</th>
                <th className="py-3 px-4 font-mono text-right">UNREALIZED P/L</th>
                <th className="py-3 px-4 font-mono text-right">ROI</th>
                <th className="py-3 px-4">EXCHANGE / CUSTODY</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed] dark:divide-[#2d3130]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-[#747878] dark:text-[#8c9290]">
                    No cryptocurrency holdings found. Click "Add Crypto Asset" to record your spot positions.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const currSym = rec.purchaseCurrency === 'USD' ? '$' : '₦';
                  const isProfit = (rec.unrealizedGainLoss || 0) >= 0;
                  return (
                    <tr key={rec.id} className="hover:bg-[#faf9f8] dark:hover:bg-[#222625] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#f59e0b]/15 text-[#b45309] dark:text-[#fbbf24] flex items-center justify-center font-bold font-mono text-xs">
                            {rec.ticker?.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">{rec.cryptoName}</div>
                            <div className="text-[10px] font-mono font-semibold text-[#747878] dark:text-[#8c9290]">{rec.ticker} &middot; {rec.purchaseCurrency}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#444748] dark:text-[#c2c7c5] whitespace-nowrap font-mono">{rec.investmentDate}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] text-right">{rec.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                      <td className="py-3 px-4 font-mono text-[#444748] dark:text-[#c2c7c5] text-right">{currSym}{rec.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] text-right">{currSym}{rec.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 font-mono text-[#444748] dark:text-[#c2c7c5] text-right">{currSym}{rec.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#1a1c1c] dark:text-[#e1e3e2] text-right">{currSym}{rec.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`py-3 px-4 font-mono font-bold text-right ${isProfit ? 'text-[#1b6b51] dark:text-[#60d3a7]' : 'text-[#ba1a1a] dark:text-[#ff897d]'}`}>
                        {isProfit ? '+' : ''}{currSym}{rec.unrealizedGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-4 font-mono font-bold text-right ${isProfit ? 'text-[#1b6b51] dark:text-[#60d3a7]' : 'text-[#ba1a1a] dark:text-[#ff897d]'}`}>
                        {isProfit ? '+' : ''}{formatPercent(rec.returnOnInvestmentPct)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#f4f3f2] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130] whitespace-nowrap">
                          {rec.exchangeOrPlatform || 'Cold Wallet'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            title="Edit Holding"
                            className="p-1.5 hover:bg-[#e3e2e1] dark:hover:bg-[#2d3130] text-[#747878] dark:text-[#8c9290] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2] rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id, `${rec.cryptoName} (${rec.ticker})`)}
                            title="Delete Holding"
                            className="p-1.5 hover:bg-[#ba1a1a]/10 text-[#ba1a1a] dark:text-[#ff897d] rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e1] dark:border-[#2d3130]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#f59e0b]" />
                <h2 className="text-base font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  {editingRecord ? 'Edit Crypto Holding' : 'Add New Crypto Asset'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded text-xs bg-[#ba1a1a]/10 text-[#ba1a1a] dark:text-[#ff897d] border border-[#ba1a1a]/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Cryptocurrency Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bitcoin, Ethereum"
                    value={formData.cryptoName}
                    onChange={(e) => setFormData({ ...formData, cryptoName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Ticker Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTC, ETH, SOL"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.investmentDate}
                    onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.purchaseCurrency}
                    onChange={(e) => setFormData({ ...formData, purchaseCurrency: e.target.value as 'USD' | 'NGN' })}
                    className="w-full px-3 py-2 text-xs bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Current Market Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Same as purchase if empty"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Transaction Fee
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formData.transactionFee}
                    onChange={(e) => setFormData({ ...formData, transactionFee: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                  Exchange / Platform / Wallet
                </label>
                <input
                  type="text"
                  placeholder="e.g. Binance, Ledger Nano X, Bybit, Coinbase"
                  value={formData.exchange}
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                  Notes &amp; Strategy
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Long-term DCA, cold storage vault, halving cycle target"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e3e2e1] dark:border-[#2d3130]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#444748] dark:text-[#c2c7c5] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded cursor-pointer shadow-xs transition-colors"
                >
                  {editingRecord ? 'Save Changes' : 'Record Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
