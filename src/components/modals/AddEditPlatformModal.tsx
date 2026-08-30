import React, { useState, useEffect } from 'react';
import { useWealth } from '../../context/WealthContext';
import { InvestmentPlatformRecord } from '../../types';
import { X, Landmark, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddEditPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRecord?: InvestmentPlatformRecord | null;
}

export const AddEditPlatformModal: React.FC<AddEditPlatformModalProps> = ({
  isOpen,
  onClose,
  editRecord
}) => {
  const { addInvestmentPlatform, updateInvestmentPlatform } = useWealth();

  const [platformName, setPlatformName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [tenureValue, setTenureValue] = useState<string>('30');
  const [tenureUnit, setTenureUnit] = useState<'Days' | 'Months' | 'Years'>('Days');
  const [remarks, setRemarks] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editRecord) {
      setPlatformName(editRecord.platformName || '');
      setWebsiteUrl(editRecord.websiteUrl || '');
      setInterestRate(editRecord.interestRate ? String(editRecord.interestRate) : '');
      setTenureValue(editRecord.tenureValue ? String(editRecord.tenureValue) : '30');
      setTenureUnit(editRecord.tenureUnit || 'Days');
      setRemarks(editRecord.remarks || '');
    } else {
      setPlatformName('');
      setWebsiteUrl('');
      setInterestRate('');
      setTenureValue('30');
      setTenureUnit('Days');
      setRemarks('');
    }
    setError(null);
    setSuccess(null);
  }, [editRecord, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = platformName.trim();
    if (!trimmedName) {
      setError('Platform / Institution name is required.');
      return;
    }

    const rateNum = parseFloat(interestRate);
    if (isNaN(rateNum) || rateNum < 0) {
      setError('Please enter a valid interest rate percentage.');
      return;
    }

    const tenureNum = parseFloat(tenureValue);
    if (isNaN(tenureNum) || tenureNum <= 0) {
      setError('Please enter a valid tenure number.');
      return;
    }

    let cleanedUrl = websiteUrl.trim();
    if (cleanedUrl && !cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      cleanedUrl = 'https://' + cleanedUrl;
    }

    try {
      setIsSubmitting(true);
      if (editRecord) {
        await updateInvestmentPlatform(editRecord.id, {
          platformName: trimmedName,
          websiteUrl: cleanedUrl,
          interestRate: rateNum,
          tenureValue: tenureNum,
          tenureUnit,
          remarks: remarks.trim()
        });
        setSuccess('Investment platform updated successfully.');
      } else {
        await addInvestmentPlatform({
          platformName: trimmedName,
          websiteUrl: cleanedUrl,
          interestRate: rateNum,
          tenureValue: tenureNum,
          tenureUnit,
          remarks: remarks.trim()
        });
        setSuccess('Investment platform added successfully.');
      }

      setTimeout(() => {
        setIsSubmitting(false);
        handleClose();
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to save investment platform. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded-md max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4 my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e1] dark:border-[#2d3130]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b6b51]/10 text-[#1b6b51] dark:bg-[#1b6b51]/30 dark:text-[#60d3a7] border border-[#1b6b51]/20">
                DIRECTORY &middot; {editRecord ? 'EDIT RECORD' : 'NEW PLATFORM'}
              </span>
            </div>
            <h2 className="text-base font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] mt-1 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-[#1b6b51] dark:text-[#60d3a7]" />
              <span>{editRecord ? 'Edit Investment Platform' : 'Add Investment Platform'}</span>
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[#747878] hover:text-[#1a1c1c] dark:text-[#8c9290] dark:hover:text-[#e1e3e2] p-1.5 rounded hover:bg-[#f4f3f2] dark:hover:bg-[#222625] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block">
              Investment Platform / Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="e.g. Afrinvest, Cowrywise, FBN Quest"
              className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs text-[#1a1c1c] dark:text-[#e1e3e2] placeholder-[#747878]/60 focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block">
              Website URL (Optional)
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="e.g. https://example.com"
              className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs font-mono text-[#1a1c1c] dark:text-[#e1e3e2] placeholder-[#747878]/60 focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block">
                Interest Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g. 15.50"
                className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs font-mono text-[#1a1c1c] dark:text-[#e1e3e2] placeholder-[#747878]/60 focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block">
                  Tenure Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={tenureValue}
                  onChange={(e) => setTenureValue(e.target.value)}
                  placeholder="30"
                  className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs font-mono text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block">
                  Tenure Unit
                </label>
                <select
                  value={tenureUnit}
                  onChange={(e) => setTenureUnit(e.target.value as any)}
                  className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-2 py-2 text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
                >
                  <option value="Days">Days</option>
                  <option value="Months">Months</option>
                  <option value="Years">Years</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block">
              Remarks
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Minimum investment ₦50,000, rate subject to change..."
              className="w-full mt-1 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs text-[#1a1c1c] dark:text-[#e1e3e2] placeholder-[#747878]/60 focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
            />
          </div>

          <div className="pt-3 border-t border-[#e3e2e1] dark:border-[#2d3130] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#f4f3f2] hover:bg-[#e3e2e1] dark:bg-[#222625] dark:hover:bg-[#2d3130] text-[#1a1c1c] dark:text-[#e1e3e2] rounded font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-accent text-white dark:text-[#111313] hover:opacity-95 rounded font-semibold transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : (editRecord ? 'Save Changes' : 'Save Platform')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
