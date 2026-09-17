import React, { useState, useMemo, useEffect } from 'react';
import { useWealth } from '../../context/WealthContext';
import { 
  formatNaira, 
  formatPercent, 
  calculateFgnBondQuarterlyInterest,
  getFgnBondPaymentMonths,
  getFgnBondStartYear,
  getFgnBondMaturityYear,
  getFgnBondAvailableYears
} from '../../utils/calculations';
import { Trash2, Plus, Calendar, Edit2, Check, X } from 'lucide-react';
import { FgnBondRecord } from '../../types';

interface SheetProps {
  onOpenAddModal: (category: 'fgn_bonds') => void;
}

export const FgnBondsSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { fgnBondRecords, deleteFgnBond, updateFgnBond } = useWealth();
  const [activeYear, setActiveYear] = useState<number>(2025);
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'PORTFOLIO'>('CALENDAR');

  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [editIsTax, setEditIsTax] = useState<boolean>(false);
  const [editTaxRate, setEditTaxRate] = useState<string>('10.00');

  // Full Bond Edit State
  const [editingBond, setEditingBond] = useState<FgnBondRecord | null>(null);
  const [editBroker, setEditBroker] = useState<string>('');
  const [editInvestMonth, setEditInvestMonth] = useState<string>('FEBRUARY');
  const [editInvestYear, setEditInvestYear] = useState<number>(2025);
  const [editAmount, setEditAmount] = useState<string>('1500000');
  const [editRate, setEditRate] = useState<string>('18.00');
  const [editTenorYears, setEditTenorYears] = useState<number>(3);
  const [editBondTaxApplicable, setEditBondTaxApplicable] = useState<boolean>(false);
  const [editBondTaxRate, setEditBondTaxRate] = useState<string>('10.00');

  // Derive dynamic timeline years from actual portfolio records
  const availableYears = useMemo(() => {
    return getFgnBondAvailableYears(fgnBondRecords);
  }, [fgnBondRecords]);

  // Keep activeYear valid when availableYears changes (addition, deletion, or edits)
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(activeYear)) {
      if (activeYear > availableYears[availableYears.length - 1]) {
        setActiveYear(availableYears[availableYears.length - 1]);
      } else if (activeYear < availableYears[0]) {
        setActiveYear(availableYears[0]);
      } else {
        setActiveYear(availableYears[0]);
      }
    }
  }, [availableYears, activeYear]);

  const totalInvested = fgnBondRecords.reduce((acc, r) => acc + (r.amountInvestedNaira || 0), 0);
  const totalQuarterlyInterest = fgnBondRecords.reduce((acc, r) => acc + (r.quarterlyInterestNaira || 0), 0);
  const totalTaxQuarterly = fgnBondRecords.reduce((acc, r) => acc + (r.taxAmountNaira || 0), 0);
  const totalAnnualPassiveIncome = totalQuarterlyInterest * 4;

  const startEditTax = (r: FgnBondRecord) => {
    setEditingTaxId(r.id);
    setEditIsTax(!!r.taxApplicable);
    setEditTaxRate((r.taxRatePercent ?? 10).toString());
  };

  const saveEditTax = (r: FgnBondRecord) => {
    const rate = editIsTax ? (parseFloat(editTaxRate) || 0) : 0;
    const calc = calculateFgnBondQuarterlyInterest(
      r.amountInvestedNaira,
      r.interestRatePercent,
      editIsTax,
      rate
    );
    updateFgnBond(r.id, {
      taxApplicable: editIsTax,
      taxRatePercent: rate,
      grossQuarterlyInterestNaira: calc.grossQuarterlyInterest,
      taxAmountNaira: calc.taxAmount,
      netQuarterlyInterestNaira: calc.netQuarterlyInterest,
      quarterlyInterestNaira: calc.quarterlyInterestNaira
    });
    setEditingTaxId(null);
  };

  const openEditModal = (r: FgnBondRecord) => {
    setEditingBond(r);
    setEditBroker(r.broker || '');
    setEditInvestMonth((r.investmentMonth || 'FEBRUARY').toUpperCase());
    setEditInvestYear(getFgnBondStartYear(r));
    setEditAmount((r.amountInvestedNaira || 0).toString());
    setEditRate((r.interestRatePercent || 0).toString());
    setEditTenorYears(r.tenorYears || 3);
    setEditBondTaxApplicable(!!r.taxApplicable);
    setEditBondTaxRate((r.taxRatePercent ?? 10).toString());
  };

  const handleSaveBondEdit = () => {
    if (!editingBond) return;
    const amt = parseFloat(editAmount) || editingBond.amountInvestedNaira;
    const rPct = parseFloat(editRate) || editingBond.interestRatePercent;
    const tYrs = parseInt(editTenorYears as any, 10) || 3;
    const tRate = editBondTaxApplicable ? (parseFloat(editBondTaxRate) || 0) : 0;
    const freq = 'Quarterly';
    const calc = calculateFgnBondQuarterlyInterest(amt, rPct, editBondTaxApplicable, tRate, freq);
    const pMonths = getFgnBondPaymentMonths(editInvestMonth, freq);
    const maturityYear = editInvestYear + tYrs;

    updateFgnBond(editingBond.id, {
      broker: editBroker,
      investmentMonth: editInvestMonth.toUpperCase(),
      investmentYear: editInvestYear,
      amountInvestedNaira: amt,
      tenorYears: tYrs,
      maturityYear,
      interestRatePercent: rPct,
      taxApplicable: editBondTaxApplicable,
      taxRatePercent: tRate,
      grossQuarterlyInterestNaira: calc.grossQuarterlyInterest,
      taxAmountNaira: calc.taxAmount,
      netQuarterlyInterestNaira: calc.netQuarterlyInterest,
      quarterlyInterestNaira: calc.quarterlyInterestNaira,
      paymentMonths: pMonths
    });
    setEditingBond(null);
  };

  const calendarMonths = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const getCouponForMonth = (record: any, month: string, year: number): number => {
    if (!record) return 0;
    const targetMonth = (month || '').toUpperCase().trim();
    const isPaymentMonth = record.paymentMonths?.some((m: string) => (m || '').toUpperCase().trim() === targetMonth);
    if (!isPaymentMonth) return 0;

    const startYear = getFgnBondStartYear(record);
    const endYear = getFgnBondMaturityYear(record);

    const startMonthStr = (record.investmentMonth || 'FEBRUARY').toUpperCase().trim();
    const startMonthIdx = calendarMonths.indexOf(startMonthStr);
    const targetMonthIdx = calendarMonths.indexOf(targetMonth);

    if (year < startYear || year > endYear) return 0;

    // In the investment start year, interest is never applied to a completed period before/on the investment date
    if (year === startYear && targetMonthIdx <= startMonthIdx) {
      return 0;
    }

    // In the maturity end year, interest is only applied on or before the maturity month
    if (year === endYear && targetMonthIdx > startMonthIdx) {
      return 0;
    }

    return record.quarterlyInterestNaira || 0;
  };

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
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">NET QUARTERLY COUPON</div>
          <div className="text-2xl font-bold font-mono text-[#1b6b51] mt-1">+{formatNaira(totalQuarterlyInterest)}</div>
          <div className="text-xs text-[#747878] mt-1">
            {totalTaxQuarterly > 0 ? `After -${formatNaira(totalTaxQuarterly)} tax deduction` : 'Quarterly cash flow'}
          </div>
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
              viewMode === 'CALENDAR' ? 'bg-accent text-white dark:text-[#111313] shadow-xs' : 'bg-[#ffffff] dark:bg-[#191c1b] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Passive Income Calendar ({activeYear})</span>
          </button>
          <button
            onClick={() => setViewMode('PORTFOLIO')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              viewMode === 'PORTFOLIO' ? 'bg-accent text-white dark:text-[#111313] shadow-xs' : 'bg-[#ffffff] dark:bg-[#191c1b] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130] hover:bg-[#f4f3f2] dark:hover:bg-[#222625]'
            }`}
          >
            Bond Portfolio Register ({fgnBondRecords.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'CALENDAR' && (
            <div className="flex items-center bg-[#eeeeed] dark:bg-[#222625] p-0.5 rounded text-xs font-semibold overflow-x-auto max-w-full">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setActiveYear(yr)}
                  className={`px-3 py-1 rounded transition-all cursor-pointer font-mono whitespace-nowrap ${
                    activeYear === yr ? 'bg-accent text-white dark:text-[#111313] shadow-xs' : 'text-[#747878] dark:text-[#8c9290] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2]'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => onOpenAddModal('fgn_bonds')}
            className="bg-accent hover:opacity-95 text-white dark:text-[#111313] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FGN Bond</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTHLY CALENDAR MATRIX */}
      {viewMode === 'CALENDAR' && (
        <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
          <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">
                FGN Bond Monthly Passive Income Schedule — {activeYear} Calendar
              </span>
              <p className="text-[11px] text-[#747878]">Exact quarterly coupon cashflows paid into settlement accounts per broker allotment</p>
            </div>
            <div className="text-xs font-mono font-semibold text-[#1b6b51]">
              Total {activeYear} Scheduled Coupons: {formatNaira(totalYearlyIncome)}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 sticky left-0 bg-[#faf9f8] z-10">BROKER</th>
                  <th className="py-3 px-2">ISSUANCE</th>
                  <th className="py-3 px-2 font-mono">INVESTED (₦)</th>
                  <th className="py-3 px-2 font-mono">RATE</th>
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
                  <th className="py-3 px-3">TAX RATE / STATUS</th>
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
                    <td className="py-3.5 px-3 font-mono uppercase text-[#1a1c1c]">
                      {r.investmentMonth} {r.investmentYear || 2025}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{formatNaira(r.amountInvestedNaira)}</td>
                    <td className="py-3.5 px-3 font-mono text-[#747878]">
                      {r.tenorYears || 3} Yrs <span className="text-[10px] text-[#747878]">(Mat: {getFgnBondMaturityYear(r)})</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#1a1c1c]">{formatPercent(r.interestRatePercent)}</td>

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
                          {r.taxApplicable ? (
                            <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#ba1a1a]/10 text-[#ba1a1a] font-semibold border border-[#ba1a1a]/20">
                              {formatPercent(r.taxRatePercent || 0)} WHT (-{formatNaira(r.taxAmountNaira || 0, false)})
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#747878] border border-[#e3e2e1]">
                              Tax Exempt
                            </span>
                          )}
                          <button
                            onClick={() => startEditTax(r)}
                            className="text-[#747878] hover:text-[#1a1c1c] p-0.5 rounded hover:bg-[#f4f3f2]"
                            title="Edit Tax Rate for this bond"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-[#1b6b51]">
                      +{formatNaira(r.quarterlyInterestNaira)}
                      {r.taxApplicable && r.grossQuarterlyInterestNaira && (
                        <span className="block text-[10px] text-[#747878] font-normal">
                          Gross: {formatNaira(r.grossQuarterlyInterestNaira, false)}
                        </span>
                      )}
                    </td>
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
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button 
                        onClick={() => openEditModal(r)} 
                        className="text-[#747878] hover:text-accent p-1 rounded mr-1 cursor-pointer transition-colors"
                        title="Edit Bond Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteFgnBond(r.id)} 
                        className="text-[#747878] hover:text-[#ba1a1a] p-1 rounded cursor-pointer transition-colors"
                        title="Delete Bond"
                      >
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
                  <td colSpan={3} className="py-3 px-3"></td>
                  <td className="py-3 px-3 font-mono text-[#1b6b51]">+{formatNaira(totalQuarterlyInterest)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* EDIT BOND MODAL */}
      {editingBond && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between bg-[#faf9f8] dark:bg-[#222625]">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a1c1c] dark:text-[#e1e3e2]">
                  Edit FGN Bond Allotment
                </h3>
                <p className="text-[11px] text-[#747878] dark:text-[#8c9290]">
                  Update investment year, tenure, or return metrics
                </p>
              </div>
              <button
                onClick={() => setEditingBond(null)}
                className="text-[#747878] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2] p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Broker / Custodian</label>
                  <input
                    type="text"
                    value={editBroker}
                    onChange={(e) => setEditBroker(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-medium text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Investment Month</label>
                  <select
                    value={editInvestMonth}
                    onChange={(e) => setEditInvestMonth(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono uppercase text-[#1a1c1c] dark:text-[#e1e3e2]"
                  >
                    {calendarMonths.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Investment Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2060"
                    value={editInvestYear}
                    onChange={(e) => setEditInvestYear(parseInt(e.target.value, 10) || 2025)}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Tenor (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editTenorYears}
                    onChange={(e) => setEditTenorYears(parseInt(e.target.value, 10) || 3)}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                  <span className="text-[10px] text-[#747878] mt-0.5 block">
                    Matures in: <strong className="font-mono">{editInvestYear + (parseInt(editTenorYears as any, 10) || 3)}</strong>
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Amount Invested (₦)</label>
                  <input
                    type="number"
                    step="100000"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#747878] uppercase">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 font-mono text-[#1a1c1c] dark:text-[#e1e3e2]"
                  />
                </div>

                <div className="sm:col-span-2 bg-[#f4f3f2]/60 dark:bg-[#222625]/60 border border-[#e3e2e1] dark:border-[#2d3130] p-3 rounded">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBondTaxApplicable}
                        onChange={(e) => setEditBondTaxApplicable(e.target.checked)}
                        className="rounded border-[#c4c7c7] text-[#1b6b51] w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-[11px] uppercase">Withholding Tax Applicable</span>
                    </label>

                    {editBondTaxApplicable && (
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-[#747878]">Rate:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={editBondTaxRate}
                          onChange={(e) => setEditBondTaxRate(e.target.value)}
                          className="w-16 px-2 py-0.5 border border-[#e3e2e1] dark:border-[#2d3130] rounded font-mono text-[11px] bg-white dark:bg-[#191c1b]"
                          placeholder="%"
                        />
                        <span className="text-[11px] text-[#747878]">%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e3e2e1] dark:border-[#2d3130] bg-[#faf9f8] dark:bg-[#222625] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBond(null)}
                className="px-4 py-2 border border-[#e3e2e1] dark:border-[#2d3130] text-[#444748] dark:text-[#c2c7c5] hover:bg-[#f4f3f2] dark:hover:bg-[#2d3130] rounded text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBondEdit}
                className="px-4 py-2 bg-accent hover:opacity-95 text-white dark:text-[#111313] rounded text-xs font-semibold uppercase tracking-wider shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
