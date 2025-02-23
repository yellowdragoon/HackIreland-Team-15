"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, BreachTypeEnum } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Company details
  const [company, setCompany] = useState({
    name: '',
    industry: '',
  });

  // Breach monitoring settings
  const [breachSettings, setBreachSettings] = useState([
    {
      type: 'VIOLATING_TERMS' as BreachTypeEnum,
      enabled: true,
      effectScore: 50,
      description: 'Users violating platform terms of service'
    },
    {
      type: 'FRAUD' as BreachTypeEnum,
      enabled: true,
      effectScore: 75,
      description: 'Fraudulent user activity'
    },
    {
      type: 'SUSPICIOUS_ACTIVITY' as BreachTypeEnum,
      enabled: true,
      effectScore: 40,
      description: 'Suspicious or unusual user behavior'
    },
    {
      type: 'ILLEGAL_ACTIVITY' as BreachTypeEnum,
      enabled: true,
      effectScore: 90,
      description: 'Illegal activities or violations'
    },
    {
      type: 'DATA_LEAK' as BreachTypeEnum,
      enabled: true,
      effectScore: 85,
      description: 'Data breaches or unauthorized sharing'
    }
  ]);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.name || !company.industry) {
      setError('Please fill in all fields');
      return;
    }
    setStep(2);
  };

  const handleBreachSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create company
      const createdCompany = await api.createCompany({
        name: company.name,
        industry: company.industry
      });

      // Set up breach monitoring for each enabled type
      const enabledBreaches = breachSettings.filter(s => s.enabled);
      
      for (const setting of enabledBreaches) {
        try {
          await api.createBreach(createdCompany, {
            breach_type: setting.type,
            effect_score: setting.effectScore,
            description: setting.description
          });
        } catch (breachErr) {
          console.error('Failed to create breach:', breachErr);
          // Continue with other breaches even if one fails
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to complete setup');
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold mb-8">Business Setup</h1>
            
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({...company, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={company.industry}
                  onChange={(e) => setCompany({...company, industry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Next: Configure Breach Monitoring
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-8">Configure Breach Monitoring</h1>
          
          <form onSubmit={handleBreachSettingsSubmit} className="space-y-8">
            {breachSettings.map((setting, index) => (
              <div key={setting.type} className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={(e) => {
                        const newSettings = [...breachSettings];
                        newSettings[index].enabled = e.target.checked;
                        setBreachSettings(newSettings);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 font-medium">
                      {setting.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Effect Score:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={setting.effectScore}
                      onChange={(e) => {
                        const newSettings = [...breachSettings];
                        newSettings[index].effectScore = parseInt(e.target.value);
                        setBreachSettings(newSettings);
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <textarea
                  value={setting.description}
                  onChange={(e) => {
                    const newSettings = [...breachSettings];
                    newSettings[index].description = e.target.value;
                    setBreachSettings(newSettings);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
            ))}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Setting Up...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
