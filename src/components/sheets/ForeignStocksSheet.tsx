import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatUSD, formatDate } from '../../utils/calculations';
import { Trash2, Plus, ArrowUpRight, ArrowDownRight, BookOpen, AlertCircle } from 'lucide-react';

interface SheetProps {
  onOpenAddModal: (category: 'foreign_stocks') => void;
}

export const ForeignStocksSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { foreignStockBuys, foreignStockSells, deleteForeignStock } = useWealth();
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL' | 'RULES'>('BUY');

  const totalBuyQty = foreignStockBuys.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalBuyAmountUsd = foreignStockBuys.reduce((acc, r) => acc + (r.totalAmountUsd || 0), 0);
  const totalBuyAmountNaira = foreignStockBuys.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);

  const totalSellQty = foreignStockSells.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalSellAmountUsd = foreignStockSells.reduce((acc, r) => acc + (r.totalAmountUsd || 0), 0);
  const totalSellAmountNaira = foreignStockSells.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
  const totalRealizedPLUsd = foreignStockSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);
  const totalRealizedPLNaira = foreignStockSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);

  const netHoldingQty = Math.max(0, totalBuyQty - totalSellQty);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL BOUGHT</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{formatUSD(totalBuyAmountUsd)}</div>
          <div className="text-xs font-mono text-[#747878] mt-0.5">{formatNaira(totalBuyAmountNaira)} &middot; {totalBuyQty} units</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL SOLD</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{formatUSD(totalSellAmountUsd)}</div>
          <div className="text-xs font-mono text-[#747878] mt-0.5">{formatNaira(totalSellAmountNaira)} &middot; {totalSellQty} units</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">NET ACTIVE HOLDINGS</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{netHoldingQty.toFixed(2)} Units</div>
          <div className="text-xs text-[#747878] mt-0.5">Primary Symbol: O (Realty Income)</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">REALIZED PROFIT/LOSS</div>
          <div className={`text-xl font-bold font-mono mt-1 ${totalRealizedPLUsd >= 0 ? 'text-[#1b6b51]' : 'text-[#ba1a1a]'}`}>
            {totalRealizedPLUsd >= 0 ? '+' : ''}{formatUSD(totalRealizedPLUsd)}
          </div>
          <div className="text-xs font-mono text-[#1b6b51] mt-0.5">+{formatNaira(totalRealizedPLNaira)}</div>
        </div>
      </div>

      {/* Subnavigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#e3e2e1] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BUY')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              activeTab === 'BUY'
                ? 'bg-[#1a1c1c] text-[#faf9f8]'
                : 'bg-[#ffffff] text-[#444748] border border-[#e3e2e1] hover:bg-[#f4f3f2]'
            }`}
          >
            Buy Ledger ({foreignStockBuys.length})
          </button>
          <button
            onClick={() => setActiveTab('SELL')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              activeTab === 'SELL'
                ? 'bg-[#1a1c1c] text-[#faf9f8]'
                : 'bg-[#ffffff] text-[#444748] border border-[#e3e2e1] hover:bg-[#f4f3f2]'
            }`}
          >
            Sell Ledger ({foreignStockSells.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RULES'
                ? 'bg-[#1a1c1c] text-[#faf9f8]'
                : 'bg-[#ffffff] text-[#444748] border border-[#e3e2e1] hover:bg-[#f4f3f2]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Trading Notes & Rules</span>
          </button>
        </div>

        <button
          onClick={() => onOpenAddModal('foreign_stocks')}
          className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Stock Trade</span>
        </button>
      </div>

      {/* Table: BUY */}
      {activeTab === 'BUY' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-3 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Foreign Stock &middot; Buy Records</span>
            <span className="text-xs font-mono text-[#747878]">Total Buy: {formatUSD(totalBuyAmountUsd)} / {formatNaira(totalBuyAmountNaira)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">S/NO</th>
                  <th className="py-3 px-3">DATE</th>
                  <th className="py-3 px-3">SYMBOL</th>
                  <th className="py-3 px-3">UNIT PRICE ($)</th>
                  <th className="py-3 px-3">DOLLAR RATE (₦)</th>
                  <th className="py-3 px-3">QTY</th>
                  <th className="py-3 px-3">COMMISSION</th>
                  <th className="py-3 px-3">AMOUNT ($)</th>
                  <th className="py-3 px-3">TOTAL ($)</th>
                  <th className="py-3 px-3">TOTAL (₦)</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeed]">
                {foreignStockBuys.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-[#faf9f8]">
                    <td className="py-3 px-3 font-mono text-[#747878]">{r.sNo || idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-medium text-[#1a1c1c]">{formatDate(r.date)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{r.symbol}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(r.unitPriceUsd, true)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatNaira(r.dollarRateNaira)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{r.qty.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatUSD(r.commissionUsd, true)}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(r.amountUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{formatUSD(r.totalAmountUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(r.totalAmountNaira)}</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => deleteForeignStock(r.id, 'buy')} className="text-[#747878] hover:text-[#ba1a1a] p-1">
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

      {/* Table: SELL */}
      {activeTab === 'SELL' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-3 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Foreign Stock &middot; Sell & Realized P/L Records</span>
            <span className="text-xs font-mono text-[#1b6b51] font-semibold">Net P/L: +{formatUSD(totalRealizedPLUsd)} / +{formatNaira(totalRealizedPLNaira)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">DATE</th>
                  <th className="py-3 px-3">UNIT PRICE ($)</th>
                  <th className="py-3 px-3">DOLLAR RATE (₦)</th>
                  <th className="py-3 px-3">QTY</th>
                  <th className="py-3 px-3">COMMISSION</th>
                  <th className="py-3 px-3">AMOUNT ($)</th>
                  <th className="py-3 px-3">TOTAL ($)</th>
                  <th className="py-3 px-3">TOTAL (₦)</th>
                  <th className="py-3 px-3 text-[#1b6b51]">P/L ($)</th>
                  <th className="py-3 px-3 text-[#1b6b51]">P/L (₦)</th>
                  <th className="py-3 px-3">REMARKS</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeed]">
                {foreignStockSells.map((r) => (
                  <tr key={r.id} className="hover:bg-[#faf9f8]">
                    <td className="py-3 px-3 font-mono font-medium text-[#1a1c1c]">{formatDate(r.date)}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(r.unitPriceUsd, true)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatNaira(r.dollarRateNaira)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{r.qty.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatUSD(r.commissionUsd, true)}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(r.amountUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{formatUSD(r.totalAmountUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(r.totalAmountNaira)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1b6b51]">+{formatUSD(r.profitOrLossUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1b6b51]">+{formatNaira(r.profitOrLossNaira)}</td>
                    <td className="py-3 px-3 text-[#747878]">{r.remarks || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => deleteForeignStock(r.id, 'sell')} className="text-[#747878] hover:text-[#ba1a1a] p-1">
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

      {/* Strategy & Rules Box from Workbook */}
      {activeTab === 'RULES' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1c1c]">
            <AlertCircle className="w-4 h-4 text-[#1b6b51]" />
            <span>Official Foreign Stock Trading Rules & Lot Discipline</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#444748] leading-relaxed">
            <div className="p-4 bg-[#faf9f8] border border-[#e3e2e1] rounded space-y-2">
              <p className="font-semibold text-[#1a1c1c]">&bull; Trading Wallet Buffer:</p>
              <p>Have at least $500 in USD Trading Wallet at all times in case of sudden buy opportunities.</p>
              <p className="font-semibold text-[#1a1c1c] pt-2">&bull; Order Entry Modes:</p>
              <p>For each trade, define the entry mode in the remarks section (e.g. Buy Limit, Market Order, Stop Limit).</p>
            </div>
            <div className="p-4 bg-[#faf9f8] border border-[#e3e2e1] rounded space-y-2">
              <p className="font-semibold text-[#1a1c1c]">&bull; Strict LOT Trading Structure:</p>
              <p>Buy or sell only in LOTs. If you buy 10 units of O, that is a LOT. If you buy 5 units later, that is a separate LOT. When selling, sell LOT of 10 or LOT of 5 to track precise profit/loss.</p>
              <p className="font-semibold text-[#1a1c1c] pt-2">&bull; Profit Top-Up Rule:</p>
              <p>Always withdraw profits to USD Wallet, leaving principal in trading wallet. 10% of profit should be topped up to the trading balance.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
