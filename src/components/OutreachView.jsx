import React, { useState } from 'react';
import axios from 'axios';

const OutreachView = () => {
  const [formData, setFormData] = useState({
    company_name: 'TechCorp Solutions',
    decision_maker: 'Sarah Johnson',
    role: 'CTO',
    industry: 'Enterprise SaaS',
    value_proposition: 'AI-driven lead scoring and automated sales intelligence pipeline',
  });

  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Backend Endpoint API Call
      const response = await axios.post('http://127.0.0.1:8000/api/generate-email', formData);
      setGeneratedEmail(
        response.data.email || 
        response.data.generated_email || 
        (typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2))
      );
    } catch (err) {
      console.error('API Error:', err);
      // Offline Mode Fallback Preview
      setGeneratedEmail(
        `Subject: Streamlining ${formData.company_name}'s Lead Pipeline with AI\n\nHi ${formData.decision_maker},\n\nI noticed ${formData.company_name}'s growth in the ${formData.industry} sector. Given your role as ${formData.role}, I wanted to reach out regarding how our AI solution can assist with ${formData.value_proposition}.\n\nWould you be open to a quick 10-minute chat this week?\n\nBest regards,\nSalesGenie AI Team`
      );
      setError('Note: Backend server (http://127.0.0.1:8000) offline hai, isliye fallback preview dikhaya gaya hai.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Generate AI Outreach</h2>
        <p className="text-sm text-gray-500 mb-6">
          Fill in details to generate personalized cold emails powered by backend LLM.
        </p>

        <form onSubmit={handleGenerateEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Company Name</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Decision Maker</label>
              <input
                type="text"
                name="decision_maker"
                value={formData.decision_maker}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Role / Title</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Value Proposition</label>
            <textarea
              name="value_proposition"
              rows="3"
              value={formData.value_proposition}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Generating Email...' : '✨ Generate Email with AI'}
          </button>
        </form>
      </div>

      {/* Output Display Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Generated Email Output</h2>
            {generatedEmail && (
              <button
                onClick={handleCopy}
                className="text-xs font-medium px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy Email'}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
              {error}
            </div>
          )}

          {generatedEmail ? (
            <textarea
              readOnly
              value={generatedEmail}
              className="w-full h-80 p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm font-mono text-gray-800 resize-none focus:outline-none"
            />
          ) : (
            <div className="h-80 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <span className="text-2xl mb-2">✉️</span>
              <p className="text-sm font-medium">No email generated yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Fill details on the left and click "Generate Email with AI".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutreachView;