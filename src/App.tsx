import React, { useState } from 'react';
import { WealthProvider, useWealth } from './context/WealthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewScreen } from './components/OverviewScreen';
import { PortfolioScreen } from './components/PortfolioScreen';
import { InvestmentsScreen } from './components/InvestmentsScreen';
import { IncomeScreen } from './components/IncomeScreen';
import { MaturitiesScreen } from './components/MaturitiesScreen';
import { TransactionsScreen } from './components/TransactionsScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { VaultScreen } from './components/VaultScreen';
import { ExcelImportScreen } from './components/ExcelImportScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AddInvestmentModal } from './components/modals/AddInvestmentModal';
import { ImportWorkflow } from './components/modals/ImportWorkflow';
import { SettingsModal } from './components/modals/SettingsModal';
import { InvestmentCategory } from './types';

const MainAppContent: React.FC = () => {
  const { activeScreen } = useWealth();
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [modalCategory, setModalCategory] = useState<InvestmentCategory | 'all'>('all');

  const handleOpenAddModal = (cat?: InvestmentCategory) => {
    setModalCategory(cat || 'all');
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#faf9f8] text-[#1a1c1c] overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar onOpenAddModal={() => handleOpenAddModal()} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenAddModal={() => handleOpenAddModal()}
        />

        {/* Scrollable Screen Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeScreen === 'overview' && (
              <OverviewScreen
                onOpenAddModal={() => handleOpenAddModal()}
                onOpenImportModal={() => setIsImportModalOpen(true)}
              />
            )}

            {activeScreen === 'portfolio' && (
              <PortfolioScreen />
            )}

            {activeScreen === 'investments' && (
              <InvestmentsScreen
                onOpenAddModal={(cat) => handleOpenAddModal(cat)}
              />
            )}

            {activeScreen === 'income' && (
              <IncomeScreen />
            )}

            {activeScreen === 'maturities' && (
              <MaturitiesScreen />
            )}

            {activeScreen === 'transactions' && (
              <TransactionsScreen />
            )}

            {activeScreen === 'analytics' && (
              <AnalyticsScreen />
            )}

            {activeScreen === 'reports' && (
              <ReportsScreen />
            )}

            {(activeScreen === 'documents' || activeScreen === 'vault') && (
              <VaultScreen />
            )}

            {activeScreen === 'excel_import' && (
              <ExcelImportScreen
                onOpenImportModal={() => setIsImportModalOpen(true)}
              />
            )}

            {activeScreen === 'settings' && (
              <SettingsScreen />
            )}
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <AddInvestmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCategory={modalCategory}
      />

      <ImportWorkflow
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WealthProvider>
      <MainAppContent />
    </WealthProvider>
  );
}
