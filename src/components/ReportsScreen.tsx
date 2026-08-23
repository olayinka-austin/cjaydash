import React from 'react';
import { useWealth } from '../context/WealthContext';
import { formatNaira, formatUSD, CATEGORY_DETAILS } from '../utils/calculations';
import { Printer, Download, FileText, CheckCircle2, ShieldCheck, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { summary, settings } = useWealth();

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      exchangeRateUsdToNgn: settings.currentUsdExchangeRate,
      goldSpotPriceUsd: settings.currentGoldSpotPriceUsd,
      summary
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Portfolio_Audit_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between bg-[#ffffff] border border-[#e3e2e1] p-5 rounded">
        <div>
          <h1 className="text-base font-bold text-[#1a1c1c]">Portfolio Audit &amp; Performance Statement</h1>
          <p className="text-xs text-[#747878]">Consolidated financial position generated as of {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="bg-[#faf9f8] hover:bg-[#f4f3f2] text-[#1a1c1c] border border-[#e3e2e1] px-3.5 py-1.5 rounded text-xs font-semibold uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3.5 py-1.5 rounded text-xs font-semibold uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Balance Sheet Summary Table */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-4 bg-[#f4f3f2] border-b border-[#e3e2e1] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">
            Asset Class Valuation &amp; Yield Audit
          </span>
          <span className="text-xs font-mono font-semibold text-[#1a1c1c]">
            Base Currency: NGN (₦) &middot; Ref Rate: ₦{settings.currentUsdExchangeRate.toLocaleString()}/$
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f8] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ASSET CLASS</th>
                <th className="py-3 px-4">TAG</th>
                <th className="py-3 px-4">CURRENCY</th>
                <th className="py-3 px-4 font-mono">CURRENT VALUE (₦)</th>
                <th className="py-3 px-4 font-mono">WEIGHT (%)</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {summary.assetAllocation.map((item) => {
                const detail = CATEGORY_DETAILS[item.category as keyof typeof CATEGORY_DETAILS];
                return (
                  <tr key={item.category} className="hover:bg-[#faf9f8]">
                    <td className="py-3.5 px-4 font-bold text-[#1a1c1c]">{item.label}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f4f3f2] text-[#444748] border border-[#e3e2e1]">
                        {item.tag}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {detail?.currency === 'USD' ? (
                        <span className="text-[#1b6b51]">USD ($)</span>
                      ) : detail?.currency === 'DUAL' ? (
                        <span className="text-[#b45309]">USD/NGN</span>
                      ) : (
                        <span>NGN (₦)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1a1c1c] tabular-nums">
                      {formatNaira(item.valueNaira)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c]">{item.percentage}%</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#a6f2d1]/50 text-[#1b6b51]">
                        Audited &amp; Reconciled
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#f4f3f2] font-bold border-t-2 border-[#e3e2e1] text-xs">
              <tr>
                <td colSpan={3} className="py-4 px-4 font-bold text-[#1a1c1c]">TOTAL CONSOLIDATED PORTFOLIO</td>
                <td className="py-4 px-4 font-mono text-[#1a1c1c] text-sm">{formatNaira(summary.totalCurrentValueNaira)}</td>
                <td className="py-4 px-4 font-mono text-[#1a1c1c]">100.0%</td>
                <td className="py-4 px-4 text-[#1b6b51]">100% Operational</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Passive Income Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1c1c]">
            <ShieldCheck className="w-4 h-4 text-[#1b6b51]" />
            <span>Fixed Income &amp; Bond Projections</span>
          </div>
          <div className="space-y-2 text-xs text-[#444748]">
            <div className="flex justify-between py-1.5 border-b border-[#f4f3f2]">
              <span>FGN Savings Bonds Total Capital</span>
              <span className="font-mono font-semibold text-[#1a1c1c]">{formatNaira(summary.fgnTotalInvestedNaira)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#f4f3f2]">
              <span>Quarterly Coupon Cash Flow</span>
              <span className="font-mono font-bold text-[#1b6b51]">+{formatNaira(summary.fgnQuarterlyInterestNaira)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#f4f3f2]">
              <span>Annual Bond Passive Income</span>
              <span className="font-mono font-bold text-[#1b6b51]">+{formatNaira(summary.fgnQuarterlyInterestNaira * 4)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Maturities (CP + T-Bills + Locked)</span>
              <span className="font-mono font-semibold text-[#1a1c1c]">{formatNaira(summary.totalExpectedMaturityPayoutNaira)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-5 rounded space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1c1c]">
            <FileText className="w-4 h-4 text-[#1a1c1c]" />
            <span>Equities &amp; Commodities Realized Profits</span>
          </div>
          <div className="space-y-2 text-xs text-[#444748]">
            <div className="flex justify-between py-1.5 border-b border-[#f4f3f2]">
              <span>Foreign Stocks Net Realized P/L</span>
              <span className="font-mono font-bold text-[#1b6b51]">+{formatUSD(summary.foreignStockRealizedProfitUsd)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#f4f3f2]">
              <span>Nigerian Stocks Net Realized P/L</span>
              <span className="font-mono font-bold text-[#1b6b51]">+{formatNaira(summary.nigerianStockRealizedProfitNaira)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#f4f3f2]">
              <span>Physical Gold ETFs Realized P/L</span>
              <span className="font-mono font-bold text-[#1b6b51]">+{formatUSD(summary.goldEtfRealizedProfitUsd)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Total Realized Profit (USD Converted)</span>
              <span className="font-mono font-bold text-[#1b6b51]">+{formatUSD(summary.realizedProfitUsd)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
