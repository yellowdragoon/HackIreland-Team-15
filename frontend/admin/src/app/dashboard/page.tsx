'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const API_BASE = 'http://localhost:8080/api/v1';

type User = {
  _id: string;
  name: string;
  passport_string: string;
  ref_score: number;
};

type Company = {
  _id: string;
  name: string;
  industry: string;
};

type BreachEvent = {
  _id: string;
  user_id: string;
  company_id: string;
  breach_type: string;
  effect_score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVED';
  description: string;
};

type Device = {
  _id: string;
  user_id: string;
  ip_address: string;
  last_seen: string;
  risk_level: string;
};

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [breachEvents, setBreachEvents] = useState<BreachEvent[]>([]);
  const [suspiciousDevices, setSuspiciousDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, companiesRes, eventsRes, devicesRes] = await Promise.all([
          fetch(`${API_BASE}/users`),
          fetch(`${API_BASE}/companies`),
          fetch(`${API_BASE}/breach-events/unresolved`),
          fetch(`${API_BASE}/user-info/devices/suspicious`)
        ]);

        if (!usersRes.ok || !companiesRes.ok || !eventsRes.ok || !devicesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [usersData, companiesData, eventsData, devicesData] = await Promise.all([
          usersRes.json(),
          companiesRes.json(),
          eventsRes.json(),
          devicesRes.json()
        ]);

        setUsers(usersData.data || []);
        setCompanies(companiesData.data || []);
        setBreachEvents(eventsData.data || []);
        setSuspiciousDevices(devicesData.data || []);
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSeverityColor = (severity: string) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <Button variant="outline">Refresh Data</Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="events">Breach Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg">Total Users</h3>
                <p className="text-3xl font-bold mt-2">{users.length}</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-lg">Total Companies</h3>
                <p className="text-3xl font-bold mt-2">{companies.length}</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-lg">Active Breaches</h3>
                <p className="text-3xl font-bold mt-2">{breachEvents.length}</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-lg">Suspicious Devices</h3>
                <p className="text-3xl font-bold mt-2">{suspiciousDevices.length}</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Passport</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.passport_string}</TableCell>
                      <TableCell>
                        <Badge variant={user.ref_score > 70 ? 'destructive' : 'default'}>
                          {user.ref_score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Active Breaches</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company._id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>
                        {breachEvents.filter(e => e.company_id === company.id).length}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Effect Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breachEvents.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell>{event.breach_type}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.effect_score}</TableCell>
                      <TableCell>
                        <Badge variant={event.status === 'OPEN' ? 'destructive' : 'default'}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="sm">View</Button>
                        {event.status === 'OPEN' && (
                          <Button variant="outline" size="sm">Resolve</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
