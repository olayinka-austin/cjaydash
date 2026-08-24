import React, { useState, useMemo } from 'react';
import { useWealth } from '../context/WealthContext';
import { CryptoInvestmentRecord } from '../types';
import { formatNaira, formatUSD, formatDate } from '../utils/calculations';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Coins, 
  Search, 
  X, 
  Check, 
  Calculator
} from 'lucide-react';

const COMMON_EXCHANGES = [
  'Binance',
  'Luno',
  'Remitano',
  'Bybit',
  'KuCoin',
  'Coinbase',
  'OKX',
  'Kraken',
  'Trust Wallet',
  'Ledger'
];

export const CryptoInvestmentsScreen: React.FC = () => {
  const { 
    cryptoInvestments, 
    addCryptoInvestment, 
    updateCryptoInvestment, 
    deleteCryptoInvestment, 
    settings 
  } = useWealth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CryptoInvestmentRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    cryptoName: '',
    ticker: 'BTC',
    investmentDate: new Date().toISOString().split('T')[0],
    quantity: '0.05',
    unitPrice: '60000',
    dollarRate: (settings.currentUsdExchangeRate || 1600).toString(),
    exchange: 'Binance',
    customExchange: '',
    currentPrice: '',
    notes: ''
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Totals calculations across crypto investment buy records
  const totalBuyQty = useMemo(() => {
    return cryptoInvestments.reduce((acc, r) => acc + (r.qty ?? r.quantity ?? 0), 0);
  }, [cryptoInvestments]);

  const totalBuyAmountUsd = useMemo(() => {
    return cryptoInvestments.reduce((acc, r) => {
      if (typeof r.totalAmountUsd === 'number') return acc + r.totalAmountUsd;
      if (typeof r.totalCostUsd === 'number') return acc + r.totalCostUsd;
      const unit = r.unitPriceUsd ?? r.purchasePrice ?? 0;
      const q = r.qty ?? r.quantity ?? 0;
      return acc + (unit * q);
    }, 0);
  }, [cryptoInvestments]);

  const totalBuyAmountNaira = useMemo(() => {
    return cryptoInvestments.reduce((acc, r) => {
      if (typeof r.totalAmountNaira === 'number') return acc + r.totalAmountNaira;
      if (typeof r.totalCostNaira === 'number') return acc + r.totalCostNaira;
      const unit = r.unitPriceUsd ?? r.purchasePrice ?? 0;
      const q = r.qty ?? r.quantity ?? 0;
      const rate = r.dollarRateNaira ?? (settings.currentUsdExchangeRate || 1600);
      return acc + (unit * q * rate);
    }, 0);
  }, [cryptoInvestments, settings.currentUsdExchangeRate]);

  const avgBuyPrice = useMemo(() => {
    if (cryptoInvestments.length === 0) return 0;
    const sumUnitPrice = cryptoInvestments.reduce((acc, r) => acc + (r.unitPriceUsd ?? r.purchasePrice ?? 0), 0);
    return sumUnitPrice / cryptoInvestments.length;
  }, [cryptoInvestments]);

  const totalCurrentValuationUsd = useMemo(() => {
    return cryptoInvestments.reduce((acc, r) => {
      const q = r.qty ?? r.quantity ?? 0;
      const cur = r.currentPrice ?? r.unitPriceUsd ?? r.purchasePrice ?? 0;
      return acc + (q * cur);
    }, 0);
  }, [cryptoInvestments]);

  const totalCurrentValuationNaira = useMemo(() => {
    const usdRate = settings.currentUsdExchangeRate || 1600;
    return totalCurrentValuationUsd * usdRate;
  }, [totalCurrentValuationUsd, settings.currentUsdExchangeRate]);

  const totalUnrealizedPLUsd = totalCurrentValuationUsd - totalBuyAmountUsd;
  const totalUnrealizedPLNaira = totalCurrentValuationNaira - totalBuyAmountNaira;

  // Filtered List
  const filteredRecords = useMemo(() => {
    return cryptoInvestments.filter(rec => {
      const q = searchQuery.toLowerCase();
      const nameMatch = (rec.cryptoName || '').toLowerCase().includes(q);
      const tickerMatch = (rec.ticker || '').toLowerCase().includes(q);
      const exchangeMatch = ((rec.exchange || rec.exchangeOrPlatform || '')).toLowerCase().includes(q);
      const notesMatch = (rec.notes || '').toLowerCase().includes(q);
      return nameMatch || tickerMatch || exchangeMatch || notesMatch;
    });
  }, [cryptoInvestments, searchQuery]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      cryptoName: 'Bitcoin',
      ticker: 'BTC',
      investmentDate: new Date().toISOString().split('T')[0],
      quantity: '',
      unitPrice: '',
      dollarRate: (settings.currentUsdExchangeRate || 1600).toString(),
      exchange: 'Binance',
      customExchange: '',
      currentPrice: '',
      notes: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: CryptoInvestmentRecord) => {
    setEditingRecord(rec);
    const existingExchange = rec.exchange || rec.exchangeOrPlatform || '';
    const isPreset = COMMON_EXCHANGES.includes(existingExchange);

    setFormData({
      cryptoName: rec.cryptoName || '',
      ticker: rec.ticker || 'BTC',
      investmentDate: rec.investmentDate || rec.date || new Date().toISOString().split('T')[0],
      quantity: String(rec.qty ?? rec.quantity ?? ''),
      unitPrice: String(rec.unitPriceUsd ?? rec.purchasePrice ?? ''),
      dollarRate: String(rec.dollarRateNaira ?? settings.currentUsdExchangeRate ?? 1600),
      exchange: isPreset ? existingExchange : (existingExchange ? 'Other' : 'Binance'),
      customExchange: isPreset ? '' : existingExchange,
      currentPrice: String(rec.currentPrice ?? rec.unitPriceUsd ?? rec.purchasePrice ?? ''),
      notes: rec.notes || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cryptoName.trim() && !formData.ticker.trim()) {
      setFormError('Please enter a cryptocurrency name or ticker symbol.');
      return;
    }

    const qty = parseFloat(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    const dollarRate = parseFloat(formData.dollarRate) || settings.currentUsdExchangeRate || 1600;
    const curPrice = parseFloat(formData.currentPrice) || unitPrice;

    if (isNaN(qty) || qty <= 0 || isNaN(unitPrice) || unitPrice <= 0) {
      setFormError('Please enter valid positive numbers for Quantity and Unit Price ($).');
      return;
    }

    const finalExchange = formData.exchange === 'Other' 
      ? (formData.customExchange.trim() || 'Not specified')
      : (formData.exchange.trim() || 'Not specified');

    const amountUsd = unitPrice * qty;
    const totalAmountUsd = amountUsd;
    const totalAmountNaira = totalAmountUsd * dollarRate;
    const currentValueUsd = qty * curPrice;
    const currentValueNaira = currentValueUsd * dollarRate;
    const unrealizedPLUsd = currentValueUsd - totalAmountUsd;
    const unrealizedPLNaira = currentValueNaira - totalAmountNaira;
    const roiPct = totalAmountUsd > 0 ? (unrealizedPLUsd / totalAmountUsd) * 100 : 0;

    const payload = {
      cryptoName: formData.cryptoName.trim() || formData.ticker.trim(),
      ticker: formData.ticker.trim().toUpperCase(),
      investmentDate: formData.investmentDate,
      date: formData.investmentDate,
      unitPriceUsd: unitPrice,
      purchasePrice: unitPrice,
      purchaseCurrency: 'USD' as const,
      dollarRateNaira: dollarRate,
      qty,
      quantity: qty,
      amountUsd,
      totalAmountUsd,
      totalAmountNaira,
      exchange: finalExchange,
      exchangeOrPlatform: finalExchange,
      transactionFee: 0,
      totalCost: totalAmountUsd,
      totalCostUsd: totalAmountUsd,
      totalCostNaira: totalAmountNaira,
      currentPrice: curPrice,
      currentValue: currentValueUsd,
      currentValueUsd,
      currentValueNaira,
      unrealizedProfitLoss: unrealizedPLUsd,
      unrealizedGainLoss: unrealizedPLUsd,
      unrealizedProfitLossUsd: unrealizedPLUsd,
      unrealizedProfitLossNaira: unrealizedPLNaira,
      roiPercentage: roiPct,
      returnOnInvestmentPct: roiPct,
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
      setFormError(err.message || 'Failed to save crypto investment record.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete this crypto investment record (${name})?`)) {
      await deleteCryptoInvestment(id);
    }
  };

  // Preview Calculations in Modal
  const previewQty = parseFloat(formData.quantity) || 0;
  const previewUnitPrice = parseFloat(formData.unitPrice) || 0;
  const previewDollarRate = parseFloat(formData.dollarRate) || settings.currentUsdExchangeRate || 1600;
  const previewAmountUsd = previewUnitPrice * previewQty;
  const previewTotalUsd = previewAmountUsd;
  const previewTotalNaira = previewTotalUsd * previewDollarRate;

  return (
    <div className="space-y-6">
      {/* Header Cards — Reusing Gold ETF Header Card Structure */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#b45309] uppercase tracking-wider">AVG BUY PRICE ($)</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">${avgBuyPrice.toFixed(2)}</div>
          <div className="text-xs text-[#747878] mt-0.5">BTC &middot; ETH &middot; SOL &middot; Spot</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL CRYPTO BOUGHT</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{formatUSD(totalBuyAmountUsd)}</div>
          <div className="text-xs font-mono text-[#747878] mt-0.5">{formatNaira(totalBuyAmountNaira)}</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">NET ACTIVE UNITS</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{totalBuyQty.toLocaleString(undefined, { maximumFractionDigits: 4 })} Units</div>
          <div className="text-xs text-[#747878] mt-0.5">{cryptoInvestments.length} recorded positions</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">UNREALIZED PROFIT/LOSS</div>
          <div className={`text-xl font-bold font-mono mt-1 ${totalUnrealizedPLUsd >= 0 ? 'text-[#1b6b51]' : 'text-[#ba1a1a]'}`}>
            {totalUnrealizedPLUsd >= 0 ? '+' : ''}{formatUSD(totalUnrealizedPLUsd)}
          </div>
          <div className="text-xs font-mono text-[#1b6b51] mt-0.5">
            {totalUnrealizedPLNaira >= 0 ? '+' : ''}{formatNaira(totalUnrealizedPLNaira)}
          </div>
        </div>
      </div>

      {/* Action and Search Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#e3e2e1] pb-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#747878]" />
          <input
            type="text"
            placeholder="Search crypto, ticker, exchange..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#ffffff] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c]"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Crypto Investment</span>
        </button>
      </div>

      {/* BUY TABLE — Exactly Reusing Gold ETF Buy Records Table Design */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-3 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Crypto Investment &middot; Buy Records</span>
          <span className="text-xs font-mono text-[#747878]">Total Buy: {formatUSD(totalBuyAmountUsd)} / {formatNaira(totalBuyAmountNaira)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">S/NO</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-3">CRYPTO / TICKER</th>
                <th className="py-3 px-3">UNIT PRICE ($)</th>
                <th className="py-3 px-3">DOLLAR RATE (₦)</th>
                <th className="py-3 px-3">QTY</th>
                <th className="py-3 px-3">AMOUNT ($)</th>
                <th className="py-3 px-3">TOTAL ($)</th>
                <th className="py-3 px-3">TOTAL (₦)</th>
                <th className="py-3 px-3">EXCHANGE</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-[#747878]">
                    No crypto investment records found. Click &quot;New Crypto Investment&quot; to record your buy transactions.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const unitPrice = r.unitPriceUsd ?? r.purchasePrice ?? 0;
                  const qty = r.qty ?? r.quantity ?? 0;
                  const dollarRate = r.dollarRateNaira ?? settings.currentUsdExchangeRate ?? 1600;
                  const amountUsd = r.amountUsd ?? (unitPrice * qty);
                  const totalAmountUsd = r.totalAmountUsd ?? amountUsd;
                  const totalAmountNaira = r.totalAmountNaira ?? (totalAmountUsd * dollarRate);
                  const exchangeDisplay = r.exchange || r.exchangeOrPlatform || 'Not specified';
                  const dateStr = r.investmentDate || r.date || r.createdAt;
                  const tickerStr = r.ticker || '';
                  const nameStr = r.cryptoName || '';

                  // Crypto / Ticker label format
                  const cryptoLabel = tickerStr 
                    ? (nameStr && nameStr.toUpperCase() !== tickerStr.toUpperCase() ? `${nameStr} (${tickerStr})` : tickerStr) 
                    : (nameStr || '—');

                  return (
                    <tr key={r.id} className="hover:bg-[#faf9f8] transition-colors">
                      <td className="py-3 px-3 font-mono text-[#747878]">{r.sNo || idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-medium text-[#1a1c1c]">{formatDate(dateStr)}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{cryptoLabel}</td>
                      <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(unitPrice, true)}</td>
                      <td className="py-3 px-3 font-mono text-[#747878]">{formatNaira(dollarRate)}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">
                        {typeof qty === 'number' ? qty.toLocaleString(undefined, { maximumFractionDigits: 8 }) : qty}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(amountUsd, true)}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{formatUSD(totalAmountUsd, true)}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(totalAmountNaira)}</td>
                      <td className="py-3 px-3 font-mono text-[#444748]">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1] whitespace-nowrap">
                          {exchangeDisplay}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEdit(r)} 
                            title="Edit Record" 
                            className="text-[#747878] hover:text-[#1a1c1c] p-1 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(r.id, r.cryptoName || r.ticker || 'Crypto Record')} 
                            title="Delete Record" 
                            className="text-[#747878] hover:text-[#ba1a1a] p-1 cursor-pointer transition-colors"
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
            <tfoot className="bg-[#f4f3f2]/60 font-semibold border-t border-[#e3e2e1] text-xs">
              <tr>
                <td colSpan={5} className="py-3 px-3 font-bold text-[#1a1c1c]">TOTAL CRYPTO BOUGHT</td>
                <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">
                  {totalBuyQty.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(totalBuyAmountUsd)}</td>
                <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{formatUSD(totalBuyAmountUsd)}</td>
                <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{formatNaira(totalBuyAmountNaira)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add / Edit Crypto Investment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#ffffff] border border-[#e3e2e1] rounded max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e1]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#b45309]" />
                <h2 className="text-base font-bold text-[#1a1c1c]">
                  {editingRecord ? 'Edit Crypto Investment Record' : 'New Crypto Investment Record'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#747878] hover:text-[#1a1c1c] rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded text-xs bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.investmentDate}
                    onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] mb-1">
                    Crypto / Ticker *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTC, ETH, SOL"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      ticker: e.target.value.toUpperCase(),
                      cryptoName: formData.cryptoName || e.target.value 
                    })}
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-[#faf9f8] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] mb-1">
                  Cryptocurrency Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bitcoin, Ethereum, Solana"
                  value={formData.cryptoName}
                  onChange={(e) => setFormData({ ...formData, cryptoName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#faf9f8] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] mb-1">
                    Unit Price ($) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 60000"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] mb-1">
                    Dollar Rate (₦) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1600"
                    value={formData.dollarRate}
                    onChange={(e) => setFormData({ ...formData, dollarRate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 0.05"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c]"
                  />
                </div>
              </div>

              {/* Exchange Selection */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] mb-1">
                  Exchange / Platform
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-2">
                  {COMMON_EXCHANGES.map(ex => (
                    <button
                      type="button"
                      key={ex}
                      onClick={() => setFormData({ ...formData, exchange: ex })}
                      className={`px-2 py-1 text-[11px] font-mono rounded text-center transition-all cursor-pointer truncate ${
                        formData.exchange === ex
                          ? 'bg-[#1a1c1c] text-[#faf9f8] font-bold shadow-xs'
                          : 'bg-[#faf9f8] text-[#444748] border border-[#e3e2e1] hover:bg-[#f4f3f2]'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={COMMON_EXCHANGES.includes(formData.exchange) ? formData.exchange : 'Other'}
                    onChange={(e) => {
                      if (e.target.value === 'Other') {
                        setFormData({ ...formData, exchange: 'Other' });
                      } else {
                        setFormData({ ...formData, exchange: e.target.value, customExchange: '' });
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-mono bg-[#faf9f8] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c] shrink-0"
                  >
                    {COMMON_EXCHANGES.map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                    <option value="Other">Other (Specify...)</option>
                  </select>

                  {(!COMMON_EXCHANGES.includes(formData.exchange) || formData.exchange === 'Other') && (
                    <input
                      type="text"
                      placeholder="Specify custom exchange name..."
                      value={formData.customExchange}
                      onChange={(e) => setFormData({ ...formData, customExchange: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#faf9f8] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c]"
                    />
                  )}
                </div>
              </div>

              {/* Calculated Live Preview Box */}
              <div className="bg-[#faf9f8] border border-[#e3e2e1] p-3 rounded space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#747878] uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>Calculated Value Preview</span>
                  </div>
                  <span>No Commission</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <div className="text-[10px] text-[#747878]">AMOUNT ($)</div>
                    <div className="text-xs font-mono font-bold text-[#1a1c1c]">{formatUSD(previewAmountUsd, true)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#747878]">TOTAL ($)</div>
                    <div className="text-xs font-mono font-bold text-[#1a1c1c]">{formatUSD(previewTotalUsd, true)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#747878]">TOTAL (₦)</div>
                    <div className="text-xs font-mono font-bold text-[#1a1c1c]">{formatNaira(previewTotalNaira)}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] mb-1">
                  Notes &amp; Strategy (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Long-term DCA, cold storage, halving target"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#faf9f8] border border-[#e3e2e1] rounded focus:outline-none focus:border-[#1a1c1c] text-[#1a1c1c]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e3e2e1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#444748] hover:bg-[#f4f3f2] rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingRecord ? 'Save Changes' : 'Record Investment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
