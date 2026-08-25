import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatUSD, formatDate, calculateForeignStockBuy, calculateForeignStockSell } from '../../utils/calculations';
import { Trash2, Plus, BookOpen, AlertCircle, Edit2, X, Check } from 'lucide-react';
import { ForeignStockBuyRecord, ForeignStockSellRecord } from '../../types';
import { TradingNotesAndRulesSection } from '../TradingNotesAndRulesSection';

interface SheetProps {
  onOpenAddModal: (category: 'foreign_stocks') => void;
}

export const ForeignStocksSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { foreignStockBuys, foreignStockSells, deleteForeignStock, updateForeignStockBuy, updateForeignStockSell } = useWealth();
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL' | 'RULES'>('BUY');

  // Edit State
  const [editingBuyRecord, setEditingBuyRecord] = useState<ForeignStockBuyRecord | null>(null);
  const [editingSellRecord, setEditingSellRecord] = useState<ForeignStockSellRecord | null>(null);

  // Edit Form Fields for Buy
  const [editBuyDate, setEditBuyDate] = useState<string>('');
  const [editBuySymbol, setEditBuySymbol] = useState<string>('');
  const [editBuyUnitPrice, setEditBuyUnitPrice] = useState<string>('');
  const [editBuyDollarRate, setEditBuyDollarRate] = useState<string>('');
  const [editBuyQty, setEditBuyQty] = useState<string>('');
  const [editBuyCommission, setEditBuyCommission] = useState<string>('');
  const [editBuyBroker, setEditBuyBroker] = useState<string>('');

  // Edit Form Fields for Sell
  const [editSellDate, setEditSellDate] = useState<string>('');
  const [editSellSymbol, setEditSellSymbol] = useState<string>('');
  const [editSellUnitPrice, setEditSellUnitPrice] = useState<string>('');
  const [editSellDollarRate, setEditSellDollarRate] = useState<string>('');
  const [editSellQty, setEditSellQty] = useState<string>('');
  const [editSellCommission, setEditSellCommission] = useState<string>('');
  const [editSellBroker, setEditSellBroker] = useState<string>('');
  const [editSellRemarks, setEditSellRemarks] = useState<string>('');

  const totalBuyQty = foreignStockBuys.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalBuyAmountUsd = foreignStockBuys.reduce((acc, r) => acc + (r.totalAmountUsd || 0), 0);
  const totalBuyAmountNaira = foreignStockBuys.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);

  const totalSellQty = foreignStockSells.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalSellAmountUsd = foreignStockSells.reduce((acc, r) => acc + (r.totalAmountUsd || 0), 0);
  const totalSellAmountNaira = foreignStockSells.reduce((acc, r) => acc + (r.totalAmountNaira || 0), 0);
  const totalRealizedPLUsd = foreignStockSells.reduce((acc, r) => acc + (r.profitOrLossUsd || 0), 0);
  const totalRealizedPLNaira = foreignStockSells.reduce((acc, r) => acc + (r.profitOrLossNaira || 0), 0);

  const netHoldingQty = Math.max(0, totalBuyQty - totalSellQty);

  const handleStartEditBuy = (rec: ForeignStockBuyRecord) => {
    setEditingBuyRecord(rec);
    setEditBuyDate(rec.date);
    setEditBuySymbol(rec.symbol);
    setEditBuyUnitPrice(rec.unitPriceUsd.toString());
    setEditBuyDollarRate(rec.dollarRateNaira.toString());
    setEditBuyQty(rec.qty.toString());
    setEditBuyCommission(rec.commissionUsd.toString());
    setEditBuyBroker(rec.broker || '');
  };

  const handleSaveEditBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuyRecord) return;
    const uPrice = parseFloat(editBuyUnitPrice) || 0;
    const q = parseFloat(editBuyQty) || 0;
    const comm = parseFloat(editBuyCommission) || 0;
    const dRate = parseFloat(editBuyDollarRate) || 1670;
    const calc = calculateForeignStockBuy(uPrice, q, comm, dRate);

    await updateForeignStockBuy(editingBuyRecord.id, {
      date: editBuyDate,
      symbol: editBuySymbol.toUpperCase(),
      unitPriceUsd: uPrice,
      dollarRateNaira: dRate,
      qty: q,
      commissionUsd: comm,
      amountUsd: calc.amountUsd,
      totalAmountUsd: calc.totalAmountUsd,
      totalAmountNaira: calc.totalAmountNaira,
      broker: editBuyBroker.trim() || 'Not specified'
    });
    setEditingBuyRecord(null);
  };

  const handleStartEditSell = (rec: ForeignStockSellRecord) => {
    setEditingSellRecord(rec);
    setEditSellDate(rec.date);
    setEditSellSymbol(rec.symbol || 'O');
    setEditSellUnitPrice(rec.unitPriceUsd.toString());
    setEditSellDollarRate(rec.dollarRateNaira.toString());
    setEditSellQty(rec.qty.toString());
    setEditSellCommission(rec.commissionUsd.toString());
    setEditSellBroker(rec.broker || '');
    setEditSellRemarks(rec.remarks || '');
  };

  const handleSaveEditSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSellRecord) return;
    const uPrice = parseFloat(editSellUnitPrice) || 0;
    const q = parseFloat(editSellQty) || 0;
    const comm = parseFloat(editSellCommission) || 0;
    const dRate = parseFloat(editSellDollarRate) || 1670;
    const calc = calculateForeignStockSell(uPrice, q, comm, dRate, 53.40, 1675);

    await updateForeignStockSell(editingSellRecord.id, {
      date: editSellDate,
      symbol: editSellSymbol.toUpperCase(),
      unitPriceUsd: uPrice,
      dollarRateNaira: dRate,
      qty: q,
      commissionUsd: comm,
      amountUsd: calc.amountUsd,
      totalAmountUsd: calc.totalAmountUsd,
      totalAmountNaira: calc.totalAmountNaira,
      profitOrLossUsd: calc.profitOrLossUsd,
      profitOrLossNaira: calc.profitOrLossNaira,
      remarks: editSellRemarks,
      broker: editSellBroker.trim() || 'Not specified'
    });
    setEditingSellRecord(null);
  };

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
                  <th className="py-3 px-3">BROKER</th>
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
                    <td className="py-3 px-3 font-mono text-[#444748]">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1] whitespace-nowrap">
                        {r.broker || 'Not specified'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEditBuy(r)}
                          title="Edit transaction"
                          className="text-[#747878] hover:text-[#1a1c1c] p-1 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteForeignStock(r.id, 'buy')}
                          title="Delete transaction"
                          className="text-[#747878] hover:text-[#ba1a1a] p-1 cursor-pointer transition-colors"
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
                  <th className="py-3 px-3">BROKER</th>
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
                    <td className="py-3 px-3 font-mono text-[#444748]">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1] whitespace-nowrap">
                        {r.broker || 'Not specified'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEditSell(r)}
                          title="Edit transaction"
                          className="text-[#747878] hover:text-[#1a1c1c] p-1 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteForeignStock(r.id, 'sell')}
                          title="Delete transaction"
                          className="text-[#747878] hover:text-[#ba1a1a] p-1 cursor-pointer transition-colors"
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
        </div>
      )}

      {/* Edit Modal for Buy Record */}
      {editingBuyRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#e3e2e1] rounded w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#1a1c1c]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Edit Foreign Stock Trade</span>
              </div>
              <button
                onClick={() => setEditingBuyRecord(null)}
                className="text-[#747878] hover:text-[#1a1c1c] p-1 rounded hover:bg-[#e3e2e1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBuy} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={editBuyDate}
                    onChange={(e) => setEditBuyDate(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Ticker Symbol</label>
                  <input
                    type="text"
                    required
                    value={editBuySymbol}
                    onChange={(e) => setEditBuySymbol(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editBuyUnitPrice}
                    onChange={(e) => setEditBuyUnitPrice(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Quantity (Units)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editBuyQty}
                    onChange={(e) => setEditBuyQty(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Commission ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editBuyCommission}
                    onChange={(e) => setEditBuyCommission(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Dollar Rate (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editBuyDollarRate}
                    onChange={(e) => setEditBuyDollarRate(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Broker</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Interactive Brokers, Charles Schwab"
                    value={editBuyBroker}
                    onChange={(e) => setEditBuyBroker(e.target.value)}
                    list="foreign-stock-edit-brokers"
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-medium text-[#1a1c1c]"
                  />
                  <datalist id="foreign-stock-edit-brokers">
                    <option value="Interactive Brokers" />
                    <option value="Charles Schwab" />
                    <option value="Bamboo" />
                    <option value="Trove" />
                    <option value="Chaka" />
                    <option value="Passfolio" />
                    <option value="Robinhood" />
                    <option value="Fidelity" />
                    <option value="E*TRADE" />
                    <option value="Webull" />
                  </datalist>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e3e2e1]">
                <button
                  type="button"
                  onClick={() => setEditingBuyRecord(null)}
                  className="px-4 py-2 rounded text-xs font-semibold text-[#444748] hover:bg-[#f4f3f2] border border-[#e3e2e1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal for Sell Record */}
      {editingSellRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#e3e2e1] rounded w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#1a1c1c]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">Edit Foreign Stock Sell Record</span>
              </div>
              <button
                onClick={() => setEditingSellRecord(null)}
                className="text-[#747878] hover:text-[#1a1c1c] p-1 rounded hover:bg-[#e3e2e1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSell} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={editSellDate}
                    onChange={(e) => setEditSellDate(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Ticker Symbol</label>
                  <input
                    type="text"
                    required
                    value={editSellSymbol}
                    onChange={(e) => setEditSellSymbol(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editSellUnitPrice}
                    onChange={(e) => setEditSellUnitPrice(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Quantity (Units)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editSellQty}
                    onChange={(e) => setEditSellQty(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Commission ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editSellCommission}
                    onChange={(e) => setEditSellCommission(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Dollar Rate (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editSellDollarRate}
                    onChange={(e) => setEditSellDollarRate(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Broker</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Interactive Brokers, Charles Schwab"
                    value={editSellBroker}
                    onChange={(e) => setEditSellBroker(e.target.value)}
                    list="foreign-stock-edit-brokers"
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 font-medium text-[#1a1c1c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Stop limit order, partial profit realization"
                    value={editSellRemarks}
                    onChange={(e) => setEditSellRemarks(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e3e2e1]">
                <button
                  type="button"
                  onClick={() => setEditingSellRecord(null)}
                  className="px-4 py-2 rounded text-xs font-semibold text-[#444748] hover:bg-[#f4f3f2] border border-[#e3e2e1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Strategy & Rules Box from Workbook */}
      {activeTab === 'RULES' && (
        <TradingNotesAndRulesSection
          moduleId="foreign_stocks"
          defaultTitle="Official Foreign Stock Trading Rules & Lot Discipline"
          accentColor="#1b6b51"
        />
      )}
    </div>
  );
};
