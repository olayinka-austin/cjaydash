import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatUSD, formatDate } from '../../utils/calculations';
import { Trash2, Plus, BookOpen, AlertCircle } from 'lucide-react';
import { TradingNotesAndRulesSection } from '../TradingNotesAndRulesSection';

interface SheetProps {
  onOpenAddModal: (category: 'nigerian_stocks') => void;
}

export const NigerianStocksSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { nigerianStockBuys, nigerianStockSells, deleteNigerianStock } = useWealth();
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL' | 'RULES'>('BUY');

  const totalBuyQty = nigerianStockBuys.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalBuyAmountNaira = nigerianStockBuys.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
  const totalBuyAmountUsd = nigerianStockBuys.reduce((acc, r) => acc + (r.amountUsd || 0), 0);

  const totalSellQty = nigerianStockSells.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalSellAmountNaira = nigerianStockSells.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
  const totalRealizedPLNaira = nigerianStockSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);
  const totalRealizedPLUsd = nigerianStockSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);

  const netHoldingQty = Math.max(0, totalBuyQty - totalSellQty);

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">NGN TOTAL BOUGHT</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalBuyAmountNaira)}</div>
          <div className="text-xs font-mono text-[#747878] mt-0.5">{formatUSD(totalBuyAmountUsd)} &middot; {totalBuyQty} units</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">NGN TOTAL SOLD</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalSellAmountNaira)}</div>
          <div className="text-xs font-mono text-[#747878] mt-0.5">{totalSellQty} units liquidated</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">NET ACTIVE UNITS</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{netHoldingQty} Units</div>
          <div className="text-xs text-[#747878] mt-0.5">Primary: ACCESSCORPS</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">REALIZED PROFIT (₦)</div>
          <div className={`text-xl font-bold font-mono mt-1 ${totalRealizedPLNaira >= 0 ? 'text-[#1b6b51]' : 'text-[#ba1a1a]'}`}>
            {totalRealizedPLNaira >= 0 ? '+' : ''}{formatNaira(totalRealizedPLNaira)}
          </div>
          <div className="text-xs font-mono text-[#1b6b51] mt-0.5">+{formatUSD(totalRealizedPLUsd)}</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-[#e3e2e1] dark:border-[#2d3130] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BUY')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              activeTab === 'BUY'
                ? 'bg-accent text-white dark:text-[#111313] shadow-xs'
                : 'bg-[#ffffff] dark:bg-[#191c1b] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
            }`}
          >
            Buy Ledger ({nigerianStockBuys.length})
          </button>
          <button
            onClick={() => setActiveTab('SELL')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              activeTab === 'SELL'
                ? 'bg-accent text-white dark:text-[#111313] shadow-xs'
                : 'bg-[#ffffff] dark:bg-[#191c1b] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
            }`}
          >
            Sell Ledger ({nigerianStockSells.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RULES'
                ? 'bg-accent text-white dark:text-[#111313] shadow-xs'
                : 'bg-[#ffffff] dark:bg-[#191c1b] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>NGX Trading Rules</span>
          </button>
        </div>

        <button
          onClick={() => onOpenAddModal('nigerian_stocks')}
          className="bg-accent hover:opacity-95 text-white dark:text-[#111313] px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Stock Trade</span>
        </button>
      </div>

      {/* Table BUY */}
      {activeTab === 'BUY' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-3 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Nigerian Stock Trading &middot; Buy Records</span>
            <span className="text-xs font-mono text-[#747878]">Total Buy: {formatNaira(totalBuyAmountNaira)} / {formatUSD(totalBuyAmountUsd)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">S/NO</th>
                  <th className="py-3 px-3">TRADE DATE</th>
                  <th className="py-3 px-3">SYMBOL</th>
                  <th className="py-3 px-3">UNIT PRICE (₦)</th>
                  <th className="py-3 px-3">QTY</th>
                  <th className="py-3 px-3">AMOUNT (₦)</th>
                  <th className="py-3 px-3">COMMISSION (₦)</th>
                  <th className="py-3 px-3">TOTAL AMOUNT (₦)</th>
                  <th className="py-3 px-3">DOLLAR RATE (₦)</th>
                  <th className="py-3 px-3">AMOUNT IN USD ($)</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeed]">
                {nigerianStockBuys.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-[#faf9f8]">
                    <td className="py-3 px-3 font-mono text-[#747878]">{r.sNo || idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-medium text-[#1a1c1c]">{formatDate(r.tradeDate)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{r.symbol}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(r.unitPriceNaira)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{r.qty.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(r.amountNaira)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatNaira(r.commissionNaira)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{formatNaira(r.totalAmountNaira)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatNaira(r.dollarRateNaira)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{formatUSD(r.amountUsd, true)}</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => deleteNigerianStock(r.id, 'buy')} className="text-[#747878] hover:text-[#ba1a1a] p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table SELL */}
      {activeTab === 'SELL' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-3 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Nigerian Stock Trading &middot; Sell & P/L Records</span>
            <span className="text-xs font-mono text-[#1b6b51] font-semibold">Net P/L: +{formatNaira(totalRealizedPLNaira)} / +{formatUSD(totalRealizedPLUsd)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">TRADE DATE</th>
                  <th className="py-3 px-3">SYMBOL</th>
                  <th className="py-3 px-3">UNIT PRICE (₦)</th>
                  <th className="py-3 px-3">QTY</th>
                  <th className="py-3 px-3">TOTAL (₦)</th>
                  <th className="py-3 px-3">DOLLAR RATE (₦)</th>
                  <th className="py-3 px-3">AMOUNT ($)</th>
                  <th className="py-3 px-3 text-[#1b6b51]">P/L (₦)</th>
                  <th className="py-3 px-3 text-[#1b6b51]">P/L ($)</th>
                  <th className="py-3 px-3">REMARKS</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeed]">
                {nigerianStockSells.map((r) => (
                  <tr key={r.id} className="hover:bg-[#faf9f8]">
                    <td className="py-3 px-3 font-mono font-medium text-[#1a1c1c]">{formatDate(r.tradeDate)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{r.symbol || 'ACCESSCORPS'}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(r.unitPriceNaira)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{r.qty.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{formatNaira(r.totalAmountNaira)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatNaira(r.dollarRateNaira)}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(r.amountUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1b6b51]">+{formatNaira(r.profitOrLossNaira)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1b6b51]">+{formatUSD(r.profitOrLossUsd, true)}</td>
                    <td className="py-3 px-3 text-[#747878]">{r.remarks || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => deleteNigerianStock(r.id, 'sell')} className="text-[#747878] hover:text-[#ba1a1a] p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rules */}
      {activeTab === 'RULES' && (
        <TradingNotesAndRulesSection
          moduleId="nigerian_stocks"
          defaultTitle="NGX Portfolio Management & Cash Reserve Rules"
          accentColor="#1b6b51"
        />
      )}
    </div>
  );
};
