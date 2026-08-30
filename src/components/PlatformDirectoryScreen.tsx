import React, { useState } from 'react';
import { useWealth } from '../context/WealthContext';
import { InvestmentPlatformRecord } from '../types';
import { AddEditPlatformModal } from './modals/AddEditPlatformModal';
import { Landmark, Plus, ExternalLink, Edit2, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PlatformDirectoryScreen: React.FC = () => {
  const { platformDirectoryRecords, deleteInvestmentPlatform } = useWealth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InvestmentPlatformRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: InvestmentPlatformRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvestmentPlatform(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete platform:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Screen Header Banner */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-4 sm:p-6 rounded-lg shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b6b51]/10 text-[#1b6b51] dark:bg-[#1b6b51]/30 dark:text-[#60d3a7] border border-[#1b6b51]/20">
              REFERENCE DIRECTORY
            </span>
            <span className="text-xs text-[#747878] dark:text-[#8c9290] font-mono">
              {platformDirectoryRecords.length} Institutions Registered
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2] mt-1 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-accent" />
            <span>Investment Platform Directory</span>
          </h1>
          <p className="text-xs text-[#747878] dark:text-[#8c9290] mt-1 max-w-2xl">
            Reference directory for investment platforms, institutions, interest rates, and tenures. Completely separate from portfolio transaction calculations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-accent hover:opacity-95 text-white dark:text-[#111313] px-4 py-2.5 rounded text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Investment Platform</span>
        </button>
      </div>

      {/* Directory Table / Content */}
      <div className="bg-white dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded-lg shadow-xs overflow-hidden">
        {platformDirectoryRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f4f3f2] dark:bg-[#222625] flex items-center justify-center mx-auto text-[#747878] dark:text-[#8c9290]">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">No investment platforms added yet.</h3>
            <p className="text-xs text-[#747878] dark:text-[#8c9290] max-w-sm mx-auto">
              Maintain a clean reference catalog of financial institutions, rates, and tenures.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-accent text-white dark:text-[#111313] rounded text-xs font-semibold tracking-wider uppercase hover:opacity-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Investment Platform</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#faf9f8] dark:bg-[#222625] border-b border-[#e3e2e1] dark:border-[#2d3130] text-[#747878] dark:text-[#8c9290] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Investment Platform / Institution</th>
                  <th className="py-3 px-4">Interest Rate (%)</th>
                  <th className="py-3 px-4">Tenure</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e2e1] dark:divide-[#2d3130]">
                {platformDirectoryRecords.map((item) => {
                  const hasValidUrl = item.websiteUrl && (item.websiteUrl.startsWith('http://') || item.websiteUrl.startsWith('https://'));
                  return (
                    <tr key={item.id} className="hover:bg-[#faf9f8]/60 dark:hover:bg-[#222625]/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#1a1c1c] dark:text-[#e1e3e2]">
                        <div className="flex flex-col">
                          {hasValidUrl ? (
                            <a
                              href={item.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline inline-flex items-center gap-1 font-semibold group cursor-pointer"
                              title={`Open ${item.platformName} website`}
                            >
                              <span>{item.platformName}</span>
                              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ) : (
                            <span className="font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">{item.platformName}</span>
                          )}
                          {hasValidUrl && (
                            <span className="text-[10px] text-[#747878] dark:text-[#8c9290] font-mono truncate max-w-xs">
                              {item.websiteUrl}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1b6b51] dark:text-[#60d3a7]">
                        {item.interestRate != null ? `${item.interestRate}%` : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#444748] dark:text-[#c2c7c5]">
                        {item.tenureValue} {item.tenureUnit}
                      </td>
                      <td className="py-3.5 px-4 text-[#747878] dark:text-[#8c9290] max-w-xs truncate">
                        {item.remarks || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded hover:bg-[#f4f3f2] dark:hover:bg-[#2d3130] text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] transition-colors cursor-pointer"
                            title="Edit Platform"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-[#747878] hover:text-red-600 dark:text-[#8c9290] dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Platform"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AddEditPlatformModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editRecord={editingRecord}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded-md max-w-sm w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-semibold text-[#1a1c1c] dark:text-[#e1e3e2]">Delete Platform?</h3>
            </div>
            <p className="text-xs text-[#747878] dark:text-[#8c9290]">
              Are you sure you want to remove this investment platform from your reference directory? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e3e2e1] dark:border-[#2d3130]">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 bg-[#f4f3f2] hover:bg-[#e3e2e1] dark:bg-[#222625] dark:hover:bg-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] text-xs font-semibold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
