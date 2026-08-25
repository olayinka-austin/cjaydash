import React, { useState, useMemo } from 'react';
import { useWealth } from '../context/WealthContext';
import { CryptoDayTradeRecord } from '../types';
import { formatFinancialValue, formatPercent, formatUSD } from '../utils/calculations';
import { 
  Activity, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Edit2, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Target,
  Percent,
  Calculator,
  Check,
  X
} from 'lucide-react';
import { TradingNotesAndRulesSection } from './TradingNotesAndRulesSection';

const PRESET_EXCHANGES = ['Binance', 'Luno', 'Remitano', 'Bybit', 'KuCoin', 'Coinbase', 'OKX', 'Kraken'];

export const CryptoDayTradingScreen: React.FC = () => {
  const { cryptoDayTrades, addCryptoDayTrade, updateCryptoDayTrade, deleteCryptoDayTrade, settings, summary } = useWealth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CryptoDayTradeRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tradeDate: new Date().toISOString().split('T')[0],
    entryTime: '09:30',
    exitTime: '15:45',
    cryptoName: '',
    ticker: '',
    positionType: 'LONG' as 'LONG' | 'SHORT',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    tradingFee: '0',
    exchange: 'Binance',
    strategy: 'Breakout Momentum',
    notes: ''
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      tradeDate: new Date().toISOString().split('T')[0],
      entryTime: '09:30',
      exitTime: '15:45',
      cryptoName: '',
      ticker: '',
      positionType: 'LONG',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      tradingFee: '0',
      exchange: 'Binance',
      strategy: 'Breakout Momentum',
      notes: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trade: CryptoDayTradeRecord) => {
    setEditingRecord(trade);
    setFormData({
      tradeDate: trade.tradeDate || new Date().toISOString().split('T')[0],
      entryTime: trade.entryTime || '09:30',
      exitTime: trade.exitTime || '15:45',
      cryptoName: trade.cryptoName || '',
      ticker: trade.ticker || '',
      positionType: (trade.positionType?.toUpperCase() === 'SHORT' ? 'SHORT' : 'LONG') as 'LONG' | 'SHORT',
      entryPrice: String(trade.entryPrice ?? ''),
      exitPrice: String(trade.exitPrice ?? ''),
      quantity: String(trade.quantity ?? ''),
      tradingFee: String(trade.tradingFee ?? 0),
      exchange: trade.exchange || 'Binance',
      strategy: trade.strategy || 'Breakout Momentum',
      notes: trade.notes || ''
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
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const fee = parseFloat(formData.tradingFee) || 0;

    if (isNaN(qty) || qty <= 0 || isNaN(entry) || entry <= 0 || isNaN(exit) || exit <= 0) {
      setFormError('Please enter valid numeric values for Quantity, Entry Price, and Exit Price.');
      return;
    }

    const entryValue = qty * entry;
    const exitValue = qty * exit;
    
    // Position type logic: Long vs. Short
    let grossProfitLoss = 0;
    if (formData.positionType === 'LONG') {
      grossProfitLoss = exitValue - entryValue;
    } else {
      grossProfitLoss = entryValue - exitValue;
    }

    const netProfitLoss = grossProfitLoss - fee;
    const roiPercent = entryValue > 0 ? (netProfitLoss / entryValue) * 100 : 0;

    const payload = {
      tradeDate: formData.tradeDate,
      entryTime: formData.entryTime,
      exitTime: formData.exitTime,
      cryptoName: formData.cryptoName.trim(),
      ticker: formData.ticker.trim().toUpperCase(),
      positionType: formData.positionType === 'LONG' ? ('Long' as const) : ('Short' as const),
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      entryValue,
      exitValue,
      tradingFee: fee,
      grossProfitLoss,
      netProfitLoss,
      roiPercentage: roiPercent,
      exchange: formData.exchange.trim() || 'Binance',
      strategy: formData.strategy.trim() || 'Day Trade',
      notes: formData.notes.trim()
    };

    try {
      if (editingRecord) {
        await updateCryptoDayTrade(editingRecord.id, payload);
      } else {
        await addCryptoDayTrade(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save crypto day trade.');
    }
  };

  const handleDelete = async (id: string, ticker: string, pnl: number) => {
    if (window.confirm(`Are you sure you want to delete this ${ticker} trade log (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)})?`)) {
      await deleteCryptoDayTrade(id);
    }
  };

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return cryptoDayTrades.filter(t => {
      const matchesQuery = 
        (t.cryptoName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.ticker || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.exchange || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.strategy || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPos = positionFilter === 'ALL' || t.positionType?.toUpperCase() === positionFilter;
      
      let matchesOutcome = true;
      if (outcomeFilter === 'WIN') matchesOutcome = (t.netProfitLoss || 0) > 0;
      if (outcomeFilter === 'LOSS') matchesOutcome = (t.netProfitLoss || 0) < 0;

      return matchesQuery && matchesPos && matchesOutcome;
    });
  }, [cryptoDayTrades, searchQuery, positionFilter, outcomeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalTrades = cryptoDayTrades.length;
    const winningTrades = cryptoDayTrades.filter(t => (t.netProfitLoss || 0) > 0).length;
    const losingTrades = cryptoDayTrades.filter(t => (t.netProfitLoss || 0) < 0).length;
    const breakevenTrades = cryptoDayTrades.filter(t => (t.netProfitLoss || 0) === 0).length;

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const totalGrossPl = cryptoDayTrades.reduce((acc, t) => acc + (t.grossProfitLoss || 0), 0);
    const totalFees = cryptoDayTrades.reduce((acc, t) => acc + (t.tradingFee || 0), 0);
    const totalNetPl = cryptoDayTrades.reduce((acc, t) => acc + (t.netProfitLoss || 0), 0);
    const avgProfitPerTrade = totalTrades > 0 ? totalNetPl / totalTrades : 0;

    const netPlList = cryptoDayTrades.map(t => t.netProfitLoss || 0);
    const bestTrade = netPlList.length > 0 ? Math.max(...netPlList) : 0;
    const worstTrade = netPlList.length > 0 ? Math.min(...netPlList) : 0;

    const totalVolumeUsd = cryptoDayTrades.reduce((acc, t) => acc + (t.entryValue || 0), 0);

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      breakevenTrades,
      winRate,
      totalGrossPl,
      totalFees,
      totalNetPl,
      avgProfitPerTrade,
      bestTrade,
      worstTrade,
      totalVolumeUsd
    };
  }, [cryptoDayTrades]);

  return (
    <div className="space-y-6">
      {/* Category Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b6b51]/10 text-[#1b6b51] dark:bg-[#1b6b51]/30 dark:text-[#60d3a7] border border-[#1b6b51]/20">
              CATEGORY 1 &middot; ACTIVE INVESTMENT TRADING
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2] mt-1.5 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#1b6b51] dark:text-[#60d3a7]" />
            <span>Crypto Day Trading (Journal &amp; Performance)</span>
          </h1>
          <p className="text-xs sm:text-[13px] text-[#747878] dark:text-[#8c9290] mt-1">
            Execution journal, long/short positions, realized P/L calculations, fee deductions, win rate analytics, and strategy review.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] px-4 py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Day Trade</span>
        </button>
      </div>

      {/* Analytics & Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">NET REALIZED TRADING P/L</div>
          <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${stats.totalNetPl >= 0 ? 'text-[#1b6b51] dark:text-[#60d3a7]' : 'text-[#ba1a1a] dark:text-[#ff897d]'}`}>
            {stats.totalNetPl >= 0 ? '+' : ''}${stats.totalNetPl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">
            After deducting ${stats.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2 })} in trading fees
          </div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">WIN RATE &amp; ACCURACY</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#e1e3e2] mt-1">
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-xs font-semibold text-[#1b6b51] dark:text-[#60d3a7] mt-1">
            {stats.winningTrades} Wins &middot; <span className="text-[#ba1a1a] dark:text-[#ff897d]">{stats.losingTrades} Losses</span> &middot; {stats.totalTrades} Total
          </div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">AVG PROFIT PER TRADE</div>
          <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${stats.avgProfitPerTrade >= 0 ? 'text-[#1b6b51] dark:text-[#60d3a7]' : 'text-[#ba1a1a] dark:text-[#ff897d]'}`}>
            {stats.avgProfitPerTrade >= 0 ? '+' : ''}${stats.avgProfitPerTrade.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">
            Expected trade expectancy
          </div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">BEST VS. WORST TRADE</div>
          <div className="text-sm font-bold font-mono text-[#1b6b51] dark:text-[#60d3a7] mt-1 flex items-center justify-between">
            <span>Best: +${stats.bestTrade.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[#ba1a1a] dark:text-[#ff897d]">Worst: ${stats.worstTrade.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">
            Cumulative traded volume: ${stats.totalVolumeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-4 rounded flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#747878] dark:text-[#8c9290]" />
          <input
            type="text"
            placeholder="Search coin, ticker, strategy, exchange..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          {/* Position Type Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290]">Position:</span>
            {(['ALL', 'LONG', 'SHORT'] as const).map(pos => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                  positionFilter === pos
                    ? 'bg-[#1a1c1c] text-[#faf9f8] dark:bg-[#e1e3e2] dark:text-[#111313]'
                    : 'bg-[#faf9f8] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130]'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290]">Outcome:</span>
            {(['ALL', 'WIN', 'LOSS'] as const).map(out => (
              <button
                key={out}
                onClick={() => setOutcomeFilter(out)}
                className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                  outcomeFilter === out
                    ? 'bg-[#1a1c1c] text-[#faf9f8] dark:bg-[#e1e3e2] dark:text-[#111313]'
                    : 'bg-[#faf9f8] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130]'
                }`}
              >
                {out}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trade Journal Table */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded overflow-hidden transition-colors shadow-xs">
        <div className="p-4 bg-[#f4f3f2] dark:bg-[#222625] border-b border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c] dark:text-[#e1e3e2]">
              Day Trading Execution Ledger ({filteredTrades.length})
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#747878] dark:text-[#8c9290]">
            Audited Trade Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f8] dark:bg-[#191c1b] text-[#444748] dark:text-[#c2c7c5] border-b border-[#e3e2e1] dark:border-[#2d3130] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">DATE &amp; TIME</th>
                <th className="py-3 px-4">ASSET / TICKER</th>
                <th className="py-3 px-4">POSITION</th>
                <th className="py-3 px-4 font-mono text-right">ENTRY PRICE</th>
                <th className="py-3 px-4 font-mono text-right">EXIT PRICE</th>
                <th className="py-3 px-4 font-mono text-right">QUANTITY</th>
                <th className="py-3 px-4">EXCHANGE</th>
                <th className="py-3 px-4 font-mono text-right">FEES</th>
                <th className="py-3 px-4 font-mono text-right">NET P/L ($)</th>
                <th className="py-3 px-4 font-mono text-right">ROI (%)</th>
                <th className="py-3 px-4">STRATEGY</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed] dark:divide-[#2d3130]">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-[#747878] dark:text-[#8c9290]">
                    No day trading logs recorded. Click "Log Day Trade" to start logging your crypto executions.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => {
                  const isWin = (t.netProfitLoss || 0) > 0;
                  const isLoss = (t.netProfitLoss || 0) < 0;
                  const isLong = (t.positionType || '').toUpperCase() === 'LONG';
                  const roiVal = t.roiPercentage ?? t.roiPercent ?? 0;
                  return (
                    <tr key={t.id} className="hover:bg-[#faf9f8] dark:hover:bg-[#222625] transition-colors">
                      <td className="py-3 px-4 text-[#444748] dark:text-[#c2c7c5] whitespace-nowrap">
                        <div className="font-mono font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">{t.tradeDate}</div>
                        <div className="text-[10px] text-[#747878] dark:text-[#8c9290] font-mono">{t.entryTime} &ndash; {t.exitTime}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">{t.cryptoName}</div>
                        <div className="text-[10px] font-mono text-[#747878] dark:text-[#8c9290]">{t.ticker}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isLong 
                            ? 'bg-[#1b6b51]/10 text-[#1b6b51] dark:bg-[#1b6b51]/30 dark:text-[#60d3a7] border border-[#1b6b51]/20' 
                            : 'bg-[#ba1a1a]/10 text-[#ba1a1a] dark:bg-[#ba1a1a]/30 dark:text-[#ff897d] border border-[#ba1a1a]/20'
                        }`}>
                          {isLong ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{isLong ? 'LONG' : 'SHORT'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#444748] dark:text-[#c2c7c5] text-right">${(t.entryPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 font-mono text-[#444748] dark:text-[#c2c7c5] text-right">${(t.exitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] text-right">{(t.quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#1a1c1c] dark:text-[#e1e3e2]">
                          {t.exchange ? (
                            t.exchange
                          ) : (
                            <span className="text-[#747878] dark:text-[#8c9290] italic">Not specified</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#747878] dark:text-[#8c9290] text-right">${(t.tradingFee ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`py-3 px-4 font-mono font-bold text-right ${isWin ? 'text-[#1b6b51] dark:text-[#60d3a7]' : isLoss ? 'text-[#ba1a1a] dark:text-[#ff897d]' : 'text-[#747878]'}`}>
                        {isWin ? '+' : ''}${(t.netProfitLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-4 font-mono font-bold text-right ${isWin ? 'text-[#1b6b51] dark:text-[#60d3a7]' : isLoss ? 'text-[#ba1a1a] dark:text-[#ff897d]' : 'text-[#747878]'}`}>
                        {isWin ? '+' : ''}{formatPercent(roiVal)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] truncate max-w-[140px]">{t.strategy || 'Day Trade'}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            title="Edit Trade"
                            className="p-1.5 hover:bg-[#e3e2e1] dark:hover:bg-[#2d3130] text-[#747878] dark:text-[#8c9290] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2] rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id, t.ticker, t.netProfitLoss || 0)}
                            title="Delete Trade"
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

      {/* Crypto Day Trading Rules & Execution Guidelines */}
      <TradingNotesAndRulesSection
        moduleId="crypto_day_trades"
        defaultTitle="Crypto Day Trading Execution & Risk Management Rules"
        accentColor="#1b6b51"
        badgeLabel="Active Day Trading"
      />

      {/* Add / Edit Trade Modal — Matches Exact New Investment Record Design */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded-md max-w-xl w-full p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e1] dark:border-[#2d3130]">
              <div>
                <h2 className="text-base font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  {editingRecord ? 'Edit Investment Record' : 'New Investment Record'}
                </h2>
                <p className="text-xs text-[#747878] dark:text-[#8c9290]">
                  Select asset category and input trade parameters
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] p-1.5 rounded hover:bg-[#f4f3f2] dark:hover:bg-[#222625] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Display */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290]">
                Investment Category
              </label>
              <div className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] flex items-center justify-between">
                <span>Crypto Day Trading (Active Performance)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1b6b51]/10 text-[#1b6b51] dark:bg-[#1b6b51]/30 dark:text-[#60d3a7] border border-[#1b6b51]/20 font-bold uppercase">
                  Active Trading
                </span>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded text-xs bg-[#ba1a1a]/10 text-[#ba1a1a] dark:text-[#ff897d] border border-[#ba1a1a]/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Buy / Sell Toggle Switch */}
              <div className="flex items-center gap-2 bg-[#f4f3f2] dark:bg-[#222625] p-1 rounded">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, positionType: 'LONG' })}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                    formData.positionType === 'LONG' 
                      ? 'bg-[#1a1c1c] text-[#faf9f8] dark:bg-[#e1e3e2] dark:text-[#111313] shadow-xs' 
                      : 'text-[#747878] dark:text-[#8c9290]'
                  }`}
                >
                  BUY ORDER (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, positionType: 'SHORT' })}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                    formData.positionType === 'SHORT' 
                      ? 'bg-[#1a1c1c] text-[#faf9f8] dark:bg-[#e1e3e2] dark:text-[#111313] shadow-xs' 
                      : 'text-[#747878] dark:text-[#8c9290]'
                  }`}
                >
                  SELL ORDER (SHORT)
                </button>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tradeDate}
                    onChange={(e) => setFormData({ ...formData, tradeDate: e.target.value })}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                {/* Cryptocurrency / Ticker */}
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Cryptocurrency / Ticker
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bitcoin"
                      value={formData.cryptoName}
                      onChange={(e) => setFormData({ ...formData, cryptoName: e.target.value })}
                      className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 text-[#1a1c1c] dark:text-[#e1e3e2]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="BTC"
                      value={formData.ticker}
                      onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                      className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono uppercase text-[#1a1c1c] dark:text-[#e1e3e2]"
                    />
                  </div>
                </div>

                {/* Entry Price */}
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Entry Price ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                {/* Exit Price */}
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Exit Price ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                {/* Quantity and Exchange side-by-side */}
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Exchange
                  </label>
                  <div className="space-y-1 mt-1">
                    <select
                      value={
                        PRESET_EXCHANGES.includes(formData.exchange) 
                          ? formData.exchange 
                          : formData.exchange ? 'Other' : 'Binance'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          if (PRESET_EXCHANGES.includes(formData.exchange)) {
                            setFormData(prev => ({ ...prev, exchange: '' }));
                          }
                        } else {
                          setFormData(prev => ({ ...prev, exchange: val }));
                        }
                      }}
                      className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 text-xs text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
                    >
                      <option value="Binance">Binance</option>
                      <option value="Luno">Luno</option>
                      <option value="Remitano">Remitano</option>
                      <option value="Bybit">Bybit</option>
                      <option value="KuCoin">KuCoin</option>
                      <option value="Coinbase">Coinbase</option>
                      <option value="OKX">OKX</option>
                      <option value="Kraken">Kraken</option>
                      <option value="Other">Other (Custom)</option>
                    </select>
                    {(!PRESET_EXCHANGES.includes(formData.exchange)) && (
                      <input
                        type="text"
                        required
                        placeholder="Enter exchange name (e.g. Dex, Bitfinex)"
                        value={formData.exchange}
                        onChange={(e) => setFormData(prev => ({ ...prev, exchange: e.target.value }))}
                        className="w-full bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 text-xs text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
                      />
                    )}
                  </div>
                </div>

                {/* Trading Fee */}
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Trading Fee ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formData.tradingFee}
                    onChange={(e) => setFormData({ ...formData, tradingFee: e.target.value })}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                {/* Strategy / Setup */}
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Strategy / Setup
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Breakout Momentum"
                    value={formData.strategy}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                {/* Execution Window (Entry & Exit Time) */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Execution Window (Entry &ndash; Exit Time)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <input
                      type="time"
                      value={formData.entryTime}
                      onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
                      className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                    />
                    <input
                      type="time"
                      value={formData.exitTime}
                      onChange={(e) => setFormData({ ...formData, exitTime: e.target.value })}
                      className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                    />
                  </div>
                </div>

                {/* Remarks / Notes */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase">
                    Remarks / Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Followed stop loss discipline, key resistance exit"
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>
              </div>

              {/* Calculated Value Preview */}
              <div className="p-3 bg-[#f4f3f2] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#747878] dark:text-[#8c9290]">
                  <Calculator className="w-4 h-4 text-[#1a1c1c] dark:text-[#e1e3e2]" />
                  <span className="font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">Calculated Value Preview:</span>
                </div>
                <div className="font-mono font-bold text-xs text-[#1a1c1c] dark:text-[#e1e3e2]">
                  {(() => {
                    const qty = parseFloat(formData.quantity) || 0;
                    const entry = parseFloat(formData.entryPrice) || 0;
                    const exit = parseFloat(formData.exitPrice) || 0;
                    const fee = parseFloat(formData.tradingFee) || 0;
                    const entryVal = qty * entry;
                    const exitVal = qty * exit;
                    const grossPl = formData.positionType === 'LONG' ? (exitVal - entryVal) : (entryVal - exitVal);
                    const netPl = grossPl - fee;
                    const roi = entryVal > 0 ? (netPl / entryVal) * 100 : 0;
                    const isPositive = netPl >= 0;
                    return (
                      <span className={isPositive ? 'text-[#1b6b51] dark:text-[#60d3a7]' : 'text-[#ba1a1a] dark:text-[#ff897d]'}>
                        Net P/L: {isPositive ? '+' : ''}${netPl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPositive ? '+' : ''}{roi.toFixed(2)}%)
                        <span className="text-[10px] text-[#747878] dark:text-[#8c9290] ml-1.5 font-normal">
                          (Volume: ${entryVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} | Gross: {grossPl >= 0 ? '+' : ''}${grossPl.toFixed(2)} | Fee: -${fee.toFixed(2)})
                        </span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e3e2e1] dark:border-[#2d3130]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-semibold text-[#444748] dark:text-[#c2c7c5] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingRecord ? 'Record Trade' : 'Record Trade'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
