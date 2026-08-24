import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WealthProvider, useWealth } from './context/WealthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OverviewScreen } from './components/OverviewScreen';
import { PortfolioScreen } from './components/PortfolioScreen';
import { InvestmentsScreen } from './components/InvestmentsScreen';
import { CryptoInvestmentsScreen } from './components/CryptoInvestmentsScreen';
import { CryptoDayTradingScreen } from './components/CryptoDayTradingScreen';
import { IncomeScreen } from './components/IncomeScreen';
import { MaturitiesScreen } from './components/MaturitiesScreen';
import { TransactionsScreen } from './components/TransactionsScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { VaultScreen } from './components/VaultScreen';
import { ExcelImportScreen } from './components/ExcelImportScreen';
import { MarketReferencesScreen } from './components/MarketReferencesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AddInvestmentModal } from './components/modals/AddInvestmentModal';
import { AddPassiveIncomeModal } from './components/modals/AddPassiveIncomeModal';
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
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAddPassiveIncomeModalOpen, setIsAddPassiveIncomeModalOpen] = useState<boolean>(false);
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
      <div className="flex h-screen bg-[#faf9f8] dark:bg-[#111313] items-center justify-center text-[#1a1c1c] dark:text-[#e1e3e2] p-4 transition-colors">
        <div className="flex flex-col items-center gap-3 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-6 sm:p-8 rounded shadow-xs max-w-sm w-full text-center">
          <div className="w-10 h-10 rounded bg-[#1a1c1c] dark:bg-[#e1e3e2] text-[#faf9f8] dark:text-[#111313] flex items-center justify-center font-bold text-sm">
            II
          </div>
          <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase text-[#1a1c1c] dark:text-[#e1e3e2]">
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#1a1c1c] dark:border-[#e1e3e2] border-t-transparent"></span>
            <span>Synchronizing Firestore Ledger...</span>
          </div>
          <p className="text-[11px] text-[#747878] dark:text-[#8c9290]">
            Establishing secure stream to your user-specific investment document vault.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#faf9f8] dark:bg-[#111313] text-[#1a1c1c] dark:text-[#e1e3e2] overflow-hidden font-sans transition-colors">
      {/* Navigation Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar 
        onOpenAddModal={() => handleOpenAddModal()} 
        onOpenAddPassiveIncomeModal={() => setIsAddPassiveIncomeModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header 
          onOpenAddModal={() => handleOpenAddModal()} 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* First-time onboarding banner if ledger is totally empty */}
        {totalEntries === 0 && (
          <div className="bg-[#1a1c1c] dark:bg-[#191c1b] text-[#faf9f8] dark:text-[#e1e3e2] border-b border-[#e3e2e1] dark:border-[#2d3130] px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#a6f2d1] dark:text-[#60d3a7] shrink-0" />
              <span>
                <strong>Your Cloud Firestore ledger is empty.</strong> Seed the baseline Master Workbook dataset (10 classes)?
              </span>
            </div>
            <button
              onClick={() => seedInitialWorkbookToUserFirestore()}
              className="bg-[#faf9f8] text-[#1a1c1c] hover:bg-[#ffffff] dark:bg-[#222625] dark:text-[#e1e3e2] dark:hover:bg-[#2d3130] px-3 py-1 rounded font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-end sm:self-auto"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Seed Master Portfolio</span>
            </button>
          </div>
        )}

        {/* Scrollable Screen Viewport with bottom safe area for Mobile Bottom Nav */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {activeScreen === 'overview' && (
              <OverviewScreen
                onOpenAddModal={() => handleOpenAddModal()}
                onOpenAddPassiveIncomeModal={() => setIsAddPassiveIncomeModalOpen(true)}
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

            {activeScreen === 'crypto_investments' && (
              <CryptoInvestmentsScreen />
            )}

            {activeScreen === 'crypto_day_trades' && (
              <CryptoDayTradingScreen />
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

            {activeScreen === 'market_references' && (
              <MarketReferencesScreen />
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

        {/* Mobile Bottom Navigation for quick thumb access on phones & tablets */}
        <MobileBottomNav
          onToggleMenu={() => setIsMobileSidebarOpen(prev => !prev)}
          onOpenAddModal={() => handleOpenAddModal()}
        />
      </div>

      {/* Modals & Dialogs */}
      <AddInvestmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCategory={modalCategory}
      />

      <AddPassiveIncomeModal
        isOpen={isAddPassiveIncomeModalOpen}
        onClose={() => setIsAddPassiveIncomeModalOpen(false)}
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
      <div className="flex h-screen bg-[#faf9f8] dark:bg-[#111313] items-center justify-center text-[#1a1c1c] dark:text-[#e1e3e2]">
        <div className="flex flex-col items-center gap-3 bg-[#ffffff] dark:bg-[#191c1b] border border-[#e3e2e1] dark:border-[#2d3130] p-8 rounded shadow-xs max-w-sm text-center">
          <div className="w-10 h-10 rounded bg-[#1a1c1c] dark:bg-[#e1e3e2] text-[#faf9f8] dark:text-[#111313] flex items-center justify-center font-bold text-sm">
            II
          </div>
          <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase text-[#1a1c1c] dark:text-[#e1e3e2]">
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#1a1c1c] dark:border-[#e1e3e2] border-t-transparent"></span>
            <span>Verifying Security Session...</span>
          </div>
          <p className="text-[11px] text-[#747878] dark:text-[#8c9290]">
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
    <ThemeProvider>
      <AuthProvider>
        <MainRoot />
      </AuthProvider>
    </ThemeProvider>
  );
}
