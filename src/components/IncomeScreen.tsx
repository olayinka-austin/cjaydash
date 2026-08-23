import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { formatNaira, formatPercent, getFgnBondPaymentMonths } from '../utils/calculations';
import { Calendar, ShieldCheck, ChevronLeft, ChevronRight, DollarSign, ArrowUpRight } from 'lucide-react';

export const IncomeScreen: React.FC = () => {
  const { fgnBondRecords, summary, commercialPaperRecords, treasuryBillRecords, lockedSavingsRecords, setActiveScreen, setSelectedCategory } = useWealth();
  const [activeYear, setActiveYear] = useState<number>(2025);

  const calendarMonths = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  // Helper to determine coupon payment for a month and year
  const getCouponForMonth = (record: any, month: string, year: number): number => {
    const isPaymentMonth = record.paymentMonths?.some((m: string) => m.toUpperCase() === month.toUpperCase());
    if (!isPaymentMonth) return 0;

    const startYear = record.investmentYear || 2025;
    const endYear = startYear + (record.tenorYears || 3);
    
    if (year === startYear) {
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e3e2e1] p-6 rounded">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1b6b51]" />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c]">Passive Income &amp; FGN Savings Bonds Matrix</h1>
          </div>
          <p className="text-xs text-[#747878] mt-1">
            Official coupon disbursement schedule and monthly cash flow distribution (2025 &ndash; 2028)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f4f3f2] p-1 rounded border border-[#e3e2e1]">
          <button
            onClick={() => setActiveYear(Math.max(2025, activeYear - 1))}
            className="p-1.5 hover:bg-[#ffffff] text-[#1a1c1c] rounded transition-colors cursor-pointer"
            title="Previous Year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 font-mono font-bold text-xs text-[#1a1c1c]">YEAR {activeYear}</span>
          <button
            onClick={() => setActiveYear(Math.min(2028, activeYear + 1))}
            className="p-1.5 hover:bg-[#ffffff] text-[#1a1c1c] rounded transition-colors cursor-pointer"
            title="Next Year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* High-Level Income Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL BOND PRINCIPAL</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(summary.fgnTotalInvestedNaira)}</div>
          <div className="text-xs text-[#747878] mt-1">{fgnBondRecords.length} FGN bond tranches booked</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">QUARTERLY PASSIVE CASH FLOW</div>
          <div className="text-2xl font-bold font-mono text-[#1b6b51] mt-1">+{formatNaira(summary.fgnQuarterlyInterestNaira)}</div>
          <div className="text-xs text-[#747878] mt-1">Automated quarterly direct bank credit</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1a1c1c] uppercase tracking-wider">{activeYear} PROJECTED ANNUAL INCOME</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">+{formatNaira(totalYearlyIncome)}</div>
          <div className="text-xs text-[#747878] mt-1">Cumulative coupons across 12 calendar months</div>
        </div>
      </div>

      {/* 12-Month Calendar Grid for Selected Year */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded p-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#f4f3f2]">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1c1c]">Monthly Cash Flow Schedule ({activeYear})</h3>
            <p className="text-xs text-[#747878]">Detailed coupon payouts mapped to calendar disbursement months</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('fgn_bonds');
              setActiveScreen('investments');
            }}
            className="text-xs font-semibold text-[#1a1c1c] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open FGN Bonds Sheet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          {calendarMonths.map((month, idx) => {
            const monthlyAmount = monthlyTotals[idx];
            const hasPayout = monthlyAmount > 0;
            return (
              <div
                key={month}
                className={`p-3.5 rounded border transition-all ${
                  hasPayout
                    ? 'bg-[#faf9f8] border-[#1b6b51]/30 hover:border-[#1b6b51]'
                    : 'bg-[#faf9f8]/40 border-[#e3e2e1] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-[#747878]">{month}</span>
                  {hasPayout && (
                    <span className="w-2 h-2 rounded-full bg-[#1b6b51]"></span>
                  )}
                </div>
                <div className={`mt-2 font-mono text-sm font-bold ${hasPayout ? 'text-[#1b6b51]' : 'text-[#747878]'}`}>
                  {hasPayout ? `+${formatNaira(monthlyAmount, false)}` : '₦0.00'}
                </div>
                <div className="text-[10px] text-[#747878] mt-1">
                  {hasPayout ? 'Quarterly Coupon' : 'No Scheduled Payout'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bond Holdings Table */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">
            Active FGN Savings Bonds Tenors &amp; Rates
          </h3>
          <span className="text-xs font-mono font-semibold text-[#1a1c1c]">
            {fgnBondRecords.length} Active Holdings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">INVESTMENT PERIOD</th>
                <th className="py-3 px-4 font-mono text-right">PRINCIPAL (₦)</th>
                <th className="py-3 px-4 font-mono text-right">INTEREST RATE</th>
                <th className="py-3 px-4 font-mono text-right">QUARTERLY COUPON (₦)</th>
                <th className="py-3 px-4">SCHEDULED PAYMENT MONTHS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {fgnBondRecords.map((bond) => (
                <tr key={bond.id} className="hover:bg-[#faf9f8]">
                  <td className="py-3 px-4 font-bold text-[#1a1c1c]">{bond.investmentMonth} {bond.investmentYear}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#1a1c1c] text-right">{formatNaira(bond.amountInvestedNaira)}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#1b6b51] text-right">{formatPercent(bond.interestRatePercent)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#1b6b51] text-right">+{formatNaira(bond.quarterlyInterestNaira)}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {bond.paymentMonths?.map((m: string) => (
                        <span key={m} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1]">
                          {m.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
