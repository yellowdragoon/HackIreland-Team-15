"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';

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


  const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard...');

      // Get unresolved breaches
      console.log('Fetching unresolved events...');
      const unresolvedRes = await api.get('/breach-events/unresolved');
      console.log('Unresolved response:', unresolvedRes);
      const unresolvedEvents = unresolvedRes.data || [];
      console.log('Parsed unresolved events:', unresolvedEvents);
      setUnresolved(unresolvedEvents);

      // Get recent breaches
      console.log('Fetching recent events...');
      const recentRes = await api.get('/breach-events');
      console.log('Recent response:', recentRes);
      const recentEvents = recentRes.data || [];
      console.log('Parsed recent events:', recentEvents);
      setRecentBreaches(recentEvents);

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

      // Calculate stats
      const highRiskUsers = usersWithScores.filter((u: any) => u.ref_score >= 70);
      console.log('High risk users:', highRiskUsers);

      const newStats = {
        totalBreaches: recentEvents.length,
        unresolvedBreaches: unresolvedEvents.length,
        highRiskUsers: highRiskUsers.length,
        totalUsers: usersWithScores.length
      };

      console.log('Calculating stats:');
      console.log('- Total breaches:', recentEvents.length, recentEvents);
      console.log('- Unresolved breaches:', unresolvedEvents.length, unresolvedEvents);
      console.log('- High risk users:', highRiskUsers.length, highRiskUsers);
      console.log('- Total users:', usersWithScores.length);

      console.log('Setting stats:', newStats);
      setStats(newStats);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full absolute border-4 border-dashed border-gray-200"></div>
              <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-xl font-semibold text-gray-900">Loading Dashboard</div>
              <div className="text-sm text-gray-500">Fetching latest security data...</div>
            </div>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Security Overview</h1>
            <p className="mt-2 text-gray-600">Monitor and manage security incidents across your organization</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateEvent(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Event</span>
            </button>
            <button
              onClick={() => loadDashboard()}
              className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all shadow-sm hover:shadow flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Total Breaches</h3>
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBreaches}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Total security incidents</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Unresolved</h3>
              <div className="p-2 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.unresolvedBreaches}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Pending resolution</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">High Risk</h3>
              <div className="p-2 bg-orange-50 rounded-lg">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.highRiskUsers}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Users requiring attention</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Total monitored accounts</span>
            </div>
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

        {/* Unresolved Events */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Unresolved Events ({unresolved.length})</h2>
            <div className="space-y-4">
              {unresolved.length > 0 ? (
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
                      {unresolved.map((event: any) => (
                        <tr key={event._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{event.user_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {event.breach_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`font-semibold ${getSeverityColor(event.effect_score)}`}>
                              {event.effect_score}
                            </span>
                          </td>
                          <td className="px-6 py-4">{event.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedBreach(event)}
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
              ) : (
                <p className="text-gray-500 text-center py-4">No unresolved events</p>
              )}
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
                    <div className="grid grid-cols-2 gap-4">
                      {userDetails.devices.map((device: any, index: number) => (
                        <div
                          key={index}
                          className={`bg-white p-4 rounded-lg shadow-sm ${index === 1 ? 'border-2 border-orange-400' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-medium">Device {index + 1}</p>
                            {index === 1 && (
                              <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                                Potential AI Agent
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="text-gray-600">IP:</span>{' '}
                              <span className="font-medium">{device.ip_address}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Last Used:</span>{' '}
                              <span className="font-medium">{formatDate(device.last_used)}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Risk Level:</span>{' '}
                              <span className={`font-semibold ${getSeverityColor(device.risk_score)}`}>
                                {device.risk_score}
                              </span>
                            </p>
                          </div>
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
