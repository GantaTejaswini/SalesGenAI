import React, { useState } from 'react';
import mockLeads from '../data/mockLeads.json';
import { MapPin, DollarSign, Users, Award, Sparkles, Send } from 'lucide-react';

export default function LeadsView() {
  const [selectedLead, setSelectedLead] = useState(mockLeads[0]);

  return (
    <div className="flex h-[calc(100vh-61px)] bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            All Prospects ({mockLeads.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {mockLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className={`p-4 cursor-pointer transition-all hover:bg-blue-50/50 ${
                selectedLead.id === lead.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-gray-900">{lead.companyName}</h3>
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Score: {lead.score}
                </span>
              </div>
              <p className="text-sm text-gray-600">{lead.contactPerson}</p>
              <p className="text-xs text-gray-400 mt-2">{lead.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-2/3 p-6 overflow-y-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
              {selectedLead.status}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{selectedLead.companyName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{selectedLead.contactPerson}</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-blue-700 transition">
            <Send className="w-4 h-4" />
            <span>Generate Outreach</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Company Size</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">{selectedLead.companySize}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 text-gray-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Annual Revenue</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">{selectedLead.revenue}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 text-gray-500 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-medium">Location</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">{selectedLead.location}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 text-gray-500 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-medium">Funding Stage</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">{selectedLead.fundingStage}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Technology Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedLead.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full border border-gray-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">Lead Intelligence</h3>
            </div>
            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-md">
              AI Powered
            </span>
          </div>

          <div className="flex items-center space-x-6 border-b border-gray-100 pb-5 mb-5">
            <div className="relative w-20 h-20 flex items-center justify-center rounded-full border-4 border-blue-600 text-blue-600">
              <div className="text-center">
                <span className="text-2xl font-bold">{selectedLead.score}</span>
                <span className="block text-[9px] text-gray-400 font-medium uppercase">Score</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Highly Qualified Lead</h4>
              <p className="text-xs text-gray-500 mt-1">
                Score based on funding signals, technology compatibility, and expansion activities.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {selectedLead.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-gray-700 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}