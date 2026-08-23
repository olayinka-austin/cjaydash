import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatDate } from '../../utils/calculations';
import { Trash2, Plus, Edit3, TrendingUp } from 'lucide-react';

interface SheetProps {
  onOpenAddModal: (category: 'mutual_funds') => void;
}

export const MutualFundsSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { mutualFundRecords, deleteMutualFund, updateMutualFund } = useWealth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNavInput, setNewNavInput] = useState<string>('');

  const totalInvested = mutualFundRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
  const totalUnits = mutualFundRecords.reduce((acc, r) => acc + (r.unitsPurchased || 0), 0);
  const totalCurrentValue = mutualFundRecords.reduce((acc, r) => acc + (r.currentValueNaira || 0), 0);
  const totalGainLoss = mutualFundRecords.reduce((acc, r) => acc + (r.gainOrLossNaira || 0), 0);

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
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL AMOUNT INVESTED</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalInvested)}</div>
          <div className="text-xs text-[#747878] mt-1">Book capital in pooled funds</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL UNITS HELD</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{totalUnits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
          <div className="text-xs text-[#747878] mt-1">Accumulated units purchased</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1a1c1c] uppercase tracking-wider">TOTAL CURRENT VALUE</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalCurrentValue)}</div>
          <div className="text-xs text-[#747878] mt-1">Units &times; Current Market NAV</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">UNREALIZED GAIN / LOSS</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${totalGainLoss >= 0 ? 'text-[#1b6b51]' : 'text-[#ba1a1a]'}`}>
            {totalGainLoss >= 0 ? '+' : ''}{formatNaira(totalGainLoss)}
          </div>
          <div className="text-xs text-[#747878] mt-1">Live valuation variance</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-4 border-b border-[#e3e2e1] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1c1c]">Mutual Funds Tracker</h3>
            <p className="text-xs text-[#747878]">Units Purchased = Amount Invested &divide; NAV/Unit at Purchase &middot; Current Value = Units &times; Current NAV</p>
          </div>
          <button
            onClick={() => onOpenAddModal('mutual_funds')}
            className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Fund Tranche</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f3f2] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#eeeeed]">
              {mutualFundRecords.map((r, idx) => (
                <tr key={r.id} className="hover:bg-[#faf9f8] transition-colors">
                  <td className="py-3.5 px-3 font-mono text-[#747878]">{r.sNo || idx + 1}</td>
                  <td className="py-3.5 px-3 font-mono text-[#1a1c1c]">{r.month}</td>
                  <td className="py-3.5 px-3 font-mono text-[#1a1c1c]">{formatDate(r.investmentDate)}</td>
                  <td className="py-3.5 px-3 font-semibold text-[#1a1c1c]">{r.fundName}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(r.amountInvestedNaira)}</td>
                  <td className="py-3.5 px-3 font-mono text-[#747878]">₦{r.navPerUnitAtPurchaseNaira.toFixed(2)}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{r.unitsPurchased.toFixed(4)}</td>
                  
                  {/* Editable Current NAV */}
                  <td className="py-3.5 px-3 font-mono">
                    {editingId === r.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={r.currentNavPerUnitNaira}
                          onChange={(e) => setNewNavInput(e.target.value)}
                          className="w-20 px-1.5 py-0.5 border border-[#1a1c1c] rounded text-xs font-mono"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateNav(r.id, r.unitsPurchased, r.amountInvestedNaira)}
                          className="text-[10px] bg-[#1a1c1c] text-[#faf9f8] px-1.5 py-0.5 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[10px] text-[#747878]"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <span className="font-semibold text-[#1a1c1c]">₦{r.currentNavPerUnitNaira.toFixed(2)}</span>
                        <button
                          onClick={() => {
                            setEditingId(r.id);
                            setNewNavInput(r.currentNavPerUnitNaira.toString());
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#747878] hover:text-[#1a1c1c] transition-opacity"
                          title="Update Live NAV"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-[#1a1c1c]">{formatNaira(r.currentValueNaira)}</td>
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
                      className="text-[#747878] hover:text-[#ba1a1a] p-1 rounded"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#f4f3f2]/60 font-semibold border-t border-[#e3e2e1] text-xs">
              <tr>
                <td colSpan={4} className="py-3 px-3 font-bold">TOTAL MUTUAL FUNDS</td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(totalInvested)}</td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c]">{totalUnits.toFixed(4)} Units</td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(totalCurrentValue)}</td>
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
