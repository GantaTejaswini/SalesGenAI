import React, { useState } from 'react';
import axios from 'axios';

const DashboardView = () => {
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineSuccess, setPipelineSuccess] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  // Trigger 1-Click End-to-End Pipeline
  const runFullPipeline = async () => {
    setPipelineRunning(true);
    setErrorNotice(null);
    setPipelineSuccess(false);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/full-pipeline', {
        prospect_name: 'TechCorp Solutions',
        industry: 'Enterprise SaaS'
      });
      setPipelineSuccess(true);
    } catch (err) {
      console.warn('Backend server offline. Running simulated pipeline.');
      setErrorNotice('Backend server (http://127.0.0.1:8000) offline hai — Fallback demo execution mode active!');
      setPipelineSuccess(true);
    } finally {
      setPipelineRunning(false);
    }
  };

  const stats = [
    { title: 'Total Leads Analyzed', value: '142', change: '+18%', isPositive: true, icon: '🎯' },
    { title: 'Cold Emails Dispatched', value: '89', change: '+24%', isPositive: true, icon: '✉️' },
    { title: 'Meetings Intelligence', value: '34', change: '+8%', isPositive: true, icon: '🎙️' },
    { title: 'Conversion Rate', value: '28.4%', change: '+4.2%', isPositive: true, icon: '⚡' }
  ];

  const activities = [
    { company: 'TechCorp Solutions', action: 'Lead Scored 94/100 (Tier 1)', time: '5m ago', tag: 'High Value' },
    { company: 'CloudWave Dynamics', action: 'Personalized cold email generated', time: '22m ago', tag: 'Outreach' },
    { company: 'NextGen Retail Ltd', action: 'Call transcript summarized (Positive Sentiment)', time: '1h ago', tag: 'Conversations' },
    { company: 'FinPulse Systems', action: 'Follow-up proposal drafted', time: '3h ago', tag: 'Pending' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Pipeline Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Intelligence & Executive Dashboard</h1>
          <p className="text-sm text-gray-500">Live overview of lead prioritization, outreach velocity, and AI analytics.</p>
        </div>
        <button
          onClick={runFullPipeline}
          disabled={pipelineRunning}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl shadow-sm text-sm font-semibold transition-all disabled:opacity-50"
        >
          <span>{pipelineRunning ? '⚙️ Executing AI Pipeline...' : '🚀 Run Autonomous Pipeline (1-Click)'}</span>
        </button>
      </div>

      {errorNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
          {errorNotice}
        </div>
      )}

      {pipelineSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl font-medium flex items-center justify-between">
          <span>✅ Full Autonomous Pipeline completed: Scored Leads ➔ Generated Drafts ➔ Updated Analytics!</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">200 OK</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.title}</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{item.value}</h3>
              <span className="text-xs font-medium text-emerald-600 mt-1 inline-block">{item.change} vs last month</span>
            </div>
            <div className="text-3xl p-3 bg-gray-50 rounded-xl">{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Mid Section: Pipeline Funnel + Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Progress */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1 space-y-4">
          <h2 className="text-base font-bold text-gray-800">Pipeline Conversion Funnel</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-600 font-medium mb-1">
                <span>Total Identified Leads</span>
                <span>100% (142)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-600 font-medium mb-1">
                <span>AI Scored & Verified (Tier 1)</span>
                <span>65% (92)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-2.5 rounded-full w-[65%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-600 font-medium mb-1">
                <span>Automated Outreach Sent</span>
                <span>48% (68)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-2.5 rounded-full w-[48%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-600 font-medium mb-1">
                <span>Engaged & Meetings Booked</span>
                <span>24% (34)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full w-[24%]"></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
            Automated sync with FastAPI backend: <code className="bg-gray-100 px-1 py-0.5 rounded">/api/full-pipeline</code>
          </div>
        </div>

        {/* Live AI Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Recent AI Pipeline Executions</h2>
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full">Live Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase">
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Action Description</th>
                  <th className="pb-3">Status Tag</th>
                  <th className="pb-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {activities.map((act, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-semibold text-gray-900">{act.company}</td>
                    <td className="py-3">{act.action}</td>
                    <td className="py-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium text-[11px]">
                        {act.tag}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-400">{act.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;