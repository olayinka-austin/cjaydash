import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatUSD, formatDate } from '../../utils/calculations';
import { Trash2, Plus, Coins, BookOpen, AlertCircle } from 'lucide-react';

interface SheetProps {
  onOpenAddModal: (category: 'gold_etfs') => void;
}

export const GoldEtfSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { goldEtfBuys, goldEtfSells, deleteGoldEtf, settings } = useWealth();
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL' | 'RULES'>('BUY');

  const totalBuyQty = goldEtfBuys.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalBuyAmountUsd = goldEtfBuys.reduce((acc, r) => acc + (r.totalAmountUsd || 0), 0);
  const totalBuyAmountNaira = goldEtfBuys.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
  const avgSpotPrice = goldEtfBuys.length > 0 
    ? goldEtfBuys.reduce((acc, r) => acc + (r.goldSpotPriceUsdPerOz || 0), 0) / goldEtfBuys.length 
    : (settings.currentGoldSpotPriceUsd || 3369.67);

  const totalSellQty = goldEtfSells.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalSellAmountUsd = goldEtfSells.reduce((acc, r) => acc + (r.totalAmountUsd || 0), 0);
  const totalSellAmountNaira = goldEtfSells.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
  const totalRealizedPLUsd = goldEtfSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);
  const totalRealizedPLNaira = goldEtfSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);

  const netHoldingQty = Math.max(0, totalBuyQty - totalSellQty);

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#b45309] uppercase tracking-wider">AVG GOLD SPOT PRICE</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">${avgSpotPrice.toFixed(2)}/oz</div>
          <div className="text-xs text-[#747878] mt-0.5">GLD &middot; IAU &middot; SGOL</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL GOLD BOUGHT</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{formatUSD(totalBuyAmountUsd)}</div>
          <div className="text-xs font-mono text-[#747878] mt-0.5">{formatNaira(totalBuyAmountNaira)}</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">NET ACTIVE UNITS</div>
          <div className="text-xl font-bold font-mono text-[#1a1c1c] mt-1">{netHoldingQty.toFixed(2)} Units</div>
          <div className="text-xs text-[#747878] mt-0.5">Physical backed ETF shares</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">REALIZED PROFIT/LOSS</div>
          <div className={`text-xl font-bold font-mono mt-1 ${totalRealizedPLUsd >= 0 ? 'text-[#1b6b51]' : 'text-[#ba1a1a]'}`}>
            {totalRealizedPLUsd >= 0 ? '+' : ''}{formatUSD(totalRealizedPLUsd)}
          </div>
          <div className="text-xs font-mono text-[#1b6b51] mt-0.5">+{formatNaira(totalRealizedPLNaira)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#e3e2e1] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BUY')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              activeTab === 'BUY' ? 'bg-[#1a1c1c] text-[#faf9f8]' : 'bg-[#ffffff] text-[#444748] border border-[#e3e2e1] hover:bg-[#f4f3f2]'
            }`}
          >
            Buy Ledger ({goldEtfBuys.length})
          </button>
          <button
            onClick={() => setActiveTab('SELL')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              activeTab === 'SELL' ? 'bg-[#1a1c1c] text-[#faf9f8]' : 'bg-[#ffffff] text-[#444748] border border-[#e3e2e1] hover:bg-[#f4f3f2]'
            }`}
          >
            Sell Ledger ({goldEtfSells.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RULES' ? 'bg-[#1a1c1c] text-[#faf9f8]' : 'bg-[#ffffff] text-[#444748] border border-[#e3e2e1] hover:bg-[#f4f3f2]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Commodity Rules</span>
          </button>
        </div>

        <button
          onClick={() => onOpenAddModal('gold_etfs')}
          className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Gold ETF Trade</span>
        </button>
      </div>

      {/* BUY TABLE */}
      {activeTab === 'BUY' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-3 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Gold ETFs Savings &amp; Trading &middot; Buy Records</span>
            <span className="text-xs font-mono text-[#747878]">Total Buy: {formatUSD(totalBuyAmountUsd)} / {formatNaira(totalBuyAmountNaira)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">S/NO</th>
                  <th className="py-3 px-3">DATE</th>
                  <th className="py-3 px-3">SPOT PRICE ($/oz)</th>
                  <th className="py-3 px-3">TICKER</th>
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
                {goldEtfBuys.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-[#faf9f8]">
                    <td className="py-3 px-3 font-mono text-[#747878]">{r.sNo || idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-medium text-[#1a1c1c]">{formatDate(r.date)}</td>
                    <td className="py-3 px-3 font-mono text-[#b45309] font-medium">${r.goldSpotPriceUsdPerOz.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{r.ticker}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(r.unitPriceUsd, true)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatNaira(r.dollarRateNaira)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{r.qty.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatUSD(r.commissionUsd, true)}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(r.amountUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{formatUSD(r.totalAmountUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(r.totalAmountNaira)}</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => deleteGoldEtf(r.id, 'buy')} className="text-[#747878] hover:text-[#ba1a1a] p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#f4f3f2]/60 font-semibold border-t border-[#e3e2e1] text-xs">
                <tr>
                  <td colSpan={2} className="py-3 px-3 font-bold">AVERAGE SPOT</td>
                  <td className="py-3 px-3 font-mono text-[#b45309]">${avgSpotPrice.toFixed(2)}</td>
                  <td colSpan={6}></td>
                  <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(totalBuyAmountUsd)}</td>
                  <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(totalBuyAmountNaira)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SELL TABLE */}
      {activeTab === 'SELL' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-3 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Gold ETFs &middot; Sell & P/L Records</span>
            <span className="text-xs font-mono text-[#1b6b51] font-semibold">Net P/L: +{formatUSD(totalRealizedPLUsd)} / +{formatNaira(totalRealizedPLNaira)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">DATE</th>
                  <th className="py-3 px-3">SPOT PRICE ($/oz)</th>
                  <th className="py-3 px-3">UNIT PRICE ($)</th>
                  <th className="py-3 px-3">DOLLAR RATE (₦)</th>
                  <th className="py-3 px-3">QTY</th>
                  <th className="py-3 px-3">COMMISSION</th>
                  <th className="py-3 px-3">TOTAL ($)</th>
                  <th className="py-3 px-3">TOTAL (₦)</th>
                  <th className="py-3 px-3 text-[#1b6b51]">P/L ($)</th>
                  <th className="py-3 px-3 text-[#1b6b51]">P/L (₦)</th>
                  <th className="py-3 px-3">REMARKS</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeed]">
                {goldEtfSells.map((r) => (
                  <tr key={r.id} className="hover:bg-[#faf9f8]">
                    <td className="py-3 px-3 font-mono font-medium text-[#1a1c1c]">{formatDate(r.date)}</td>
                    <td className="py-3 px-3 font-mono text-[#b45309] font-medium">${r.goldSpotPriceUsdPerOz.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatUSD(r.unitPriceUsd, true)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatNaira(r.dollarRateNaira)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{r.qty.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono text-[#747878]">{formatUSD(r.commissionUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1a1c1c]">{formatUSD(r.totalAmountUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(r.totalAmountNaira)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1b6b51]">+{formatUSD(r.profitOrLossUsd, true)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1b6b51]">+{formatNaira(r.profitOrLossNaira)}</td>
                    <td className="py-3 px-3 text-[#747878]">{r.remarks || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => deleteGoldEtf(r.id, 'sell')} className="text-[#747878] hover:text-[#ba1a1a] p-1">
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

      {/* RULES */}
      {activeTab === 'RULES' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1c1c]">
            <AlertCircle className="w-4 h-4 text-[#b45309]" />
            <span>Physical Gold ETF Strategy & Allocation Guidelines</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#444748] leading-relaxed">
            <div className="p-4 bg-[#faf9f8] border border-[#e3e2e1] rounded space-y-2">
              <p className="font-semibold text-[#1a1c1c]">&bull; Supported Tickers:</p>
              <p>SPDR Gold Shares (GLD), iShares Gold Trust (IAU), abrdn Physical Gold Shares ETF (SGOL).</p>
              <p className="font-semibold text-[#1a1c1c] pt-2">&bull; Spot Price Reference:</p>
              <p>Spot price per ounce recorded at the time of each trade to gauge premium/discount to spot.</p>
            </div>
            <div className="p-4 bg-[#faf9f8] border border-[#e3e2e1] rounded space-y-2">
              <p className="font-semibold text-[#1a1c1c]">&bull; Buyback Discipline:</p>
              <p>After selling, attempt to buy back the same quantity sold when the opportunity presents itself again.</p>
              <p className="font-semibold text-[#1a1c1c] pt-2">&bull; USD Trading Wallet Buffer:</p>
              <p>Maintain at least $500 in the USD Trading Wallet for gold market dip opportunities.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
