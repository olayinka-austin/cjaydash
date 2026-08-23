import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WealthProvider, useWealth } from './context/WealthContext';
import { AuthScreen } from './components/AuthScreen';
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
import { ShieldCheck, Database, RefreshCw } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { 
    activeScreen, 
    isDataLoading, 
    syncStatus, 
    syncError, 
    seedInitialWorkbookToUserFirestore,
    ubaDcaRecords,
    foreignStockBuys,
    nigerianStockBuys,
    commercialPaperRecords
  } = useWealth();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [modalCategory, setModalCategory] = useState<InvestmentCategory | 'all'>('all');

  const handleOpenAddModal = (cat?: InvestmentCategory) => {
    setModalCategory(cat || 'all');
    setIsAddModalOpen(true);
  };

  // Check if ledger is newly created / empty
  const totalEntries = 
    ubaDcaRecords.length + 
    foreignStockBuys.length + 
    nigerianStockBuys.length + 
    commercialPaperRecords.length;

  if (isDataLoading) {
    return (
      <div className="flex h-screen bg-[#faf9f8] items-center justify-center text-[#1a1c1c]">
        <div className="flex flex-col items-center gap-3 bg-[#ffffff] border border-[#e3e2e1] p-8 rounded shadow-xs max-w-sm text-center">
          <div className="w-10 h-10 rounded-full bg-[#1a1c1c] text-[#faf9f8] flex items-center justify-center font-bold text-sm">
            II
          </div>
          <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase text-[#1a1c1c]">
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#1a1c1c] border-t-transparent"></span>
            <span>Synchronizing Firestore Ledger...</span>
          </div>
          <p className="text-[11px] text-[#747878]">
            Establishing secure stream to your user-specific investment document vault.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#faf9f8] text-[#1a1c1c] overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar onOpenAddModal={() => handleOpenAddModal()} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onOpenAddModal={() => handleOpenAddModal()} />

        {/* First-time onboarding banner if ledger is totally empty */}
        {totalEntries === 0 && (
          <div className="bg-[#1a1c1c] text-[#faf9f8] px-6 py-3 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#a6f2d1]" />
              <span>
                <strong>Your Cloud Firestore ledger is currently empty.</strong> Would you like to seed the baseline Master Workbook dataset (10 investment classes)?
              </span>
            </div>
            <button
              onClick={() => seedInitialWorkbookToUserFirestore()}
              className="bg-[#faf9f8] text-[#1a1c1c] hover:bg-[#ffffff] px-3 py-1 rounded font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Seed Master Portfolio</span>
            </button>
          </div>
        )}

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

const MainRoot: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen bg-[#faf9f8] items-center justify-center text-[#1a1c1c]">
        <div className="flex flex-col items-center gap-3 bg-[#ffffff] border border-[#e3e2e1] p-8 rounded shadow-xs max-w-sm text-center">
          <div className="w-10 h-10 rounded bg-[#1a1c1c] text-[#faf9f8] flex items-center justify-center font-bold text-sm">
            II
          </div>
          <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase text-[#1a1c1c]">
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#1a1c1c] border-t-transparent"></span>
            <span>Verifying Security Session...</span>
          </div>
          <p className="text-[11px] text-[#747878]">
            Authenticating 256-bit encrypted credential token.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <WealthProvider>
      <DashboardContent />
    </WealthProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainRoot />
    </AuthProvider>
  );
}
