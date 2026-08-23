import React from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatPercent, formatDate } from '../../utils/calculations';
import { Trash2, Plus, ShieldCheck } from 'lucide-react';

interface SheetProps {
  onOpenAddModal: (category: 'treasury_bills') => void;
}

export const TreasuryBillsSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { treasuryBillRecords, deleteTreasuryBill } = useWealth();

  const totalInvested = treasuryBillRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
  const totalInterest = treasuryBillRecords.reduce((acc, r) => acc + (r.interestEarnedNaira || 0), 0);
  const totalAtMaturity = treasuryBillRecords.reduce((acc, r) => acc + (r.totalAtMaturityNaira || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL T-BILLS INVESTED</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalInvested)}</div>
          <div className="text-xs text-[#747878] mt-1">Sovereign CBN/FGN guaranteed notes</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">TOTAL MATURITY INTEREST</div>
          <div className="text-2xl font-bold font-mono text-[#1b6b51] mt-1">+{formatNaira(totalInterest)}</div>
          <div className="text-xs text-[#747878] mt-1">Upfront / Maturity yield accrual</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1a1c1c] uppercase tracking-wider">TOTAL MATURITY PAYOUT</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalAtMaturity)}</div>
          <div className="text-xs text-[#747878] mt-1">{treasuryBillRecords.length} Active tranches</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-4 border-b border-[#e3e2e1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1b6b51]" />
            <div>
              <h3 className="text-sm font-semibold text-[#1a1c1c]">Treasury Bills Monthly Investment Tracker</h3>
              <p className="text-xs text-[#747878]">Federal Government Treasury Bills records with maturity yields</p>
            </div>
          </div>
          <button
            onClick={() => onOpenAddModal('treasury_bills')}
            className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Treasury Bill</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f3f2] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">S/NO</th>
                <th className="py-3 px-3">MONTH</th>
                <th className="py-3 px-3">INVESTMENT DATE</th>
                <th className="py-3 px-3">AMOUNT INVESTED (₦)</th>
                <th className="py-3 px-3">T-BILL TENOR (DAYS)</th>
                <th className="py-3 px-3">RATE (%)</th>
                <th className="py-3 px-3">MATURITY DATE</th>
                <th className="py-3 px-3 text-[#1b6b51]">INTEREST EARNED (₦)</th>
                <th className="py-3 px-3 font-bold">TOTAL AT MATURITY (₦)</th>
                <th className="py-3 px-3">PLATFORM USED</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">REMARK</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {treasuryBillRecords.map((r, idx) => (
                <tr key={r.id} className="hover:bg-[#faf9f8] transition-colors">
                  <td className="py-3.5 px-3 font-mono text-[#747878]">{r.sNo || idx + 1}</td>
                  <td className="py-3.5 px-3 font-mono text-[#1a1c1c]">{r.month}</td>
                  <td className="py-3.5 px-3 font-mono text-[#1a1c1c]">{formatDate(r.investmentDate)}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(r.amountInvestedNaira)}</td>
                  <td className="py-3.5 px-3 font-mono text-[#747878]">{r.tenorDays} days</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{formatPercent(r.ratePercent)}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#b45309]">{formatDate(r.maturityDate)}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#1b6b51]">+{formatNaira(r.interestEarnedNaira)}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#1a1c1c]">{formatNaira(r.totalAtMaturityNaira)}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#1a1c1c] border border-[#e3e2e1]">
                      {r.platformUsed}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#a6f2d1]/50 text-[#1b6b51] font-semibold">
                      {r.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#747878] max-w-xs truncate" title={r.remark}>
                    {r.remark || '—'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => deleteTreasuryBill(r.id)}
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
                <td colSpan={3} className="py-3 px-3 font-bold">TOTALS</td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(totalInvested)}</td>
                <td colSpan={3} className="py-3 px-3"></td>
                <td className="py-3 px-3 font-mono text-[#1b6b51]">+{formatNaira(totalInterest)}</td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(totalAtMaturity)}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
