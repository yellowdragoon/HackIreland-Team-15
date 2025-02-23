"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, UserResponse } from '@/lib/api';

export default function RiskPage() {
  const params = useParams();
  const passportString = params.passport as string;
  const [data, setData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getUserRisk(passportString);
        setData(response);
      } catch (err) {
        setError('Failed to fetch risk score');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [passportString]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">{error || 'Failed to load data'}</div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score < 0.3) return 'bg-green-100 text-green-800';
    if (score < 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Risk Assessment Results
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details and scoring for {data.user.name}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.user.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Passport Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.user.passport_string}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.user.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.user.phone_number}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Risk Score</dt>
                <dd className="mt-1 text-sm">
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getRiskColor(data.risk_score || 0)}`}>
                    {((data.risk_score || 0) * 100).toFixed(1)}%
                  </span>
                </dd>
              </div>
              {data.devices && data.devices.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Device History</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {data.devices.map((device, index) => (
                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate">
                              {device.ip_address}
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="font-medium text-gray-500">
                              {new Date(device.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
