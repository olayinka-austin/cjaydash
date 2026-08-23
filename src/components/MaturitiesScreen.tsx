import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { formatNaira, formatPercent, formatDate } from '../utils/calculations';
import { Calendar, AlertCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { InvestmentCategory } from '../types';

export const MaturitiesScreen: React.FC = () => {
  const { 
    commercialPaperRecords, 
    treasuryBillRecords, 
    lockedSavingsRecords,
    setSelectedCategory,
    setActiveScreen
  } = useWealth();

  const [filterType, setFilterType] = useState<string>('all');

  // Consolidate all fixed income instruments with tenors/maturities safely
  const allMaturities = [
    ...commercialPaperRecords.map(r => ({
      id: r.id,
      category: 'commercial_papers' as InvestmentCategory,
      assetType: 'Commercial Paper',
      tag: 'CP',
      issuer: r.issuer || r.platformUsed || 'Commercial Paper',
      investmentDate: r.investmentDate || '',
      maturityDate: r.maturityDate || '',
      durationDays: r.tenorDays || 0,
      amountInvested: r.amountInvestedNaira || 0,
      ratePercent: r.ratePercent || 0,
      interestEarned: r.interestEarnedNaira || 0,
      totalAtMaturity: r.totalAtMaturityNaira || 0,
      status: r.status || 'Active'
    })),
    ...treasuryBillRecords.map(r => ({
      id: r.id,
      category: 'treasury_bills' as InvestmentCategory,
      assetType: 'Treasury Bill',
      tag: 'T-BILLS',
      issuer: r.platformUsed || 'Treasury Bill',
      investmentDate: r.investmentDate || '',
      maturityDate: r.maturityDate || '',
      durationDays: r.tenorDays || 0,
      amountInvested: r.amountInvestedNaira || 0,
      ratePercent: r.ratePercent || 0,
      interestEarned: r.interestEarnedNaira || 0,
      totalAtMaturity: r.totalAtMaturityNaira || 0,
      status: r.status || 'Active'
    })),
    ...lockedSavingsRecords.map(r => {
      let calcMaturity = '';
      if (r.investmentDate) {
        try {
          const d = new Date(r.investmentDate);
          d.setDate(d.getDate() + (r.durationDays || 30));
          calcMaturity = d.toISOString().split('T')[0];
        } catch {
          calcMaturity = r.investmentDate;
        }
      }
      return {
        id: r.id,
        category: 'locked_savings' as InvestmentCategory,
        assetType: 'Locked Savings',
        tag: 'LOCKED',
        issuer: r.appOrPlatform || 'Fintech App',
        investmentDate: r.investmentDate || '',
        maturityDate: calcMaturity,
        durationDays: r.durationDays || 0,
        amountInvested: r.amountInvestedNaira || 0,
        ratePercent: r.interestRatePercentPerAnnum || 0,
        interestEarned: r.interestNaira || 0,
        totalAtMaturity: r.expectedInterestPlusCapitalNaira || 0,
        status: r.status || 'Active'
      };
    })
  ].sort((a, b) => {
    if (!a.maturityDate) return 1;
    if (!b.maturityDate) return -1;
    return new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime();
  });

  const filteredMaturities = filterType === 'all' 
    ? allMaturities 
    : allMaturities.filter(m => m.category === filterType);

  const totalUpcomingLiquidity = allMaturities.reduce((acc, m) => acc + (m.totalAtMaturity || 0), 0);
  const totalPrincipal = allMaturities.reduce((acc, m) => acc + (m.amountInvested || 0), 0);
  const totalExpectedInterest = allMaturities.reduce((acc, m) => acc + (m.interestEarned || 0), 0);

  const handleOpenSheet = (cat: InvestmentCategory) => {
    setSelectedCategory(cat);
    setActiveScreen('investments');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e3e2e1] p-6 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1a1c1c]" />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c]">Maturity &amp; Tenor Schedule</h1>
          </div>
          <p className="text-xs text-[#747878] mt-1">
            Timeline of maturing Commercial Papers, Treasury Bills, and Fintech Locked Deposits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-1.5 text-xs font-semibold text-[#1a1c1c]"
          >
            <option value="all">All Instruments ({allMaturities.length})</option>
            <option value="commercial_papers">Commercial Papers Only</option>
            <option value="treasury_bills">Treasury Bills Only</option>
            <option value="locked_savings">Locked Savings Only</option>
          </select>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">TOTAL ACTIVE PRINCIPAL</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalPrincipal)}</div>
          <div className="text-xs text-[#747878] mt-1">{allMaturities.length} active tenor-bound holdings</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1b6b51] uppercase tracking-wider">ACCUMULATING INTEREST</div>
          <div className="text-2xl font-bold font-mono text-[#1b6b51] mt-1">+{formatNaira(totalExpectedInterest)}</div>
          <div className="text-xs text-[#747878] mt-1">Contractual yield at tenor completion</div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
          <div className="text-[11px] font-semibold text-[#1a1c1c] uppercase tracking-wider">TOTAL EXPECTED LIQUIDITY</div>
          <div className="text-2xl font-bold font-mono text-[#1a1c1c] mt-1">{formatNaira(totalUpcomingLiquidity)}</div>
          <div className="text-xs text-[#747878] mt-1">Gross payout (Principal + Yield)</div>
        </div>
      </div>

      {/* Maturities Table */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-4 border-b border-[#e3e2e1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1a1c1c]" />
            <h3 className="text-sm font-semibold text-[#1a1c1c]">Chronological Maturity Schedule</h3>
          </div>
          <span className="text-xs font-mono text-[#747878]">{filteredMaturities.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f3f2] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">ISSUER / PLATFORM</th>
                <th className="py-3 px-4">INVESTMENT DATE</th>
                <th className="py-3 px-4">TENOR</th>
                <th className="py-3 px-4">RATE (P.A)</th>
                <th className="py-3 px-4 font-mono text-right">PRINCIPAL (₦)</th>
                <th className="py-3 px-4 font-mono text-right text-[#1b6b51]">INTEREST (₦)</th>
                <th className="py-3 px-4 font-mono text-right font-bold">PAYOUT AT MATURITY (₦)</th>
                <th className="py-3 px-4">MATURITY DATE</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {filteredMaturities.map((item) => (
                <tr key={item.id} className="hover:bg-[#faf9f8] transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#1a1c1c] border border-[#e3e2e1]">
                      {item.tag}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1a1c1c]">{item.issuer}</td>
                  <td className="py-3.5 px-4 font-mono text-[#747878]">{formatDate(item.investmentDate)}</td>
                  <td className="py-3.5 px-4 font-mono text-[#1a1c1c]">{item.durationDays} Days</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#1a1c1c]">{formatPercent(item.ratePercent)}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#1a1c1c] text-right">{formatNaira(item.amountInvested)}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#1b6b51] text-right">+{formatNaira(item.interestEarned)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c] text-right">{formatNaira(item.totalAtMaturity)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#ba1a1a]">{formatDate(item.maturityDate)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#1b6b51]/10 text-[#1b6b51] border border-[#1b6b51]/20">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenSheet(item.category)}
                      className="text-xs font-semibold text-[#1a1c1c] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#f4f3f2]/60 font-semibold border-t border-[#e3e2e1] text-xs">
              <tr>
                <td colSpan={5} className="py-3 px-4 font-bold">TOTAL PORTFOLIO SCHEDULE</td>
                <td className="py-3 px-4 font-mono text-[#1a1c1c] text-right">{formatNaira(totalPrincipal)}</td>
                <td className="py-3 px-4 font-mono text-[#1b6b51] text-right">+{formatNaira(totalExpectedInterest)}</td>
                <td className="py-3 px-4 font-mono text-[#1a1c1c] text-right font-bold">{formatNaira(totalUpcomingLiquidity)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
