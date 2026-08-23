import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { formatNaira, formatUSD, formatDate, CATEGORY_DETAILS } from '../utils/calculations';
import { Receipt, ArrowUpRight, Search } from 'lucide-react';
import { InvestmentCategory } from '../types';

export const TransactionsScreen: React.FC = () => {
  const { 
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
    setSelectedCategory,
    setActiveScreen
  } = useWealth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Consolidate transactions safely across all 10 modules
  const allTransactions: any[] = [
    // UBA DCA
    ...ubaDcaRecords.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'uba_dca' as InvestmentCategory,
      assetName: 'UBA Domiciliary Savings',
      type: 'DEPOSIT',
      currency: 'USD',
      amountPrimary: r.amountUsd || 0,
      amountSecondary: r.totalCostNaira || 0,
      details: `$${(r.amountUsd ?? 0)} @ ₦${(r.ratePerUsd ?? 0).toLocaleString()}/$`
    })),
    // Foreign Stock Buys
    ...foreignStockBuys.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'foreign_stocks' as InvestmentCategory,
      assetName: `${r.symbol || 'US Stock'} (Buy)`,
      type: 'BUY',
      currency: 'USD',
      amountPrimary: r.totalAmountUsd || 0,
      amountSecondary: r.totalAmountNaira || 0,
      details: `${r.qty ?? 0} shares @ $${r.unitPriceUsd ?? 0}`
    })),
    // Foreign Stock Sells
    ...foreignStockSells.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'foreign_stocks' as InvestmentCategory,
      assetName: `${r.symbol || 'US Stock'} (Sell)`,
      type: 'SELL',
      currency: 'USD',
      amountPrimary: r.totalAmountUsd || 0,
      amountSecondary: r.totalAmountNaira || 0,
      details: `P/L: ${(r.profitOrLossUsd ?? 0) >= 0 ? '+' : ''}$${(r.profitOrLossUsd ?? 0).toFixed(2)}`
    })),
    // Nigerian Stock Buys
    ...nigerianStockBuys.map(r => ({
      id: r.id,
      date: r.tradeDate || '',
      category: 'nigerian_stocks' as InvestmentCategory,
      assetName: `${r.symbol || 'NGX Stock'} (Buy)`,
      type: 'BUY',
      currency: 'NGN',
      amountPrimary: r.totalAmountNaira || 0,
      amountSecondary: null,
      details: `${(r.qty ?? 0).toLocaleString()} units @ ₦${(r.unitPriceNaira ?? 0).toLocaleString()}`
    })),
    // Nigerian Stock Sells
    ...nigerianStockSells.map(r => ({
      id: r.id,
      date: r.tradeDate || '',
      category: 'nigerian_stocks' as InvestmentCategory,
      assetName: `${r.symbol || 'NGX Stock'} (Sell)`,
      type: 'SELL',
      currency: 'NGN',
      amountPrimary: r.totalAmountNaira || 0,
      amountSecondary: null,
      details: `P/L: ${(r.profitOrLossNaira ?? 0) >= 0 ? '+' : ''}₦${(r.profitOrLossNaira ?? 0).toLocaleString()}`
    })),
    // Ebook DCA
    ...ebookDcaRecords.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'ebook_dca' as InvestmentCategory,
      assetName: `Optimus DCA (${r.destination || 'Optimus'})`,
      type: 'BUY',
      currency: 'USD',
      amountPrimary: r.amountUsd || 0,
      amountSecondary: r.totalCostNaira || 0,
      details: `$${r.amountUsd ?? 0} @ ₦${(r.ratePerUsd ?? 0).toLocaleString()}/$`
    })),
    // Commercial Papers
    ...commercialPaperRecords.map(r => ({
      id: r.id,
      date: r.investmentDate || '',
      category: 'commercial_papers' as InvestmentCategory,
      assetName: `${r.issuer || r.platformUsed || 'Commercial Paper'} (CP)`,
      type: 'INVESTMENT',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `${r.tenorDays ?? 0}d @ ${r.ratePercent ?? 0}%`
    })),
    // Treasury Bills
    ...treasuryBillRecords.map(r => ({
      id: r.id,
      date: r.investmentDate || '',
      category: 'treasury_bills' as InvestmentCategory,
      assetName: `${r.platformUsed || 'Treasury Bill'} (T-Bill)`,
      type: 'INVESTMENT',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `${r.tenorDays ?? 0}d @ ${r.ratePercent ?? 0}%`
    })),
    // Mutual Funds
    ...mutualFundRecords.map(r => ({
      id: r.id,
      date: r.investmentDate || '',
      category: 'mutual_funds' as InvestmentCategory,
      assetName: `${r.fundName || 'Mutual Fund'}`,
      type: 'BUY',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `${(r.unitsPurchased ?? 0).toLocaleString()} units @ NAV ₦${(r.navPerUnitAtPurchaseNaira ?? 0).toLocaleString()}`
    })),
    // FGN Bonds
    ...fgnBondRecords.map(r => ({
      id: r.id,
      date: `${r.investmentMonth || ''} ${r.investmentYear || ''}`.trim(),
      category: 'fgn_bonds' as InvestmentCategory,
      assetName: `FGN Savings Bond (${r.investmentMonth || ''})`,
      type: 'BOND_ISSUE',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `Rate: ${r.interestRatePercent ?? 0}% (₦${((r.quarterlyInterestNaira ?? 0)).toLocaleString()}/qtr)`
    })),
    // Gold ETF Buys
    ...goldEtfBuys.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'gold_etfs' as InvestmentCategory,
      assetName: `${r.ticker || 'GLD'} Physical Gold (Buy)`,
      type: 'BUY',
      currency: 'USD',
      amountPrimary: r.totalAmountUsd || 0,
      amountSecondary: r.totalAmountNaira || 0,
      details: `${r.qty ?? 0} shares @ $${r.unitPriceUsd ?? 0}`
    })),
    // Gold ETF Sells
    ...goldEtfSells.map(r => ({
      id: r.id,
      date: r.date || '',
      category: 'gold_etfs' as InvestmentCategory,
      assetName: `${r.ticker || 'GLD'} Physical Gold (Sell)`,
      type: 'SELL',
      currency: 'USD',
      amountPrimary: r.totalAmountUsd || 0,
      amountSecondary: r.totalAmountNaira || 0,
      details: `P/L: ${(r.profitOrLossUsd ?? 0) >= 0 ? '+' : ''}$${(r.profitOrLossUsd ?? 0).toFixed(2)}`
    })),
    // Locked Savings
    ...lockedSavingsRecords.map(r => ({
      id: r.id,
      date: r.investmentDate || '',
      category: 'locked_savings' as InvestmentCategory,
      assetName: `${r.appOrPlatform || 'Fintech'} Locked Vault`,
      type: 'SAVINGS_LOCK',
      currency: 'NGN',
      amountPrimary: r.amountInvestedNaira || 0,
      amountSecondary: null,
      details: `${r.durationDays ?? 0}d @ ${r.interestRatePercentPerAnnum ?? 0}%`
    }))
  ];

  // Filter
  const filtered = allTransactions.filter(tx => {
    if (!tx) return false;
    const sTerm = (searchTerm || '').toLowerCase();
    const asset = (tx.assetName || '').toLowerCase();
    const details = (tx.details || '').toLowerCase();
    const txDate = (tx.date || '').toLowerCase();
    const matchesSearch = !sTerm || asset.includes(sTerm) || details.includes(sTerm) || txDate.includes(sTerm);
    const matchesCategory = filterType === 'all' || tx.category === filterType;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCategory = (cat: InvestmentCategory) => {
    setSelectedCategory(cat);
    setActiveScreen('investments');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e3e2e1] p-6 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#1a1c1c]" />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c]">Unified Transactions Ledger</h1>
          </div>
          <p className="text-xs text-[#747878] mt-1">
            Complete synchronized transaction history across all 10 investment classes ({allTransactions.length} recorded entries)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#f4f3f2] text-[#1a1c1c] border border-[#e3e2e1]">
            {filtered.length} TRANSACTIONS
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#ffffff] border border-[#e3e2e1] p-4 rounded">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#747878] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by asset, symbol, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#faf9f8] border border-[#e3e2e1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#1a1c1c]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#747878]">Filter Class:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 text-xs font-semibold text-[#1a1c1c]"
          >
            <option value="all">All Asset Classes ({allTransactions.length})</option>
            {Object.entries(CATEGORY_DETAILS).map(([k, v]) => (
              <option key={k} value={k}>{v.label} ({v.tag})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f3f2] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">DATE / PERIOD</th>
                <th className="py-3 px-4">CLASS</th>
                <th className="py-3 px-4">ASSET / TRANSACTION</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">EXECUTION DETAILS</th>
                <th className="py-3 px-4 font-mono text-right">AMOUNT (PRIMARY)</th>
                <th className="py-3 px-4 font-mono text-right">NAIRA EQUIVALENT</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {filtered.map((tx) => {
                const detail = CATEGORY_DETAILS[tx.category as keyof typeof CATEGORY_DETAILS];
                const isSell = tx.type === 'SELL';
                const isBuy = tx.type === 'BUY' || tx.type === 'INVESTMENT';
                return (
                  <tr key={tx.id} className="hover:bg-[#faf9f8] group">
                    <td className="py-3.5 px-4 font-mono text-[#747878]">{tx.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1]">
                        {detail?.tag || 'ASSET'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1a1c1c]">{tx.assetName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isSell 
                          ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]' 
                          : isBuy 
                          ? 'bg-[#1b6b51]/10 text-[#1b6b51]'
                          : 'bg-[#f4f3f2] text-[#1a1c1c]'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#444748] font-mono">{tx.details}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c] text-right">
                      {tx.currency === 'USD' ? formatUSD(tx.amountPrimary) : formatNaira(tx.amountPrimary)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#747878] text-right">
                      {tx.amountSecondary ? formatNaira(tx.amountSecondary) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenCategory(tx.category)}
                        className="text-xs font-semibold text-[#1a1c1c] group-hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Ledger</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
