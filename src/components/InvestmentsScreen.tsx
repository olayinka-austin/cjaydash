import React from 'react';
import { useWealth } from '../context/WealthContext';
import { InvestmentCategory } from '../types';
import { CATEGORY_DETAILS } from '../utils/calculations';
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
import { Layers } from 'lucide-react';

interface InvestmentsScreenProps {
  onOpenAddModal: (category?: InvestmentCategory) => void;
}

export const InvestmentsScreen: React.FC<InvestmentsScreenProps> = ({ onOpenAddModal }) => {
  const { selectedCategory, setSelectedCategory } = useWealth();

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
      <div className="bg-[#ffffff] border border-[#e3e2e1] p-3 rounded">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categoryKeys.map((catKey) => {
            const detail = CATEGORY_DETAILS[catKey];
            const isActive = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1a1c1c] text-[#faf9f8] shadow-xs'
                    : 'bg-[#faf9f8] text-[#444748] hover:bg-[#f4f3f2] border border-[#e3e2e1]'
                }`}
              >
                <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[#a6f2d1]' : 'text-[#747878]'}`}>
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
