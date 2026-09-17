import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatDate } from '../../utils/calculations';
import { Trash2, Plus, Edit3 } from 'lucide-react';
import { InvestmentCategory } from '../../types';

interface SheetProps {
  onOpenAddModal: (category: InvestmentCategory) => void;
  category?: InvestmentCategory | string;
  title?: string;
}

export const MutualFundsSheet: React.FC<SheetProps> = ({ 
  onOpenAddModal, 
  category = 'mutual_funds',
  title
}) => {
  const { mutualFundRecords, deleteMutualFund, updateMutualFund } = useWealth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNavInput, setNewNavInput] = useState<string>('');

  const isEmergency = category === 'emergency_funds' || category === 'emergency-funds';
  const isMiniMart = category === 'mini_mart_funds' || category === 'mini-mart-funds';

  const categoryKey: InvestmentCategory = isEmergency 
    ? 'emergency_funds' 
    : isMiniMart 
    ? 'mini_mart_funds' 
    : 'mutual_funds';

  const displayName = title || (isEmergency 
    ? 'Emergency Funds' 
    : isMiniMart 
    ? 'Mini Mart Funds' 
    : 'Mutual Funds (Managed Funds)');

  const subTitle = isEmergency 
    ? 'Emergency Reserve Fund Tracker' 
    : isMiniMart 
    ? 'Mini Mart Capital & Inventory Fund Tracker' 
    : 'Mutual Funds Tracker';

  const bookCapitalDesc = isEmergency
    ? 'Liquid reserve capital in emergency pools'
    : isMiniMart
    ? 'Working capital in retail & inventory funds'
    : 'Book capital in pooled funds';

  const records = mutualFundRecords.filter(r => {
    if (isEmergency) {
      return r.investmentClass === 'emergency_funds' || r.investmentClass === 'emergency-funds' || r.id.startsWith('ef-');
    }
    if (isMiniMart) {
      return r.investmentClass === 'mini_mart_funds' || r.investmentClass === 'mini-mart-funds' || r.id.startsWith('mmf-');
    }
    return !r.investmentClass || r.investmentClass === 'mutual_funds' || r.investmentClass === 'mutual-funds' || r.id.startsWith('mf-');
  });

  const totalInvested = records.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
  const totalUnits = records.reduce((acc, r) => acc + (r.unitsPurchased || 0), 0);
  const totalCurrentValue = records.reduce((acc, r) => acc + (r.currentValueNaira || 0), 0);
  const totalGainLoss = records.reduce((acc, r) => acc + (r.gainOrLossNaira || 0), 0);

  const handleUpdateNav = (id: string, units: number, invested: number) => {
    const navNum = parseFloat(newNavInput);
    if (!isNaN(navNum) && navNum > 0) {
      const currentVal = Number((units * navNum).toFixed(2));
      const gainLoss = Number((currentVal - invested).toFixed(2));
      updateMutualFund(id, {
        currentNavPerUnitNaira: navNum,
        currentValueNaira: currentVal,
        gainOrLossNaira: gainLoss
      });
      setEditingId(null);
      setNewNavInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] dark:bg-[#1a1c1c] border border-[#e3e2e1] dark:border-[#2d3131] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL AMOUNT INVESTED</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#f4f3f2] mt-1">{formatNaira(totalInvested)}</div>
          <div className="text-xs text-[#747878] mt-1">{bookCapitalDesc}</div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#1a1c1c] border border-[#e3e2e1] dark:border-[#2d3131] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL UNITS HELD</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#f4f3f2] mt-1">{(totalUnits ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
          <div className="text-xs text-[#747878] mt-1">Accumulated units purchased</div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#1a1c1c] border border-[#e3e2e1] dark:border-[#2d3131] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1a1c1c] dark:text-[#f4f3f2] uppercase tracking-wider">TOTAL CURRENT VALUE</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#f4f3f2] mt-1">{formatNaira(totalCurrentValue)}</div>
          <div className="text-xs text-[#747878] mt-1">Units &times; Current Market NAV</div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#1a1c1c] border border-[#e3e2e1] dark:border-[#2d3131] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">UNREALIZED GAIN / LOSS</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${totalGainLoss >= 0 ? 'text-[#1b6b51]' : 'text-[#ba1a1a]'}`}>
            {totalGainLoss >= 0 ? '+' : ''}{formatNaira(totalGainLoss)}
          </div>
          <div className="text-xs text-[#747878] mt-1">Live valuation variance</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#ffffff] dark:bg-[#1a1c1c] border border-[#e3e2e1] dark:border-[#2d3131] rounded overflow-hidden">
        <div className="p-4 border-b border-[#e3e2e1] dark:border-[#2d3131] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1c1c] dark:text-[#f4f3f2]">{subTitle}</h3>
            <p className="text-xs text-[#747878]">Units Purchased = Amount Invested &divide; NAV/Unit at Purchase &middot; Current Value = Units &times; Current NAV</p>
          </div>
          <button
            onClick={() => onOpenAddModal(categoryKey)}
            className="bg-accent hover:opacity-95 text-white dark:text-[#111313] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Fund Tranche</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f3f2] dark:bg-[#222626] text-[#444748] dark:text-[#c4c7c7] border-b border-[#e3e2e1] dark:border-[#2d3131] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">S/NO</th>
                <th className="py-3 px-3">MONTH</th>
                <th className="py-3 px-3">INVESTMENT DATE</th>
                <th className="py-3 px-3">FUND NAME</th>
                <th className="py-3 px-3">AMOUNT INVESTED (₦)</th>
                <th className="py-3 px-3">NAV/UNIT AT PURCHASE (₦)</th>
                <th className="py-3 px-3">UNITS PURCHASED</th>
                <th className="py-3 px-3">CURRENT NAV/UNIT (₦)</th>
                <th className="py-3 px-3 font-bold">CURRENT VALUE (₦)</th>
                <th className="py-3 px-3">GAIN/LOSS (₦)</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">NOTES</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed] dark:divide-[#282c2c]">
              {records.map((r, idx) => (
                <tr key={r.id} className="hover:bg-[#faf9f8] dark:hover:bg-[#202323] transition-colors">
                  <td className="py-3.5 px-3 font-mono text-[#747878]">{r.sNo || idx + 1}</td>
                  <td className="py-3.5 px-3 font-mono text-[#1a1c1c] dark:text-[#e2e2e2]">{r.month}</td>
                  <td className="py-3.5 px-3 font-mono text-[#1a1c1c] dark:text-[#e2e2e2]">{formatDate(r.investmentDate)}</td>
                  <td className="py-3.5 px-3 font-semibold text-[#1a1c1c] dark:text-[#e2e2e2]">{r.fundName}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c] dark:text-[#e2e2e2]">{formatNaira(r.amountInvestedNaira)}</td>
                  <td className="py-3.5 px-3 font-mono text-[#747878]">₦{r.navPerUnitAtPurchaseNaira.toFixed(2)}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c] dark:text-[#e2e2e2]">{r.unitsPurchased.toFixed(4)}</td>
                  
                  {/* Editable Current NAV */}
                  <td className="py-3.5 px-3 font-mono">
                    {editingId === r.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={r.currentNavPerUnitNaira}
                          onChange={(e) => setNewNavInput(e.target.value)}
                          className="w-20 px-1.5 py-0.5 border border-[#1a1c1c] dark:border-[#444748] rounded text-xs font-mono dark:bg-[#111313] dark:text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateNav(r.id, r.unitsPurchased, r.amountInvestedNaira)}
                          className="text-[10px] bg-[#1a1c1c] dark:bg-[#e2e2e2] text-[#faf9f8] dark:text-[#111313] px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[10px] text-[#747878] cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <span className="font-semibold text-[#1a1c1c] dark:text-[#e2e2e2]">₦{r.currentNavPerUnitNaira.toFixed(2)}</span>
                        <button
                          onClick={() => {
                            setEditingId(r.id);
                            setNewNavInput(r.currentNavPerUnitNaira.toString());
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#747878] hover:text-[#1a1c1c] dark:hover:text-white transition-opacity cursor-pointer"
                          title="Update Live NAV"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-[#1a1c1c] dark:text-[#e2e2e2]">{formatNaira(r.currentValueNaira)}</td>
                  <td className={`py-3.5 px-3 font-mono font-semibold ${r.gainOrLossNaira >= 0 ? 'text-[#1b6b51]' : 'text-[#ba1a1a]'}`}>
                    {r.gainOrLossNaira >= 0 ? '+' : ''}{formatNaira(r.gainOrLossNaira)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#a6f2d1]/50 text-[#1b6b51] font-semibold">
                      {r.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#747878] max-w-xs truncate" title={r.notes}>
                    {r.notes || '—'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => deleteMutualFund(r.id)}
                      className="text-[#747878] hover:text-[#ba1a1a] p-1 rounded cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-[#747878] dark:text-[#8c9290]">
                    No {displayName.toLowerCase()} records found. Click &quot;Add Fund Tranche&quot; to record your first tranche.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-[#f4f3f2]/60 dark:bg-[#222626]/60 font-semibold border-t border-[#e3e2e1] dark:border-[#2d3131] text-xs">
              <tr>
                <td colSpan={4} className="py-3 px-3 font-bold uppercase">TOTAL {displayName}</td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c] dark:text-[#e2e2e2]">{formatNaira(totalInvested)}</td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c] dark:text-[#e2e2e2]">{totalUnits.toFixed(4)} Units</td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c] dark:text-[#e2e2e2]">{formatNaira(totalCurrentValue)}</td>
                <td className={`py-3 px-3 font-mono ${totalGainLoss >= 0 ? 'text-[#1b6b51]' : 'text-[#ba1a1a]'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{formatNaira(totalGainLoss)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

