import { useState } from 'react';
import { Target, Mail, MessageSquare, BarChart3, Sparkles, Zap, LogOut, Database } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth';
import { HomePage } from './views/HomePage';
import { LoginPage } from './views/LoginPage';
import { LeadsView } from './views/LeadsView';
import { OutreachView } from './views/OutreachView';
import { ConversationsView } from './views/ConversationsView';
import { DashboardView } from './views/DashboardView';
import { CrmSyncView } from './views/CrmSyncView';

type Screen = 'home' | 'signin' | 'signup';
type Tab = 'leads' | 'outreach' | 'conversations' | 'dashboard' | 'crmsync';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'leads', label: 'Leads', icon: <Target className="w-4 h-4" /> },
  { id: 'outreach', label: 'Outreach', icon: <Mail className="w-4 h-4" /> },
  { id: 'conversations', label: 'Conversations', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'crmsync', label: 'CRM Sync', icon: <Database className="w-4 h-4" /> },
];

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function AppInner() {
  const { session, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (screen === 'home') {
      return (
        <HomePage
          onGetStarted={() => setScreen('signup')}
          onSignIn={() => setScreen('signin')}
        />
      );
    }
    return (
      <LoginPage
        mode={screen === 'signup' ? 'signup' : 'signin'}
        onBack={() => setScreen('home')}
        onToggleMode={() => setScreen(screen === 'signup' ? 'signin' : 'signup')}
      />
    );
  }

  return <MainApp />;
}

function MainApp() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-none">AI-Powered Sales Forecasting</h1>
                <p className="text-xs text-neutral-500 mt-0.5">Predictive Analytics Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent-500/10 border border-accent-500/20 rounded-full">
                <Zap className="w-3.5 h-3.5 text-accent-400" />
                <span className="text-xs font-medium text-accent-300">AI Engine Active</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-neutral-400">
                <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-300">
                  {user?.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="max-w-[160px] truncate">{user?.email}</span>
              </div>
              <button onClick={signOut} className="btn-ghost text-sm" title="Sign out">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'leads' && (
          <LeadsView selectedLeadId={selectedLeadId} onSelectLead={setSelectedLeadId} />
        )}
        {activeTab === 'outreach' && <OutreachView />}
        {activeTab === 'conversations' && <ConversationsView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'crmsync' && <CrmSyncView />}
      </main>
    </div>
  );
}
