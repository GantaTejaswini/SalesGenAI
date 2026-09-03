import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LeadsView from './components/LeadsView';
import OutreachView from './components/OutreachView';
import ConversationsView from './components/ConversationsView';
import DashboardView from './components/DashboardView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'leads' && <LeadsView />}
        {activeTab === 'outreach' && <OutreachView />}
        {activeTab === 'conversations' && <ConversationsView />}
        {activeTab === 'dashboard' && <DashboardView />}
      </main>
    </div>
  );
}                         