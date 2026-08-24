import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatPercent, formatDate, calculateLockedSavingsInterest } from '../../utils/calculations';
import { Trash2, Plus, Smartphone, Edit2, Check, X } from 'lucide-react';
import { LockedSavingsRecord } from '../../types';

interface SheetProps {
  onOpenAddModal: (category: 'locked_savings') => void;
}

export const LockedSavingsSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { lockedSavingsRecords, deleteLockedSavings, updateLockedSavings } = useWealth();

  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [editIsTax, setEditIsTax] = useState<boolean>(false);
  const [editTaxRate, setEditTaxRate] = useState<string>('10.00');

  const totalInvested = lockedSavingsRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
  const totalInterest = lockedSavingsRecords.reduce((acc, r) => acc + (r.interestNaira || 0), 0);
  const totalLessTax = lockedSavingsRecords.reduce((acc, r) => acc + (r.lessTaxNaira || 0), 0);
  const totalExpectedMaturity = lockedSavingsRecords.reduce((acc, r) => acc + (r.expectedInterestPlusCapitalNaira || 0), 0);

  const startEditTax = (r: LockedSavingsRecord) => {
    setEditingTaxId(r.id);
    setEditIsTax(r.taxApplicable ?? (r.lessTaxNaira > 0));
    setEditTaxRate((r.taxRatePercent ?? (r.lessTaxNaira > 0 && r.grossInterestNaira ? (r.lessTaxNaira / r.grossInterestNaira) * 100 : 10)).toFixed(2));
  };

  const saveEditTax = (r: LockedSavingsRecord) => {
    const rate = editIsTax ? (parseFloat(editTaxRate) || 0) : 0;
    const calc = calculateLockedSavingsInterest(
      r.amountInvestedNaira,
      r.interestRatePercentPerAnnum,
      r.durationDays,
      editIsTax,
      rate
    );
    updateLockedSavings(r.id, {
      taxApplicable: editIsTax,
      taxRatePercent: rate,
      grossInterestNaira: calc.grossInterest,
      lessTaxNaira: calc.taxAmount,
      interestNaira: calc.netInterest,
      expectedInterestPlusCapitalNaira: calc.expectedInterestPlusCapitalNaira
    });
    setEditingTaxId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Cards matching Workbook Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL AMOUNT INVESTED</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalInvested)}</div>
          <div className="text-xs text-[#747878] mt-1">{lockedSavingsRecords.length} Active Fintech Locks</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">NET INTEREST EARNED</div>
          <div className="text-2xl font-bold font-mono text-[#1b6b51] mt-1">+{formatNaira(totalInterest)}</div>
          <div className="text-xs text-[#747878] mt-1">Net of withholding tax deductions</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#ba1a1a] uppercase tracking-wider">WITHHOLDING TAX PAID</div>
          <div className="text-2xl font-bold font-mono text-[#ba1a1a] mt-1">-{formatNaira(totalLessTax)}</div>
          <div className="text-xs text-[#747878] mt-1">Direct fintech tax deductions</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1a1c1c] uppercase tracking-wider">EXPECTED CAPITAL + INTEREST</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalExpectedMaturity)}</div>
          <div className="text-xs text-[#747878] mt-1">Net return at lock expiration</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-4 border-b border-[#e3e2e1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#0d9488]" />
            <div>
              <h3 className="text-sm font-semibold text-[#1a1c1c]">Savings &amp; Investments via Fintech Apps &amp; Platforms</h3>
              <p className="text-xs text-[#747878]">Daily accrued high-yield lock structures with per-record tax settings</p>
            </div>
          </div>
          <button
            onClick={() => onOpenAddModal('locked_savings')}
            className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Locked Deposit</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f3f2] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">S/NO</th>
                <th className="py-3 px-3">INVESTMENT DATE</th>
                <th className="py-3 px-3">APP / PLATFORM</th>
                <th className="py-3 px-3">SAVINGS PACKAGE</th>
                <th className="py-3 px-3">AMOUNT INVESTED/LOCKED (₦)</th>
                <th className="py-3 px-3">INTEREST RATE % (P.A)</th>
                <th className="py-3 px-3">DURATION (DAYS)</th>
                <th className="py-3 px-3">TAX RATE / STATUS</th>
                <th className="py-3 px-3 font-bold">EXPECTED CAPITAL + INT (₦)</th>
                <th className="py-3 px-3 text-[#ba1a1a]">LESS TAX (₦)</th>
                <th className="py-3 px-3 text-[#1b6b51]">NET INTEREST (₦)</th>
                <th className="py-3 px-3">REMARK</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {lockedSavingsRecords.map((r, idx) => (
                <tr key={r.id} className="hover:bg-[#faf9f8] transition-colors">
                  <td className="py-3.5 px-3 font-mono text-[#747878]">{r.sNo || idx + 1}</td>
                  <td className="py-3.5 px-3 font-mono text-[#1a1c1c]">{formatDate(r.investmentDate)}</td>
                  <td className="py-3.5 px-3 font-bold text-[#1a1c1c]">{r.appOrPlatform}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#1a1c1c] border border-[#e3e2e1]">
                      {r.savingsPackage}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(r.amountInvestedNaira)}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{formatPercent(r.interestRatePercentPerAnnum)}</td>
                  <td className="py-3.5 px-3 font-mono text-[#747878]">{r.durationDays} Days</td>
                  
                  {/* Tax Rate & Status with Quick Edit */}
                  <td className="py-3.5 px-3">
                    {editingTaxId === r.id ? (
                      <div className="flex items-center gap-1.5 bg-[#ffffff] border border-[#1b6b51] p-1 rounded shadow-sm">
                        <label className="text-[10px] font-medium flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsTax}
                            onChange={(e) => setEditIsTax(e.target.checked)}
                            className="rounded border-[#c4c7c7] text-[#1b6b51] w-3 h-3"
                          />
                          <span>Tax</span>
                        </label>
                        {editIsTax && (
                          <input
                            type="number"
                            step="0.1"
                            value={editTaxRate}
                            onChange={(e) => setEditTaxRate(e.target.value)}
                            className="w-12 px-1 py-0.5 border border-[#e3e2e1] rounded font-mono text-[10px]"
                            placeholder="%"
                          />
                        )}
                        <button
                          onClick={() => saveEditTax(r)}
                          className="p-0.5 bg-[#1b6b51] text-[#ffffff] rounded hover:bg-[#14533d]"
                          title="Save Tax Settings"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingTaxId(null)}
                          className="p-0.5 bg-[#f4f3f2] text-[#444748] rounded hover:bg-[#e3e2e1]"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {r.lessTaxNaira > 0 || r.taxApplicable ? (
                          <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#ba1a1a]/10 text-[#ba1a1a] font-semibold border border-[#ba1a1a]/20">
                            {r.taxRatePercent ? `${formatPercent(r.taxRatePercent)} WHT` : `Taxed`}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#747878] border border-[#e3e2e1]">
                            No Tax
                          </span>
                        )}
                        <button
                          onClick={() => startEditTax(r)}
                          className="text-[#747878] hover:text-[#1a1c1c] p-0.5 rounded hover:bg-[#f4f3f2]"
                          title="Edit Tax Rate for this lock"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-[#1a1c1c]">{formatNaira(r.expectedInterestPlusCapitalNaira)}</td>
                  <td className="py-3.5 px-3 font-mono text-[#ba1a1a]">
                    {r.lessTaxNaira > 0 ? `-${formatNaira(r.lessTaxNaira)}` : '₦0.00'}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#1b6b51]">+{formatNaira(r.interestNaira)}</td>
                  <td className="py-3.5 px-3 text-[#747878] max-w-xs truncate" title={r.remark}>
                    {r.remark || '—'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => deleteLockedSavings(r.id)}
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
                <td colSpan={4} className="py-3 px-3 font-bold">TOTAL LOCKED SAVINGS</td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(totalInvested)}</td>
                <td colSpan={2}></td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(totalExpectedMaturity)}</td>
                <td className="py-3 px-3 font-mono text-[#ba1a1a]">-{formatNaira(totalLessTax)}</td>
                <td className="py-3 px-3 font-mono text-[#1b6b51]">+{formatNaira(totalInterest)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
