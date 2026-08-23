import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatPercent } from '../../utils/calculations';
import { Trash2, Plus, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

interface SheetProps {
  onOpenAddModal: (category: 'fgn_bonds') => void;
}

export const FgnBondsSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { fgnBondRecords, deleteFgnBond } = useWealth();
  const [activeYear, setActiveYear] = useState<number>(2025);
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'PORTFOLIO'>('CALENDAR');

  const totalInvested = fgnBondRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
  const totalQuarterlyInterest = fgnBondRecords.reduce((acc, r) => acc + (r.quarterlyInterestNaira || 0), 0);
  const totalAnnualPassiveIncome = totalQuarterlyInterest * 4;

  const calendarMonths = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  // Helper to determine if a bond pays in a given month of a given year
  // In the workbook, 3-year bonds bought in 2025 pay 4 times a year for 3 years
  const getCouponForMonth = (record: any, month: string, year: number): number => {
    const isPaymentMonth = record.paymentMonths?.some((m: string) => m.toUpperCase() === month.toUpperCase());
    if (!isPaymentMonth) return 0;

    // A 3-year bond issued in 2025 pays through 2028
    const startYear = record.investmentYear || 2025;
    const endYear = startYear + (record.tenorYears || 3);
    
    // First coupon month logic
    const monthIndex = calendarMonths.indexOf(month.toUpperCase());
    const investMonthIndex = calendarMonths.indexOf(record.investmentMonth.toUpperCase());

    if (year === startYear) {
      // In first year, pays in payment months occurring after or in first coupon schedule
      return isPaymentMonth ? record.quarterlyInterestNaira : 0;
    } else if (year > startYear && year <= endYear) {
      return record.quarterlyInterestNaira;
    }
    return 0;
  };

  // Monthly totals for active year
  const monthlyTotals = calendarMonths.map(month => {
    return fgnBondRecords.reduce((acc, r) => acc + getCouponForMonth(r, month, activeYear), 0);
  });

  const totalYearlyIncome = monthlyTotals.reduce((acc, val) => acc + val, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL CAPITAL IN FGN BONDS</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalInvested)}</div>
          <div className="text-xs text-[#747878] mt-1">{fgnBondRecords.length} Active Bond Allotments</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">TOTAL QUARTERLY COUPON</div>
          <div className="text-2xl font-bold font-mono text-[#1b6b51] mt-1">+{formatNaira(totalQuarterlyInterest)}</div>
          <div className="text-xs text-[#747878] mt-1">Guaranteed quarterly tax-free cash flow</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1a1c1c] uppercase tracking-wider">PROJECTED ANNUAL INCOME</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalAnnualPassiveIncome)}</div>
          <div className="text-xs text-[#747878] mt-1">Annualized bond coupon earnings</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">AVERAGE COUPON YIELD</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">
            {fgnBondRecords.length > 0 ? (fgnBondRecords.reduce((acc, r) => acc + r.interestRatePercent, 0) / fgnBondRecords.length).toFixed(2) : '0.00'}%
          </div>
          <div className="text-xs text-[#747878] mt-1">Weighted average annual yield</div>
        </div>
      </div>

      {/* Mode Switcher & Year Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3e2e1] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('CALENDAR')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'CALENDAR' ? 'bg-[#1a1c1c] text-[#faf9f8]' : 'bg-[#ffffff] text-[#444748] border border-[#e3e2e1] hover:bg-[#f4f3f2]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Passive Income Calendar ({activeYear})</span>
          </button>
          <button
            onClick={() => setViewMode('PORTFOLIO')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              viewMode === 'PORTFOLIO' ? 'bg-[#1a1c1c] text-[#faf9f8]' : 'bg-[#ffffff] text-[#444748] border border-[#e3e2e1] hover:bg-[#f4f3f2]'
            }`}
          >
            Bond Portfolio Register ({fgnBondRecords.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'CALENDAR' && (
            <div className="flex items-center bg-[#eeeeed] p-0.5 rounded text-xs font-semibold">
              {[2025, 2026, 2027, 2028].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setActiveYear(yr)}
                  className={`px-3 py-1 rounded transition-all cursor-pointer font-mono ${
                    activeYear === yr ? 'bg-[#ffffff] text-[#1a1c1c] shadow-xs' : 'text-[#747878] hover:text-[#1a1c1c]'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => onOpenAddModal('fgn_bonds')}
            className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Bond Allotment</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTHLY PASSIVE INCOME CALCULATOR MATRIX */}
      {viewMode === 'CALENDAR' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">
                FGN SAVINGS BONDS MONTHLY PASSIVE INCOME CALCULATOR &middot; {activeYear}
              </span>
              <p className="text-[11px] text-[#747878]">Quarterly coupon payouts distributed by scheduled payment months</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#747878]">Total {activeYear} Cash Flow: </span>
              <span className="text-sm font-bold font-mono text-[#1b6b51]">{formatNaira(totalYearlyIncome)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 min-w-[140px] sticky left-0 bg-[#faf9f8] z-10">BROKER</th>
                  <th className="py-3 px-2">INVEST MONTH</th>
                  <th className="py-3 px-2 font-mono">AMOUNT (₦)</th>
                  <th className="py-3 px-2">RATE</th>
                  <th className="py-3 px-2 font-mono text-[#1b6b51]">QTR INT (₦)</th>
                  {calendarMonths.map((m) => (
                    <th key={m} className="py-3 px-2 text-center font-mono">
                      {m.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeed]">
                {fgnBondRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#faf9f8] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#1a1c1c] sticky left-0 bg-[#ffffff] group-hover:bg-[#faf9f8] z-10 whitespace-nowrap">
                      {r.broker}
                    </td>
                    <td className="py-2.5 px-2 font-mono uppercase text-[#747878]">{r.investmentMonth}</td>
                    <td className="py-2.5 px-2 font-mono font-medium text-[#1a1c1c]">{formatNaira(r.amountInvestedNaira, false)}</td>
                    <td className="py-2.5 px-2 font-mono text-[#747878]">{formatPercent(r.interestRatePercent)}</td>
                    <td className="py-2.5 px-2 font-mono font-semibold text-[#1b6b51]">
                      {formatNaira(r.quarterlyInterestNaira, false)}
                    </td>

                    {calendarMonths.map((m) => {
                      const coupon = getCouponForMonth(r, m, activeYear);
                      return (
                        <td
                          key={m}
                          className={`py-2.5 px-2 text-center font-mono font-medium ${
                            coupon > 0
                              ? 'bg-[#a6f2d1]/30 text-[#1b6b51] font-semibold border-x border-[#e3e2e1]/40'
                              : 'text-[#c4c7c7]'
                          }`}
                        >
                          {coupon > 0 ? formatNaira(coupon, false) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#f4f3f2] font-bold border-t-2 border-[#e3e2e1] text-xs">
                <tr>
                  <td colSpan={2} className="py-3 px-3 sticky left-0 bg-[#f4f3f2] z-10">
                    MONTHLY TOTALS ({activeYear})
                  </td>
                  <td className="py-3 px-2 font-mono">{formatNaira(totalInvested, false)}</td>
                  <td className="py-3 px-2"></td>
                  <td className="py-3 px-2 font-mono text-[#1b6b51]">{formatNaira(totalQuarterlyInterest, false)}</td>
                  {monthlyTotals.map((tot, idx) => (
                    <td
                      key={idx}
                      className={`py-3 px-2 text-center font-mono ${
                        tot > 0 ? 'text-[#1b6b51] font-bold' : 'text-[#747878]'
                      }`}
                    >
                      {tot > 0 ? formatNaira(tot, false) : '₦0'}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL REGISTER */}
      {viewMode === 'PORTFOLIO' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">
              FGN Savings Bonds Master Allotment Register
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">S/NO</th>
                  <th className="py-3 px-3">BROKER</th>
                  <th className="py-3 px-3">INVESTMENT MONTH</th>
                  <th className="py-3 px-3">AMOUNT INVESTED (₦)</th>
                  <th className="py-3 px-3">TENOR (YEARS)</th>
                  <th className="py-3 px-3">INTEREST RATE</th>
                  <th className="py-3 px-3 text-[#1b6b51]">QUARTERLY INTEREST (₦)</th>
                  <th className="py-3 px-3">PAYMENT MONTHS</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeed]">
                {fgnBondRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-[#faf9f8] transition-colors">
                    <td className="py-3.5 px-3 font-mono text-[#747878]">{r.sNo || idx + 1}</td>
                    <td className="py-3.5 px-3 font-semibold text-[#1a1c1c]">{r.broker}</td>
                    <td className="py-3.5 px-3 font-mono uppercase text-[#1a1c1c]">{r.investmentMonth}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(r.amountInvestedNaira)}</td>
                    <td className="py-3.5 px-3 font-mono text-[#747878]">{r.tenorYears || 3} Years</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{formatPercent(r.interestRatePercent)}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#1b6b51]">+{formatNaira(r.quarterlyInterestNaira)}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {r.paymentMonths?.map((m: string) => (
                          <span key={m} className="px-1.5 py-0.5 rounded text-[10px] bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1] font-mono">
                            {m.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#a6f2d1]/50 text-[#1b6b51] font-semibold">
                        {r.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button onClick={() => deleteFgnBond(r.id)} className="text-[#747878] hover:text-[#ba1a1a] p-1 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#f4f3f2]/60 font-semibold border-t border-[#e3e2e1] text-xs">
                <tr>
                  <td colSpan={3} className="py-3 px-3 font-bold">TOTAL FGN PORTFOLIO</td>
                  <td className="py-3 px-3 font-mono text-[#1a1c1c]">{formatNaira(totalInvested)}</td>
                  <td colSpan={2} className="py-3 px-3"></td>
                  <td className="py-3 px-3 font-mono text-[#1b6b51]">+{formatNaira(totalQuarterlyInterest)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
