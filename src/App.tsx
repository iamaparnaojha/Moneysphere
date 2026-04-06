import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { BalanceTrendChart, CategorySpendingChart, MonthlyComparisonChart } from './components/dashboard/Charts';
import { TransactionList } from './components/transactions/TransactionList';
import { ObservationCard } from './components/dashboard/ObservationCard';
import { TransactionAnimationOverlay } from './components/ui/TransactionAnimationOverlay';
import { CardsView } from './components/cards/CardsView';
import Goals from './components/goals/Goals';
import Settings from './components/settings/Settings';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Cards */}
            <SummaryCards />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BalanceTrendChart />
              <CategorySpendingChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TransactionList />
              </div>
              <div className="space-y-6">
                <MonthlyComparisonChart />
                <ObservationCard />
              </div>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <TransactionList />
          </div>
        );
      case 'cards':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardsView />
          </div>
        );
      case 'goals':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Goals />
          </div>
        );
      case 'settings':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Settings />
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#030712] transition-colors duration-500 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-blob bg-blob-1 animate-pulse-slow" />
        <div className="bg-blob bg-blob-2 animate-pulse-slow" />
        <div className="bg-blob bg-blob-3 animate-pulse-slow" />
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <TransactionAnimationOverlay />
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <DashboardContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

