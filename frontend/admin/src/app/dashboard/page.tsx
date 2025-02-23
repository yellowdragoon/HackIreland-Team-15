'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { api, User, Company, CompanyBreachType } from '@/lib/api';

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [breaches, setBreaches] = useState<{[key: string]: CompanyBreachType}>({});
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchPassport, setSearchPassport] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get list of companies
        const companiesList = await api.listCompanies();
        setCompanies(companiesList);

        // Get breaches for each company
        const breachesMap: {[key: string]: CompanyBreachType} = {};
        for (const company of companiesList) {
          try {
            const breach = await api.getCompanyBreach(company.id);
            if (breach) {
              breachesMap[company.id] = breach;
            }
          } catch (e) {
            // No breach for this company
          }
        }
        setBreaches(breachesMap);

        // Get high impact breaches
        const highImpact = await api.getHighImpactBreaches(70);
        console.log('High impact breaches:', highImpact);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg">Total Companies</h3>
                <p className="text-3xl font-bold mt-2">{companies.length}</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-lg">Active Breaches</h3>
                <p className="text-3xl font-bold mt-2">{Object.keys(breaches).length}</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-lg">High Impact Breaches</h3>
                <p className="text-3xl font-bold mt-2">
                  {Object.values(breaches).filter(b => b.effect_score > 70).length}
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
              <p className="text-yellow-800">Select a company first to view its user breaches</p>
            </div>
            {selectedCompany && (
              <Card>
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">
                    User Risk Assessment
                  </h3>
                  <div className="mt-2 space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter passport number"
                        className="flex-1 p-2 border rounded"
                        value={searchPassport}
                        onChange={(e) => {
                          setSearchPassport(e.target.value);
                          setSearchError(null);
                          setUserScore(null);
                        }}
                      />
                      <Button 
                        onClick={async () => {
                          try {
                            setSearchError(null);
                            const response = await api.getUserScore(searchPassport);
                            setUserScore(response.data.ref_score);
                          } catch (err) {
                            setSearchError('User not found or error checking score');
                            setUserScore(null);
                          }
                        }}
                        disabled={!searchPassport.trim()}
                      >
                        Check Score
                      </Button>
                    </div>
                    
                    {searchError && (
                      <div className="text-red-600 text-sm">{searchError}</div>
                    )}
                    
                    {userScore !== null && (
                      <div className="p-4 border rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Risk Score:</span>
                          <Badge 
                            variant={userScore > 70 ? 'destructive' : userScore > 30 ? 'default' : 'secondary'}
                          >
                            {userScore}
                          </Badge>
                        </div>
                        {userScore > 70 && (
                          <div className="mt-2 text-sm text-red-600">
                            High risk user detected! Consider reviewing their activity.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Current Breach</TableHead>
                    <TableHead>Effect Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>
                        {breaches[company.id] ? (
                          <Badge variant={breaches[company.id].effect_score > 70 ? 'destructive' : 'default'}>
                            {breaches[company.id].breach_type}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {breaches[company.id] ? breaches[company.id].effect_score : '-'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedCompany(company.id)}
                        >
                          Check Users
                        </Button>
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
