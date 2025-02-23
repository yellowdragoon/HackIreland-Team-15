"use client";

import { useState } from 'react';
import { api, BreachTypeEnum } from '@/lib/api';

export default function ReportBreachPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    passportString: '',
    breachType: 'VIOLATING_TERMS' as BreachTypeEnum,
    description: '',
    effectScore: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/breach-events', {
        user_id: formData.passportString,
        breach_type: formData.breachType,
        description: formData.description,
        effect_score: formData.effectScore
      });
      setSuccess(true);
      setFormData({
        passportString: '',
        breachType: 'VIOLATING_TERMS',
        description: '',
        effectScore: 50
      });
    } catch (err: any) {
      setError(err.message || 'Failed to report breach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Report User Breach</h1>

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
            Breach reported successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Passport String
            </label>
            <input
              type="text"
              value={formData.passportString}
              onChange={(e) => setFormData({...formData, passportString: e.target.value})}
              placeholder="e.g. ABC123"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breach Type
            </label>
            <select
              value={formData.breachType}
              onChange={(e) => setFormData({...formData, breachType: e.target.value as BreachTypeEnum})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="VIOLATING_TERMS">Terms Violation</option>
              <option value="FRAUD">Fraud</option>
              <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
              <option value="ILLEGAL_ACTIVITY">Illegal Activity</option>
              <option value="DATA_LEAK">Data Leak</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effect Score (1-100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.effectScore}
              onChange={(e) => setFormData({...formData, effectScore: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Reporting...' : 'Report Breach'}
            </button>

            <a
              href="/"
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 text-center"
            >
              Back to Search
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
