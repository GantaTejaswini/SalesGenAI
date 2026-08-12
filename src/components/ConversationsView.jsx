import React, { useState } from 'react';
import axios from 'axios';

const ConversationsView = () => {
  const [transcript, setTranscript] = useState('');
  const [prospectName, setProspectName] = useState('TechCorp Solutions');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Backend Integration Call
      const response = await axios.post('http://127.0.0.1:8000/api/analyse-meeting', {
        transcript: transcript,
        prospect_name: prospectName
      });
      
      setAnalysisResult(response.data);
    } catch (err) {
      console.warn('Backend server unreachable. Falling back to preview mode.');
      setError('Note: Backend server (http://127.0.0.1:8000) offline hai, isliye fallback analysis report dikhaya gaya hai.');
      
      // Fallback Data for UI Demo/Testing
      setAnalysisResult({
        sentiment: 'Positive',
        key_insights: [
          'Prospect is highly interested in automated lead scoring capabilities.',
          'Budget is approved for Q3 implementation.',
          'Main concern is integration timeline with existing CRM.'
        ],
        action_items: [
          'Send technical architecture documentation.',
          'Schedule follow-up demo with engineering team next Tuesday.'
        ],
        followup_summary: 'Overall successful discussion. Decision maker is onboard; pending technical verification.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversations Intelligence</h1>
        <p className="text-sm text-gray-500">Analyze meeting transcripts and pitch calls using AI engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Input Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Prospect / Account Name
              </label>
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-blue-500"
                placeholder="e.g. Acme Corp"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Meeting Transcript
              </label>
              <textarea
                rows={10}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste the call transcript or meeting notes here..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-blue-500 font-mono text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Analyzing Transcript...' : '📊 Analyze Meeting with AI'}
            </button>
          </form>
        </div>

        {/* Right Side: Analysis Output */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Meeting Intelligence Report</h2>

            {error && (
              <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
                {error}
              </div>
            )}

            {analysisResult ? (
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Sentiment Score</span>
                  <div className="mt-1">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {analysisResult.sentiment}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Key Insights</span>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700 text-xs">
                    {analysisResult.key_insights?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Action Items</span>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700 text-xs">
                    {analysisResult.action_items?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Summary</span>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 text-xs">
                    {analysisResult.followup_summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400">
                <span className="text-2xl mb-2">💬</span>
                <p className="text-sm font-medium">No meeting analyzed yet</p>
                <p className="text-xs text-gray-400 mt-1">Paste transcript on the left and click "Analyze Meeting with AI".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationsView;