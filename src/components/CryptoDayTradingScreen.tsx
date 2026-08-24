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
  X
} from 'lucide-react';

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
    exchange: 'Binance Futures',
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
      exchange: 'Binance Futures',
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
      positionType: trade.positionType || 'LONG',
      entryPrice: String(trade.entryPrice || ''),
      exitPrice: String(trade.exitPrice || ''),
      quantity: String(trade.quantity || ''),
      tradingFee: String(trade.tradingFee || 0),
      exchange: trade.exchange || 'Binance Futures',
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
      positionType: formData.positionType,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      entryValue,
      exitValue,
      tradingFee: fee,
      grossProfitLoss,
      netProfitLoss,
      roiPercent,
      exchange: formData.exchange.trim() || 'Crypto Exchange',
      strategy: formData.strategy.trim() || 'Day Trade',
      tradeStatus: formData.tradeStatus,
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

      const matchesPos = positionFilter === 'ALL' || t.positionType === positionFilter;
      
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
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4 font-mono text-right">ENTRY PRICE</th>
                <th className="py-3 px-4 font-mono text-right">EXIT PRICE</th>
                <th className="py-3 px-4 font-mono text-right">QTY / SIZE</th>
                <th className="py-3 px-4 font-mono text-right">FEE</th>
                <th className="py-3 px-4 font-mono text-right">NET P/L ($)</th>
                <th className="py-3 px-4 font-mono text-right">ROI (%)</th>
                <th className="py-3 px-4">STRATEGY / EXCHANGE</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed] dark:divide-[#2d3130]">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-[#747878] dark:text-[#8c9290]">
                    No day trading logs recorded. Click "Log Day Trade" to start logging your crypto executions.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => {
                  const isWin = (t.netProfitLoss || 0) > 0;
                  const isLoss = (t.netProfitLoss || 0) < 0;
                  const isLong = t.positionType === 'LONG';
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
                          <span>{t.positionType}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#444748] dark:text-[#c2c7c5] text-right">${t.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 font-mono text-[#444748] dark:text-[#c2c7c5] text-right">${t.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] text-right">{t.quantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                      <td className="py-3 px-4 font-mono text-[#747878] dark:text-[#8c9290] text-right">${t.tradingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`py-3 px-4 font-mono font-bold text-right ${isWin ? 'text-[#1b6b51] dark:text-[#60d3a7]' : isLoss ? 'text-[#ba1a1a] dark:text-[#ff897d]' : 'text-[#747878]'}`}>
                        {isWin ? '+' : ''}${t.netProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-4 font-mono font-bold text-right ${isWin ? 'text-[#1b6b51] dark:text-[#60d3a7]' : isLoss ? 'text-[#ba1a1a] dark:text-[#ff897d]' : 'text-[#747878]'}`}>
                        {isWin ? '+' : ''}{formatPercent(t.roiPercent)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] truncate max-w-[140px]">{t.strategy}</div>
                        <div className="text-[10px] text-[#747878] dark:text-[#8c9290] font-mono">{t.exchange}</div>
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
                            onClick={() => handleDelete(t.id, t.ticker, t.netProfitLoss)}
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

      {/* Add / Edit Trade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e1] dark:border-[#2d3130]">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#1b6b51] dark:text-[#60d3a7]" />
                <h2 className="text-base font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  {editingRecord ? 'Edit Trade Execution Log' : 'Log New Day Trade'}
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
                    placeholder="e.g. Bitcoin, Solana"
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
                    placeholder="e.g. BTC, SOL"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Position Type *
                  </label>
                  <select
                    value={formData.positionType}
                    onChange={(e) => setFormData({ ...formData, positionType: e.target.value as 'LONG' | 'SHORT' })}
                    className="w-full px-3 py-2 text-xs font-bold bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  >
                    <option value="LONG">LONG (Buy Low &rarr; Sell High)</option>
                    <option value="SHORT">SHORT (Sell High &rarr; Buy Low)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Trade Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tradeDate}
                    onChange={(e) => setFormData({ ...formData, tradeDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Trade Quantity *
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
                    Entry Price ($) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Exit Price ($) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Trading Fee ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formData.tradingFee}
                    onChange={(e) => setFormData({ ...formData, tradingFee: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Entry &amp; Exit Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={formData.entryTime}
                      onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded text-[#1a1c1c] dark:text-[#e1e3e2]"
                    />
                    <input
                      type="time"
                      value={formData.exitTime}
                      onChange={(e) => setFormData({ ...formData, exitTime: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded text-[#1a1c1c] dark:text-[#e1e3e2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                    Exchange / Platform
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Binance Futures, Bybit, KuCoin"
                    value={formData.exchange}
                    onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                  Strategy / Setup
                </label>
                <input
                  type="text"
                  placeholder="e.g. Liquidity Sweep, 15m EMA Retest, Bullish Divergence"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] text-[#1a1c1c] dark:text-[#e1e3e2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#8c9290] mb-1">
                  Execution Notes &amp; Psychology
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Followed stop loss discipline, exited at key resistance target"
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
                  {editingRecord ? 'Update Trade Log' : 'Save Execution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
