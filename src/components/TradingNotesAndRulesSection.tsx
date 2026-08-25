import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Edit2,
  Plus,
  Trash2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Save,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useWealth } from '../context/WealthContext';
import { TradingRuleItem } from '../types';

interface TradingNotesAndRulesSectionProps {
  moduleId: string;
  defaultTitle?: string;
  accentColor?: string;
  badgeLabel?: string;
  className?: string;
}

export const TradingNotesAndRulesSection: React.FC<TradingNotesAndRulesSectionProps> = ({
  moduleId,
  defaultTitle = 'Trading Notes & Rules',
  accentColor = '#1b6b51',
  badgeLabel,
  className = ''
}) => {
  const { getModuleTradingRules, saveModuleTradingRules, resetModuleTradingRules } = useWealth();

  const moduleData = getModuleTradingRules(moduleId);
  const activeTitle = moduleData?.title || defaultTitle;
  const activeRules: TradingRuleItem[] = moduleData?.rules || [];

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(activeTitle);
  const [draftRules, setDraftRules] = useState<TradingRuleItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync draft state when entering edit mode or when moduleData changes while not editing
  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(activeTitle);
      setDraftRules(activeRules.map(r => ({ ...r })));
      setErrorMessage(null);
      setDeletingRuleId(null);
      setShowResetConfirm(false);
    }
  }, [isEditing, activeTitle, activeRules]);

  const handleStartEdit = () => {
    setDraftTitle(activeTitle);
    setDraftRules(
      activeRules.length > 0
        ? activeRules.map(r => ({ ...r }))
        : [
            {
              id: `rule-${Date.now()}-1`,
              title: '',
              description: '',
              order: 1
            }
          ]
    );
    setErrorMessage(null);
    setDeletingRuleId(null);
    setShowResetConfirm(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftTitle(activeTitle);
    setDraftRules(activeRules.map(r => ({ ...r })));
    setErrorMessage(null);
    setDeletingRuleId(null);
    setShowResetConfirm(false);
    setIsEditing(false);
  };

  const handleAddRule = () => {
    const newRule: TradingRuleItem = {
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      description: '',
      order: draftRules.length + 1
    };
    setDraftRules(prev => [...prev, newRule]);
  };

  const handleUpdateRule = (id: string, field: 'title' | 'description', value: string) => {
    setDraftRules(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= draftRules.length) return;

    const copy = [...draftRules];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // reassign order numbers
    const updated = copy.map((r, i) => ({ ...r, order: i + 1 }));
    setDraftRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    setDraftRules(prev => {
      const filtered = prev.filter(r => r.id !== id);
      return filtered.map((r, i) => ({ ...r, order: i + 1 }));
    });
    setDeletingRuleId(null);
  };

  const handleSaveChanges = async () => {
    // Validate rules
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      setErrorMessage('Please provide a title for the trading rules section.');
      return;
    }

    // Filter out completely blank empty rules
    const cleanedRules = draftRules
      .map(r => ({
        ...r,
        title: r.title.trim(),
        description: r.description.trim()
      }))
      .filter(r => r.title.length > 0 || r.description.length > 0);

    if (cleanedRules.length === 0) {
      setErrorMessage('Please add at least one rule with a title or description, or click Cancel.');
      return;
    }

    // Check for any rule with blank title
    const hasMissingTitle = cleanedRules.some(r => !r.title);
    if (hasMissingTitle) {
      setErrorMessage('All rules must have a Rule Title before saving.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await saveModuleTradingRules(moduleId, trimmedTitle, cleanedRules);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to save trading rules:', err);
      setErrorMessage(err.message || 'Failed to save changes to Firestore. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await resetModuleTradingRules(moduleId);
      setShowResetConfirm(false);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to reset rules:', err);
      setErrorMessage(err.message || 'Failed to reset rules to default.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded p-5 sm:p-6 transition-colors shadow-xs ${className}`}
    >
      {/* VIEW MODE */}
      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e3e2e1] dark:border-[#2d3130]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1a1c1c] dark:text-[#e1e3e2] tracking-tight">
                {activeTitle}
              </h3>
              {badgeLabel && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-[#faf9f8] dark:bg-[#222625] text-[#747878] dark:text-[#8c9290] border border-[#e3e2e1] dark:border-[#2d3130]">
                  {badgeLabel}
                </span>
              )}
            </div>

            <button
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] hover:bg-[#f4f3f2] dark:hover:bg-[#2c302f] hover:border-[#1a1c1c] dark:hover:border-[#e1e3e2] transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>Edit Rules</span>
            </button>
          </div>

          {activeRules.length === 0 ? (
            <div className="p-8 text-center bg-[#faf9f8] dark:bg-[#222625] border border-dashed border-[#e3e2e1] dark:border-[#2d3130] rounded space-y-3">
              <p className="text-xs text-[#747878] dark:text-[#8c9290]">
                No trading rules or guidelines configured for this module yet.
              </p>
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-[#1a1c1c] dark:bg-[#e1e3e2] text-[#faf9f8] dark:text-[#111313] hover:bg-[#2f3130] dark:hover:bg-[#ffffff] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Rule</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#444748] dark:text-[#c2c7c5] leading-relaxed">
              {activeRules.map((rule, idx) => (
                <div
                  key={rule.id || `rule-${idx}`}
                  className="p-4 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded space-y-1.5 transition-all hover:border-[#cfcecd] dark:hover:border-[#3a3f3e]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[#1a1c1c] dark:text-[#e1e3e2] flex items-center gap-1.5">
                      <span style={{ color: accentColor }}>&bull;</span>
                      <span>{rule.title}</span>
                    </p>
                    <span className="text-[10px] font-mono text-[#747878] dark:text-[#8c9290] shrink-0">
                      #{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-[#444748] dark:text-[#c2c7c5] whitespace-pre-wrap">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* EDIT MODE */
        <div className="space-y-5">
          {/* Edit Mode Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e3e2e1] dark:border-[#2d3130]">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                <Edit2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1c] dark:text-[#e1e3e2]">
                  Editing Trading Notes &amp; Rules
                </h3>
                <p className="text-[11px] text-[#747878] dark:text-[#8c9290]">
                  Edit rule titles, update descriptions, add new items, or reorder guidance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                title="Reset to default module template"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold text-[#747878] dark:text-[#8c9290] hover:text-[#ba1a1a] dark:hover:text-[#ff897d] hover:bg-[#faf9f8] dark:hover:bg-[#222625] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>

          {/* Reset Confirmation Modal/Alert */}
          {showResetConfirm && (
            <div className="p-3.5 bg-[#ffdad6] dark:bg-[#93000a]/20 border border-[#ba1a1a]/30 rounded text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#410002] dark:text-[#ffdad6]">
                <AlertTriangle className="w-4 h-4 text-[#ba1a1a] shrink-0" />
                <span>Reset all rules for this module back to the original standard template?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 rounded text-xs font-semibold bg-[#ffffff] dark:bg-[#222625] text-[#1a1c1c] dark:text-[#e1e3e2] border border-[#e3e2e1] dark:border-[#2d3130] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={isSaving}
                  className="px-3 py-1 rounded text-xs font-semibold bg-[#ba1a1a] text-[#ffffff] hover:bg-[#93000a] transition-colors cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}

          {/* Error banner */}
          {errorMessage && (
            <div className="p-3 bg-[#ffdad6] dark:bg-[#93000a]/30 border border-[#ba1a1a]/40 rounded text-xs text-[#410002] dark:text-[#ffdad6] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#ba1a1a] shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[#ba1a1a] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Module Title Input */}
          <div>
            <label className="text-[11px] font-bold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              placeholder="e.g. Official Foreign Stock Trading Rules & Lot Discipline"
              className="w-full bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3.5 py-2 text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
            />
          </div>

          {/* Rules List (Editable Cards) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider">
                Rules &amp; Guidelines ({draftRules.length})
              </span>
              <button
                type="button"
                onClick={handleAddRule}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider text-[#1a1c1c] dark:text-[#e1e3e2] bg-[#f4f3f2] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] hover:bg-[#e3e2e1] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>

            {draftRules.length === 0 ? (
              <div className="p-6 text-center bg-[#faf9f8] dark:bg-[#222625] border border-dashed border-[#e3e2e1] dark:border-[#2d3130] rounded">
                <p className="text-xs text-[#747878] dark:text-[#8c9290] mb-2">
                  No rules in this list. Click below to add a new rule.
                </p>
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#1a1c1c] dark:bg-[#e1e3e2] text-[#faf9f8] dark:text-[#111313] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {draftRules.map((rule, idx) => (
                  <div
                    key={rule.id || `draft-${idx}`}
                    className="p-4 bg-[#faf9f8] dark:bg-[#222625] border border-[#e3e2e1] dark:border-[#2d3130] rounded space-y-3 relative group"
                  >
                    {/* Top control bar for rule */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#e3e2e1]/60 dark:border-[#2d3130]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#1a1c1c] dark:bg-[#e1e3e2] text-[#faf9f8] dark:text-[#111313] text-[10px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-[#747878] dark:text-[#8c9290]">
                          Rule #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMoveRule(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1 rounded text-[#747878] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveRule(idx, 'down')}
                          disabled={idx === draftRules.length - 1}
                          title="Move Down"
                          className="p-1 rounded text-[#747878] hover:text-[#1a1c1c] dark:hover:text-[#e1e3e2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        {/* Delete with confirmation */}
                        {deletingRuleId === rule.id ? (
                          <div className="flex items-center gap-1.5 bg-[#ffdad6] dark:bg-[#93000a]/40 px-2 py-0.5 rounded border border-[#ba1a1a]/30">
                            <span className="text-[10px] font-semibold text-[#410002] dark:text-[#ffdad6]">
                              Delete?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-[10px] font-bold text-[#ba1a1a] hover:underline cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingRuleId(null)}
                              className="text-[10px] text-[#747878] hover:text-[#1a1c1c] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingRuleId(rule.id)}
                            title="Delete this rule"
                            className="p-1 rounded text-[#747878] hover:text-[#ba1a1a] dark:hover:text-[#ff897d] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Rule Title Field */}
                    <div>
                      <label className="text-[10px] font-bold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block mb-1">
                        Rule Title
                      </label>
                      <input
                        type="text"
                        value={rule.title}
                        onChange={e => handleUpdateRule(rule.id, 'title', e.target.value)}
                        placeholder="e.g. Trading Wallet Buffer"
                        className="w-full bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-1.5 text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2]"
                      />
                    </div>

                    {/* Rule Description Field */}
                    <div>
                      <label className="text-[10px] font-bold text-[#747878] dark:text-[#8c9290] uppercase tracking-wider block mb-1">
                        Rule Description
                      </label>
                      <textarea
                        rows={2}
                        value={rule.description}
                        onChange={e => handleUpdateRule(rule.id, 'description', e.target.value)}
                        placeholder="e.g. Have at least $500 in USD Trading Wallet at all times in case of sudden buy opportunities."
                        className="w-full bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] rounded px-3 py-2 text-xs text-[#444748] dark:text-[#c2c7c5] focus:outline-none focus:border-[#1a1c1c] dark:focus:border-[#e1e3e2] leading-relaxed resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Rule Button at bottom of list */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleAddRule}
              className="w-full py-2.5 border border-dashed border-[#e3e2e1] dark:border-[#2d3130] hover:border-[#1a1c1c] dark:hover:border-[#e1e3e2] rounded text-xs font-semibold text-[#444748] dark:text-[#c2c7c5] hover:bg-[#faf9f8] dark:hover:bg-[#222625] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Rule</span>
            </button>
          </div>

          {/* Edit Mode Actions (Save / Cancel) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e3e2e1] dark:border-[#2d3130]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#747878] dark:text-[#8c9290]">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Changes will be saved to your private dashboard in Firestore.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 rounded text-xs font-semibold text-[#444748] dark:text-[#c2c7c5] hover:bg-[#faf9f8] dark:hover:bg-[#222625] border border-transparent hover:border-[#e3e2e1] dark:hover:border-[#2d3130] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-[#1a1c1c] hover:bg-[#2f3130] dark:bg-[#e1e3e2] dark:hover:bg-[#ffffff] text-[#faf9f8] dark:text-[#111313] px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
