import React from 'react';
import { useWealth } from '../../context/WealthContext';
import { formatNaira, formatUSD, formatDate } from '../../utils/calculations';
import { Trash2, Plus, Info } from 'lucide-react';

interface SheetProps {
  onOpenAddModal: (category: 'uba_dca') => void;
}

export const UbaDcaSheet: React.FC<SheetProps> = ({ onOpenAddModal }) => {
  const { ubaDcaRecords, deleteUbaDca, settings } = useWealth();

  const totalUsd = ubaDcaRecords.reduce((acc, r) => acc + (r.amountUsd || 0), 0);
  const totalCostNaira = ubaDcaRecords.reduce((acc, r) => acc + (r.totalCostNaira || 0), 0);
  const avgRate = totalUsd > 0 ? totalCostNaira / totalUsd : 0;
  const currentUsdRate = settings.currentUsdExchangeRate || 1780.00;
  const currentPortfolioWorthNaira = totalUsd * currentUsdRate;
  const unrealizedGainNaira = currentPortfolioWorthNaira - totalCostNaira;

  return (
    <div className="space-y-6">
      {/* Exact Summary Block from Workbook Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded text-center">
          <div className="text-[11px] font-bold text-[#ba1a1a] tracking-wider uppercase">AVG RATE</div>
          <div className="text-lg font-bold font-mono text-[#1a1c1c] mt-1 tabular-nums">
            {formatNaira(avgRate)}
          </div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded text-center">
          <div className="text-[11px] font-bold text-[#ba1a1a] tracking-wider uppercase">USD TOTAL</div>
          <div className="text-lg font-bold font-mono text-[#1a1c1c] mt-1 tabular-nums">
            {formatUSD(totalUsd)}
          </div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded text-center">
          <div className="text-[11px] font-bold text-[#ba1a1a] tracking-wider uppercase">TOTAL PORTFOLIO (₦)</div>
          <div className="text-lg font-bold font-mono text-[#1a1c1c] mt-1 tabular-nums">
            {formatNaira(totalCostNaira)}
          </div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded text-center">
          <div className="text-[11px] font-bold text-[#ba1a1a] tracking-wider uppercase">CURRENT USD RATE</div>
          <div className="text-lg font-bold font-mono text-[#1a1c1c] mt-1 tabular-nums">
            {formatNaira(currentUsdRate)}
          </div>
        </div>

        <div className="bg-[#ffffff] border border-[#e3e2e1] p-4 rounded text-center col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-[#1b6b51] tracking-wider uppercase">CURRENT WORTH</div>
          <div className="text-lg font-bold font-mono text-[#1b6b51] mt-1 tabular-nums">
            {formatNaira(currentPortfolioWorthNaira)}
          </div>
          <div className="text-[10px] text-[#1b6b51] font-mono mt-0.5">
            +{formatNaira(unrealizedGainNaira)} ({((unrealizedGainNaira / (totalCostNaira || 1)) * 100).toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#ffffff] border border-[#e3e2e1] rounded overflow-hidden">
        <div className="p-4 border-b border-[#e3e2e1] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1c1c]">UBA Domiciliary Savings Ledger (DCA)</h3>
            <p className="text-xs text-[#747878]">Periodic dollar purchases deposited into UBA USD account</p>
          </div>
          <button
            onClick={() => onOpenAddModal('uba_dca')}
            className="bg-[#1a1c1c] hover:bg-[#2f3130] text-[#faf9f8] px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Purchase</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f3f2] text-[#444748] border-b border-[#e3e2e1] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">RATE / ($)</th>
                <th className="py-3 px-4">AMOUNT OF USD</th>
                <th className="py-3 px-4">TOTAL COST IN NAIRA (₦)</th>
                <th className="py-3 px-4">DESTINATION</th>
                <th className="py-3 px-4">REMARK</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed]">
              {ubaDcaRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#747878]">
                    No UBA DCA records found. Click &quot;Add Purchase&quot; to log your first transaction.
                  </td>
                </tr>
              ) : (
                ubaDcaRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-[#faf9f8] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#1a1c1c]">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#1a1c1c]">
                      {formatNaira(record.ratePerUsd)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1a1c1c]">
                      {formatUSD(record.amountUsd, true)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1a1c1c]">
                      {formatNaira(record.totalCostNaira)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-[#f4f3f2] text-[#1a1c1c] border border-[#e3e2e1]">
                        {record.destination || 'UBA'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#747878] max-w-xs truncate" title={record.remark}>
                      {record.remark || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteUbaDca(record.id)}
                        className="text-[#747878] hover:text-[#ba1a1a] p-1 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {ubaDcaRecords.length > 0 && (
              <tfoot className="bg-[#f4f3f2]/60 font-semibold border-t border-[#e3e2e1] text-xs">
                <tr>
                  <td className="py-3 px-4 font-bold">TOTAL</td>
                  <td className="py-3 px-4 font-mono">{formatNaira(avgRate)} (Avg)</td>
                  <td className="py-3 px-4 font-mono text-[#1a1c1c]">{formatUSD(totalUsd)}</td>
                  <td className="py-3 px-4 font-mono text-[#1a1c1c]">{formatNaira(totalCostNaira)}</td>
                  <td colSpan={3} className="py-3 px-4 text-right text-[#747878]">
                    Current Worth: <span className="font-mono text-[#1b6b51] font-bold">{formatNaira(currentPortfolioWorthNaira)}</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
