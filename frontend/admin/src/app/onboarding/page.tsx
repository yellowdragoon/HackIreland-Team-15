'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Company, BreachType, BreachTypeEnum } from '@/lib/api';

const breachTypes: BreachTypeEnum[] = [
  'VIOLATING_TERMS',
  'FRAUD',
  'DEFAULT',
  'SUSPICIOUS_ACTIVITY',
  'ILLEGAL_ACTIVITY',
  'DATA_LEAK',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Company details
  const [company, setCompany] = useState<Company>({
    id: `COMP${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    name: '',
    industry: '',
    breach: null,
  });

  // Breach policies
  const [breachPolicies, setBreachPolicies] = useState<BreachType[]>([
    {
      company_id: '',
      breach_type: 'SUSPICIOUS_ACTIVITY',
      description: 'Suspicious login attempts or unusual account activity',
      effect_score: 30,
      timestamp: new Date().toISOString(),
    },
    {
      company_id: '',
      breach_type: 'VIOLATING_TERMS',
      description: 'Violation of terms of service or user agreements',
      effect_score: 50,
      timestamp: new Date().toISOString(),
    },
    {
      company_id: '',
      breach_type: 'FRAUD',
      description: 'Fraudulent activities or transactions',
      effect_score: 75,
      timestamp: new Date().toISOString(),
    },
    {
      company_id: '',
      breach_type: 'ILLEGAL_ACTIVITY',
      description: 'Illegal activities detected',
      effect_score: 90,
      timestamp: new Date().toISOString(),
    },
    {
      company_id: '',
      breach_type: 'DATA_LEAK',
      description: 'Unauthorized data access or sharing',
      effect_score: 85,
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const createdCompany = await api.createCompany(company);
      if (!createdCompany || !createdCompany.id) {
        throw new Error('Failed to get company ID from response');
      }
      // Update breach policies with company ID
      setBreachPolicies(policies =>
        policies.map(policy => ({
          ...policy,
          company_id: createdCompany.id
        }))
      );
      setStep(2);
    } catch (err) {
      setError('Failed to create company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBreachPoliciesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await Promise.all(
        breachPolicies.map(policy => api.createBreachType(policy))
      );
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to create breach policies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Company Setup' : 'Configure Breach Policies'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step {step} of 2
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCompanySubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={company.name}
                onChange={(e) => setCompany({...company, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <select
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={company.industry}
                onChange={(e) => setCompany({...company, industry: e.target.value})}
              >
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Next'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBreachPoliciesSubmit} className="space-y-6">
            {breachPolicies.map((policy, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Breach Type
                  </label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={policy.breach_type}
                    onChange={(e) => {
                      const newPolicies = [...breachPolicies];
                      newPolicies[index].breach_type = e.target.value as BreachTypeEnum;
                      setBreachPolicies(newPolicies);
                    }}
                  >
                    <option value="VIOLATING_TERMS">Violating Terms</option>
                    <option value="FRAUD">Fraud</option>
                    <option value="DEFAULT">Default</option>
                    <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                    <option value="ILLEGAL_ACTIVITY">Illegal Activity</option>
                    <option value="DATA_LEAK">Data Leak</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={policy.description}
                    onChange={(e) => {
                      const newPolicies = [...breachPolicies];
                      newPolicies[index].description = e.target.value;
                      setBreachPolicies(newPolicies);
                    }}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Effect Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={policy.effect_score}
                    onChange={(e) => {
                      const newPolicies = [...breachPolicies];
                      newPolicies[index].effect_score = parseInt(e.target.value);
                      setBreachPolicies(newPolicies);
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Finalizing...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
