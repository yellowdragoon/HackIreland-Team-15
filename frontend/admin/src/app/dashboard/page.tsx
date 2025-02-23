"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalBreaches: 0,
    unresolvedBreaches: 0,
    highRiskUsers: 0
  });
  const [recentBreaches, setRecentBreaches] = useState([]);
  const [unresolved, setUnresolved] = useState([]);
  const [selectedBreach, setSelectedBreach] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvingBreach, setResolvingBreach] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Get unresolved breaches
      const unresolvedRes = await api.get('/breach-events/unresolved');
      setUnresolved(unresolvedRes.data || []);

      // Get recent breaches
      const recentRes = await api.get('/breach-events');
      setRecentBreaches(recentRes.data || []);

      // Calculate stats
      setStats({
        totalBreaches: recentRes.data?.length || 0,
        unresolvedBreaches: unresolvedRes.data?.length || 0,
        highRiskUsers: recentRes.data?.filter(b => b.effect_score > 70).length || 0
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const resolveBreachEvent = async (eventId: string) => {
    try {
      setResolvingBreach(true);
      await api.post(`/breach-events/${eventId}/resolve`, {
        resolution_notes: resolutionNotes || 'Marked as resolved from dashboard'
      });
      setSelectedBreach(null);
      setResolutionNotes('');
      loadDashboard(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to resolve breach');
    } finally {
      setResolvingBreach(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const getSeverityColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Breach Monitoring Dashboard</h1>
          <button
            onClick={() => loadDashboard()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-medium text-gray-900">Total Breaches</h3>
            <p className="mt-2 text-3xl font-bold">{stats.totalBreaches}</p>
            <p className="mt-1 text-sm text-gray-500">All reported incidents</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-medium text-gray-900">Unresolved Breaches</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">{stats.unresolvedBreaches}</p>
            <p className="mt-1 text-sm text-gray-500">Require immediate attention</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-medium text-gray-900">High Risk Users</h3>
            <p className="mt-2 text-3xl font-bold text-orange-600">{stats.highRiskUsers}</p>
            <p className="mt-1 text-sm text-gray-500">Users with risk score > 70</p>
          </div>
        </div>

        {/* Unresolved Breaches */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Unresolved Breaches</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unresolved.map((breach: any) => (
                    <tr key={breach._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{breach.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {breach.breach_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${getSeverityColor(breach.effect_score)}`}>
                          {breach.effect_score}
                        </span>
                      </td>
                      <td className="px-6 py-4">{breach.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBreach(breach)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentBreaches.map((breach: any) => (
                    <tr key={breach._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(breach.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{breach.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {breach.breach_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${getSeverityColor(breach.effect_score)}`}>
                          {breach.effect_score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          breach.resolved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {breach.resolved ? 'Resolved' : 'Unresolved'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Resolution Modal */}
        {selectedBreach && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-bold mb-4">Resolve Breach</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">User ID: {selectedBreach.user_id}</p>
                <p className="text-sm text-gray-600 mb-2">Type: {selectedBreach.breach_type}</p>
                <p className="text-sm text-gray-600 mb-4">Description: {selectedBreach.description}</p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter resolution details..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedBreach(null);
                    setResolutionNotes('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => resolveBreachEvent(selectedBreach._id)}
                  disabled={resolvingBreach}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {resolvingBreach ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
