import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LeadsView from './components/LeadsView';
import OutreachView from './components/OutreachView';
import ConversationsView from './components/ConversationsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('conversations');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'leads' && <LeadsView />}
        {activeTab === 'outreach' && <OutreachView />}
        {activeTab === 'conversations' && <ConversationsView />}
        {activeTab === 'dashboard' && (
          <div className="p-8 text-center text-gray-500">Dashboard Module (Weeks 7–8)</div>
        )}
      </main>
    </div>
  );
}