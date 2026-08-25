import React from 'react';
import { useWealth } from '../context/WealthContext';
import { InvestmentCategory } from '../types';
import { CATEGORY_DETAILS, formatNaira, formatUSD } from '../utils/calculations';
import { UbaDcaSheet } from './sheets/UbaDcaSheet';
import { ForeignStocksSheet } from './sheets/ForeignStocksSheet';
import { NigerianStocksSheet } from './sheets/NigerianStocksSheet';
import { EbookDcaSheet } from './sheets/EbookDcaSheet';
import { CommercialPapersSheet } from './sheets/CommercialPapersSheet';
import { TreasuryBillsSheet } from './sheets/TreasuryBillsSheet';
import { MutualFundsSheet } from './sheets/MutualFundsSheet';
import { FgnBondsSheet } from './sheets/FgnBondsSheet';
import { GoldEtfSheet } from './sheets/GoldEtfSheet';
import { LockedSavingsSheet } from './sheets/LockedSavingsSheet';
import { Layers, ArrowUpRight, PlusCircle } from 'lucide-react';

interface InvestmentsScreenProps {
  onOpenAddModal: (category?: InvestmentCategory) => void;
}

export const InvestmentsScreen: React.FC<InvestmentsScreenProps> = ({ onOpenAddModal }) => {
  const { selectedCategory, setSelectedCategory, summary } = useWealth();

  const categoryKeys: InvestmentCategory[] = [
    'uba_dca',
    'foreign_stocks',
    'nigerian_stocks',
    'ebook_dca',
    'commercial_papers',
    'treasury_bills',
    'mutual_funds',
    'fgn_bonds',
    'gold_etfs',
    'locked_savings'
  ];

  return (
    <div className="space-y-6">
      {/* Category Pills Header Bar */}
      <div className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-3 rounded transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-accent text-white dark:text-[#111313] shadow-xs'
                : 'bg-[#faf9f8] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] hover:bg-[#f4f3f2] dark:hover:bg-[#282c2b] border border-[#e3e2e1] dark:border-[#2d3130]'
            }`}
          >
            <span className={`text-[10px] font-mono font-bold ${selectedCategory === 'all' ? 'text-white/80 dark:text-[#111313]/80' : 'text-[#747878] dark:text-[#8c9290]'}`}>
              ALL
            </span>
            <span>All 10 Categories</span>
          </button>

          {categoryKeys.map((catKey) => {
            const detail = CATEGORY_DETAILS[catKey];
            const isActive = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-accent text-white dark:text-[#111313] shadow-xs'
                    : 'bg-[#faf9f8] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] hover:bg-[#f4f3f2] dark:hover:bg-[#282c2b] border border-[#e3e2e1] dark:border-[#2d3130]'
                }`}
              >
                <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-white/80 dark:text-[#111313]/80' : 'text-[#747878] dark:text-[#8c9290]'}`}>
                  {detail.tag}
                </span>
                <span>{detail.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Category View Container */}
      <div>
        {selectedCategory === 'all' && (
          <div className="space-y-6">
            {/* All Investments Overview Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 rounded transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-accent" />
                  <h1 className="text-xl font-bold tracking-tight text-[#1a1c1c] dark:text-[#e1e3e2]">The 10 Investment Classes</h1>
                </div>
                <p className="text-xs text-[#747878] dark:text-[#8c9290] mt-1">
                  Select any investment category below to open its dedicated spreadsheet ledger, lot tracking, and formulas
                </p>
              </div>

              <button
                onClick={() => onOpenAddModal()}
                className="bg-accent hover:opacity-95 text-white dark:text-[#111313] px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Record</span>
              </button>
            </div>

            {/* 10 Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {summary.assetAllocation.map((cat) => {
                const detail = CATEGORY_DETAILS[cat.category as InvestmentCategory];
                return (
                  <div
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category as InvestmentCategory)}
                    className="bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] hover:border-accent dark:hover:border-accent p-4 rounded cursor-pointer transition-all duration-150 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f4f3f2] dark:bg-[#222625] text-[#444748] dark:text-[#c2c7c5] border border-[#e3e2e1] dark:border-[#2d3130] group-hover:border-accent">
                          {cat.tag}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#747878] dark:text-[#8c9290] group-hover:text-accent">
                          {cat.percentage}%
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-[#1a1c1c] dark:text-[#e1e3e2] mt-2 group-hover:text-accent transition-colors line-clamp-2">
                        {cat.label}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f4f3f2] dark:border-[#222625] flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] tabular-nums">
                        {formatNaira(cat.valueNaira, false)}
                      </span>
                      <span className="text-xs font-semibold text-[#1a1c1c] dark:text-[#e1e3e2] group-hover:text-accent group-hover:underline flex items-center gap-0.5">
                        <span>Open</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedCategory === 'uba_dca' && (
          <UbaDcaSheet onOpenAddModal={() => onOpenAddModal('uba_dca')} />
        )}
        {selectedCategory === 'foreign_stocks' && (
          <ForeignStocksSheet onOpenAddModal={() => onOpenAddModal('foreign_stocks')} />
        )}
        {selectedCategory === 'nigerian_stocks' && (
          <NigerianStocksSheet onOpenAddModal={() => onOpenAddModal('nigerian_stocks')} />
        )}
        {selectedCategory === 'ebook_dca' && (
          <EbookDcaSheet onOpenAddModal={() => onOpenAddModal('ebook_dca')} />
        )}
        {selectedCategory === 'commercial_papers' && (
          <CommercialPapersSheet onOpenAddModal={() => onOpenAddModal('commercial_papers')} />
        )}
        {selectedCategory === 'treasury_bills' && (
          <TreasuryBillsSheet onOpenAddModal={() => onOpenAddModal('treasury_bills')} />
        )}
        {selectedCategory === 'mutual_funds' && (
          <MutualFundsSheet onOpenAddModal={() => onOpenAddModal('mutual_funds')} />
        )}
        {selectedCategory === 'fgn_bonds' && (
          <FgnBondsSheet onOpenAddModal={() => onOpenAddModal('fgn_bonds')} />
        )}
        {selectedCategory === 'gold_etfs' && (
          <GoldEtfSheet onOpenAddModal={() => onOpenAddModal('gold_etfs')} />
        )}
        {selectedCategory === 'locked_savings' && (
          <LockedSavingsSheet onOpenAddModal={() => onOpenAddModal('locked_savings')} />
        )}
      </div>
    </div>
  );
};
