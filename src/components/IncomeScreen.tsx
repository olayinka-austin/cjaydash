import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { formatFinancialValue } from '../utils/calculations';
import { ShieldCheck, ChevronLeft, ChevronRight, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

export const IncomeScreen: React.FC = () => {
  const { passiveIncomeMatrixRecords, savePassiveIncomeCell, addPassiveIncomeSource, deletePassiveIncomeSource, settings } = useWealth();
  const [activeYear, setActiveYear] = useState<number>(2026);
  const [newSourceName, setNewSourceName] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Editing cell state
  const [editingCell, setEditingCell] = useState<{ source: string; month: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const defaultSources = [
    'YouTube Earnings',
    'E-Book Earnings',
    'Rental Earnings',
    'Real Estate Earnings'
  ];

  // Get all sources for activeYear (default ones + any custom ones saved in Firestore)
  const yearRecords = passiveIncomeMatrixRecords.filter(r => r.year === activeYear);
  const savedSources = yearRecords.map(r => r.incomeSource);
  
  // Combine default sources with any custom sources present in Firestore for this year
  const allSources = Array.from(new Set([...defaultSources, ...savedSources]));

  const monthsList = [
    { key: 'jan', label: 'Jan' },
    { key: 'feb', label: 'Feb' },
    { key: 'mar', label: 'Mar' },
    { key: 'apr', label: 'Apr' },
    { key: 'may', label: 'May' },
    { key: 'jun', label: 'Jun' },
    { key: 'jul', label: 'Jul' },
    { key: 'aug', label: 'Aug' },
    { key: 'sep', label: 'Sep' },
    { key: 'oct', label: 'Oct' },
    { key: 'nov', label: 'Nov' },
    { key: 'dec', label: 'Dec' },
  ] as const;

  const getCellValue = (source: string, monthKey: string): number => {
    const rec = yearRecords.find(r => r.incomeSource.toLowerCase() === source.toLowerCase());
    if (!rec || !rec.months) return 0;
    return Number((rec.months as any)[monthKey]) || 0;
  };

  const getRowTotal = (source: string): number => {
    return monthsList.reduce((sum, m) => sum + getCellValue(source, m.key), 0);
  };

  // Monthly totals across all sources
  const monthlyTotals = monthsList.map(m => {
    return allSources.reduce((sum, source) => sum + getCellValue(source, m.key), 0);
  });

  const grandAnnualTotal = monthlyTotals.reduce((sum, val) => sum + val, 0);

  const handleCellClick = (source: string, monthKey: string) => {
    const val = getCellValue(source, monthKey);
    setEditingCell({ source, month: monthKey });
    setEditValue(val === 0 ? '' : val.toString());
  };

  const handleCellSave = async (source: string, monthKey: any) => {
    const num = parseFloat(editValue.replace(/,/g, '')) || 0;
    await savePassiveIncomeCell(activeYear, source, monthKey, num);
    setEditingCell(null);
    setEditValue('');
  };

  const handleAddSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    await addPassiveIncomeSource(activeYear, newSourceName.trim());
    setNewSourceName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b6b51]/10 text-[#1b6b51] dark:bg-[#1b6b51]/30 dark:text-[#60d3a7] border border-[#1b6b51]/20">
              PASSIVE INCOME &middot; ANNUAL MATRIX
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2] mt-1.5 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1b6b51] dark:text-[#60d3a7]" />
            <span>Passive Income Monthly Matrix ({activeYear})</span>
          </h1>
          <p className="text-xs sm:text-[13px] text-[#747878] dark:text-[#8c9290] mt-1">
            Track and edit monthly earnings across YouTube, E-Books, Rental, Real Estate, and custom passive streams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-accent hover:opacity-95 text-white dark:text-[#111313] text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Income Source</span>
          </button>

          <div className="flex items-center gap-2 bg-[#f4f3f2] dark:bg-[#222625] p-1 rounded border border-[#e3e2e1] dark:border-[#2d3130]">
            <button
              onClick={() => setActiveYear(Math.max(2024, activeYear - 1))}
              className="p-1.5 hover:bg-[#ffffff] dark:hover:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2] rounded transition-colors cursor-pointer"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono font-bold text-xs text-[#1a1c1c] dark:text-[#e1e3e2]">YEAR {activeYear}</span>
            <button
              onClick={() => setActiveYear(Math.min(2035, activeYear + 1))}
              className="p-1.5 hover:bg-[#ffffff] dark:hover:bg-[#191c1b] text-[#1a1c1c] dark:text-[#e1e3e2] rounded transition-colors cursor-pointer"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">ANNUAL PASSIVE INCOME ({activeYear})</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1b6b51] dark:text-[#60d3a7] mt-1">{formatFinancialValue(grandAnnualTotal, settings)}</div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">Combined annual yield across all sources</div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">ACTIVE INCOME SOURCES</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1a1c1c] dark:text-[#e1e3e2] mt-1">{allSources.length} Sources</div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">Monitored streams</div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-5 rounded transition-colors">
          <div className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">AVERAGE MONTHLY YIELD</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#b45309] dark:text-[#fbbf24] mt-1">
            {formatFinancialValue(grandAnnualTotal / 12, settings, { showDecimals: false })}
          </div>
          <div className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">Monthly run-rate average</div>
        </div>
      </div>

      {/* Main Annual Matrix Table */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded overflow-hidden shadow-sm transition-colors">
        <div className="p-4 bg-[#f4f3f2] dark:bg-[#222625] border-b border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c] dark:text-[#e1e3e2]">
              Annual Monthly Income Matrix ({activeYear})
            </h3>
            <p className="text-[11px] text-[#747878] dark:text-[#8c9290] mt-0.5">
              Click any monthly cell to edit values instantly. Row totals and monthly totals calculate automatically.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded text-[#1a1c1c] dark:text-[#e1e3e2]">
            {allSources.length} Streams Mapped
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#faf9f8] dark:bg-[#191c1b] text-[#444748] dark:text-[#c2c7c5] border-b border-[#e3e2e1] dark:border-[#2d3130] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sticky left-0 bg-[#faf9f8] dark:bg-[#191c1b] z-10 border-r border-[#e3e2e1] dark:border-[#2d3130]">
                  Income Source
                </th>
                {monthsList.map(m => (
                  <th key={m.key} className="py-3.5 px-3 font-mono text-right">
                    {m.label}
                  </th>
                ))}
                <th className="py-3.5 px-4 font-mono text-right bg-[#f4f3f2]/50 dark:bg-[#222625]/50 border-l border-[#e3e2e1] dark:border-[#2d3130]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeed] dark:divide-[#2d3130]">
              {allSources.map((source) => {
                const rowTotal = getRowTotal(source);
                const rec = yearRecords.find(r => r.incomeSource.toLowerCase() === source.toLowerCase());
                return (
                  <tr key={source} className="hover:bg-[#faf9f8] dark:hover:bg-[#222625] transition-colors group">
                    <td className="py-3 px-4 font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] sticky left-0 bg-[#ffffff] dark:bg-[#191c1b] group-hover:bg-[#faf9f8] dark:group-hover:bg-[#222625] z-10 border-r border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-between gap-2">
                      <span className="truncate max-w-[180px]" title={source}>{source}</span>
                      {rec && !defaultSources.includes(source) && (
                        <button
                          onClick={() => deletePassiveIncomeSource(rec.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 dark:hover:text-red-400 transition-opacity cursor-pointer"
                          title="Delete Source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>

                    {monthsList.map(m => {
                      const val = getCellValue(source, m.key);
                      const isEditing = editingCell?.source === source && editingCell?.month === m.key;

                      return (
                        <td key={m.key} className="py-2.5 px-3 font-mono text-right">
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-end">
                              <input
                                autoFocus
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellSave(source, m.key);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-24 px-2 py-1 text-xs font-mono bg-white dark:bg-[#222625] border border-accent rounded text-right text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none shadow-sm"
                              />
                              <button
                                onClick={() => handleCellSave(source, m.key)}
                                className="p-1 bg-accent text-white dark:text-[#111313] rounded hover:opacity-90 cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleCellClick(source, m.key)}
                              className="cursor-pointer py-1 px-1.5 rounded hover:bg-[#f4f3f2] dark:hover:bg-[#2c302f] transition-colors text-[#1a1c1c] dark:text-[#e1e3e2] flex items-center justify-end gap-1 group/cell"
                              title="Click to edit value"
                            >
                              <span className={val > 0 ? 'font-medium text-[#1b6b51] dark:text-[#60d3a7]' : 'text-[#747878] dark:text-[#8c9290]'}>
                                {val > 0 ? formatFinancialValue(val, settings, { showDecimals: false }) : '—'}
                              </span>
                              <Edit3 className="w-3 h-3 opacity-0 group-hover/cell:opacity-50 text-[#747878]" />
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 font-mono font-bold text-[#1b6b51] dark:text-[#60d3a7] text-right bg-[#f4f3f2]/30 dark:bg-[#222625]/30 border-l border-[#e3e2e1] dark:border-[#2d3130]">
                      {rowTotal > 0 ? formatFinancialValue(rowTotal, settings, { showDecimals: false }) : '₦0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Passive Income Row */}
            <tfoot className="bg-[#faf9f8] dark:bg-[#222625] border-t-2 border-[#e3e2e1] dark:border-[#2d3130] font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
              <tr>
                <td className="py-4 px-4 sticky left-0 bg-[#faf9f8] dark:bg-[#222625] z-10 border-r border-[#e3e2e1] dark:border-[#2d3130] uppercase tracking-wider text-xs">
                  Total Passive Income
                </td>
                {monthlyTotals.map((mTotal, idx) => (
                  <td key={monthsList[idx].key} className="py-4 px-3 font-mono text-right text-xs text-[#1b6b51] dark:text-[#60d3a7]">
                    {mTotal > 0 ? formatFinancialValue(mTotal, settings, { showDecimals: false }) : '₦0'}
                  </td>
                ))}
                <td className="py-4 px-4 font-mono font-extrabold text-sm text-[#1b6b51] dark:text-[#60d3a7] text-right bg-[#1b6b51]/10 dark:bg-[#1b6b51]/20 border-l border-[#e3e2e1] dark:border-[#2d3130]">
                  {grandAnnualTotal > 0 ? formatFinancialValue(grandAnnualTotal, settings, { showDecimals: false }) : '₦0'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded-lg max-md:w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f4f3f2] dark:border-[#222625]">
              <h3 className="text-base font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">Add New Passive Income Source</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-[#f4f3f2] dark:hover:bg-[#222625] rounded text-[#747878] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSourceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider mb-1">
                  Income Source Name ({activeYear})
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Affiliate Marketing, Digital Products, Dividends"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1b6b51]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#e3e2e1] dark:border-[#2d3130] text-xs font-semibold rounded text-[#1a1c1c] dark:text-[#e1e3e2] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent hover:opacity-95 text-white dark:text-[#111313] text-xs font-semibold rounded transition-colors cursor-pointer shadow-sm"
                >
                  Create Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
