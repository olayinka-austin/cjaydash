import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { X, Plus, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddPassiveIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultYear?: number;
}

export const AddPassiveIncomeModal: React.FC<AddPassiveIncomeModalProps> = ({
  isOpen,
  onClose,
  defaultYear = new Date().getFullYear()
}) => {
  const { addPassiveIncomeSource, passiveIncomeMatrixRecords } = useWealth();

  const [sourceName, setSourceName] = useState('');
  const [year, setYear] = useState<number>(defaultYear);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setSourceName('');
    setNotes('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = sourceName.trim();
    if (!trimmedName) {
      setError('Source name is required.');
      return;
    }

    // Check for duplicate source in the selected year
    const isDuplicate = passiveIncomeMatrixRecords.some(
      (r) => r.year === year && r.incomeSource.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError(`A passive income source named "${trimmedName}" already exists for ${year}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await addPassiveIncomeSource(year, trimmedName, notes.trim());
      setSuccess('Passive income source added successfully.');
      setTimeout(() => {
        setIsSubmitting(false);
        handleClose();
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to add passive income source. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded-md max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e1] dark:border-[#2d3130]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b6b51]/10 text-[#1b6b51] dark:bg-[#1b6b51]/30 dark:text-[#60d3a7] border border-[#1b6b51]/20">
                PASSIVE INCOME &middot; NEW ROW
              </span>
            </div>
            <h2 className="text-base font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
              <span>Add Passive Income Source</span>
            </h2>
            <p className="text-xs text-[#747878] dark:text-[#8c9290]">
              Create a new row in your monthly matrix for Year {year}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] p-1.5 rounded hover:bg-[#f4f3f2] dark:hover:bg-[#222625] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1b6b51] dark:text-[#60d3a7]" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block">
              Source Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. Affiliate Earnings, Rental Unit B, Royalties"
              className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs text-[#1a1c1c] dark:text-[#e1e3e2] placeholder-[#747878]/60 focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
            />
            <p className="text-[10px] text-[#747878] dark:text-[#8c9290] mt-1">
              Monthly values will start at zero and remain editable in the matrix.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block">
              Target Matrix Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block">
              Description / Notes <span className="text-[#747878] lowercase">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Income generated from affiliate marketing and sponsorship retainers."
              className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs text-[#1a1c1c] dark:text-[#e1e3e2] placeholder-[#747878]/60 focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e3e2e1] dark:border-[#2d3130]">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 rounded text-xs font-semibold text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] hover:bg-[#f4f3f2] dark:hover:bg-[#222625] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !sourceName.trim()}
              className="px-4 py-2 bg-accent hover:opacity-95 text-white dark:text-[#111313] rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Adding...' : 'Add Source'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
