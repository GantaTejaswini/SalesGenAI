import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LeadsView from './components/LeadsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('leads');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'leads' && <LeadsView />}
        {activeTab === 'outreach' && (
          <div className="p-8 text-center text-gray-500">Outreach Module (Weeks 3–4)</div>
        )}
        {activeTab === 'conversations' && (
          <div className="p-8 text-center text-gray-500">Conversations Module (Weeks 5–6)</div>
        )}
        {activeTab === 'dashboard' && (
          <div className="p-8 text-center text-gray-500">Dashboard Module (Weeks 7–8)</div>
        )}
      </main>
    </div>
  );
}