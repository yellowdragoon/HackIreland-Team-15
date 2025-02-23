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
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    user_id: '',
    company_id: '98848ed4-4b7b-43aa-971a-1f71d12d2475',
    breach_type: 'SUSPICIOUS_ACTIVITY',
    effect_score: 50,
    severity: 'HIGH',
    description: '',
    status: "OPEN"
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Get unresolved breaches
      const unresolvedRes = await api.get('/breach-events/unresolved');
      setUnresolved(unresolvedRes.data?.data || []);

      // Get recent breaches
      const recentRes = await api.get('/breach-events');
      setRecentBreaches(recentRes.data?.data || []);

      // Get users
      const usersRes = await api.get('/users');
      console.log('Users response:', usersRes); // Debug log

      const users = usersRes?.data || [];
      console.log('Users:', users); // Debug log

      // Fetch risk scores for each user
      const usersWithScores = await Promise.all(
        users.map(async (user: any) => {
          try {
            const scoreRes = await api.get(`/users/score/${user.passport_string}`);
            return {
              ...user,
              ref_score: scoreRes?.data?.ref_score || user.ref_score || 0
            };
          } catch (e) {
            console.error(`Failed to get score for user ${user.passport_string}:`, e);
            return {
              ...user,
              ref_score: user.ref_score || 0
            };
          }
        })
      );
      console.log('Users with scores:', usersWithScores); // Debug log
      setUsers(usersWithScores || []);

      // Update stats with high risk users
      setStats({
        totalBreaches: recentRes.data?.data?.length || 0,
        unresolvedBreaches: unresolvedRes.data?.data?.length || 0,
        highRiskUsers: usersWithScores.filter((u: any) => u.ref_score >= 70).length || 0
      });
    } catch (err: any) {
      console.error('Dashboard loading error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const resolveBreachEvent = async (eventId: string) => {
    if (!eventId) {
      setError('Invalid breach ID');
      return;
    }
    try {
      setResolvingBreach(true);
      await api.post(`/breach-events/${eventId}/resolve`);
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

        {/* Create Event Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreateEvent(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Create Manual Event
          </button>
        </div>

        {/* User Risk Analysis */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">User Risk Analysis</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.passport_string} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{user.passport_string}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${getSeverityColor(user.ref_score)}`}>
                          {user.ref_score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={async () => {
                            try {
                              const riskData = await api.get(`/users/risk/${user.passport_string}`);
                              setUserDetails(riskData);
                              setSelectedUser(user);
                            } catch (err) {
                              setError('Failed to load user details');
                            }
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
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

        {/* User Details Modal */}
        {selectedUser && userDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">User Details</h3>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-medium mb-2">User Information</h4>
                  <p className="text-sm text-gray-600">ID: {selectedUser.passport_string}</p>
                  <p className="text-sm text-gray-600">Name: {selectedUser.name}</p>
                  <p className="text-sm text-gray-600">
                    Risk Score: <span className={`font-semibold ${getSeverityColor(selectedUser.ref_score)}`}>
                      {selectedUser.ref_score}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Risk Analysis</h4>
                  <p className="text-sm text-gray-600">Current Score: {userDetails.risk_score}</p>
                  <p className="text-sm text-gray-600">Total Breaches: {userDetails.user?.total_breaches || 0}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Device History</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {userDetails.devices?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {userDetails.devices.map((device: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded shadow-sm">
                          <p className="text-sm font-medium">Device {index + 1}</p>
                          <p className="text-xs text-gray-600">IP: {device.ip_address}</p>
                          <p className="text-xs text-gray-600">Last Used: {formatDate(device.last_used)}</p>
                          <p className="text-xs text-gray-600">Risk Level:
                            <span className={`font-semibold ${getSeverityColor(device.risk_score)}`}>
                              {device.risk_score}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No devices found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Create Manual Event</h3>
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEvent.user_id}
                    onChange={(e) => setNewEvent({...newEvent, user_id: e.target.value})}
                  >
                    <option value="">Select a user</option>
                    {users.map((user: any) => (
                      <option key={user.passport_string} value={user.passport_string}>
                        {user.name} ({user.passport_string})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breach Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEvent.breach_type}
                    onChange={(e) => setNewEvent({...newEvent, breach_type: e.target.value})}
                  >
                    <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                    <option value="FRAUD">Fraud</option>
                    <option value="VIOLATING_TERMS">Terms Violation</option>
                    <option value="ILLEGAL_ACTIVITY">Illegal Activity</option>
                    <option value="DATA_LEAK">Data Leak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effect Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEvent.effect_score}
                    onChange={(e) => setNewEvent({...newEvent, effect_score: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Enter event details..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateEvent(false);
                    setNewEvent({
                      user_id: '',
                      breach_type: 'SUSPICIOUS_ACTIVITY',
                      effect_score: 50,
                      description: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const eventData = {
                        user_id: newEvent.user_id,
                        breach_type: newEvent.breach_type,
                        effect_score: newEvent.effect_score,
                        description: newEvent.description,
                        severity: newEvent.effect_score >= 70 ? 'HIGH' : newEvent.effect_score >= 40 ? 'MEDIUM' : 'LOW',
                        status: 'OPEN'
                      };
                      await api.post('/breach-events/manual', eventData);
                      setShowCreateEvent(false);
                      setNewEvent({
                        user_id: '',
                        breach_type: 'SUSPICIOUS_ACTIVITY',
                        effect_score: 50,
                        description: ''
                      });
                      loadDashboard();
                    } catch (err) {
                      console.error('Failed to create event:', err);
                      setError('Failed to create event');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={!newEvent.user_id || !newEvent.description}
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        )}

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
                  onClick={() => resolveBreachEvent(selectedBreach?.id || selectedBreach?._id)}
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
