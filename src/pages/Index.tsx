import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, Gift, Plus, Search, Clock, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers } from '@/hooks/useCustomers';
import { LoginForm } from '@/components/LoginForm';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { customers, loading: customersLoading, addCustomer, addCheckin } = useCustomers();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const handleCheckin = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a customer's phone number",
        variant: "destructive"
      });
      return;
    }

    const formattedPhone = formatPhone(phoneNumber);
    const existingCustomer = customers.find(c => c.phone === formattedPhone);

    try {
      if (existingCustomer) {
        await addCheckin(existingCustomer.id);
        const newVisits = (existingCustomer.visits || 0) + 1;
        
        if (newVisits === 5 || newVisits === 10) {
          toast({
            title: "🎉 Reward Earned!",
            description: newVisits === 5 ? "Customer earned: 10% Off Next Service" : "Customer earned: Free Basic Service",
            duration: 5000
          });
        } else {
          toast({
            title: "Visit logged successfully",
            description: `Customer now has ${newVisits} visits`,
          });
        }
      } else {
        const newCustomer = await addCustomer(formattedPhone);
        await addCheckin(newCustomer.id);
        
        toast({
          title: "New customer added",
          description: "First visit logged successfully",
        });
      }

      setPhoneNumber('');
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const getProgressPercentage = (visits: number) => {
    if (visits >= 10) return 100;
    if (visits >= 5) return ((visits - 5) / 5) * 100;
    return (visits / 5) * 100;
  };

  const getNextRewardText = (visits: number) => {
    if (visits >= 10) return "Max rewards achieved!";
    if (visits >= 5) return `${visits}/10 visits to free service`;
    return `${visits}/5 visits to 10% off`;
  };

  const totalVisits = customers.reduce((sum, c) => sum + (c.visits || 0), 0);
  const totalRewards = customers.filter(c => (c.visits || 0) >= 5).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Salon Loyalty Dashboard</h1>
            <p className="text-gray-600">Manage customer visits and track rewards</p>
          </div>
          <Button onClick={signOut} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Check-in Tab */}
          <TabsContent value="checkin" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Check-in Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    Customer Check-in
                  </CardTitle>
                  <CardDescription>
                    Enter customer's phone number to log their visit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="(555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCheckin()}
                      className="flex-1"
                    />
                    <Button onClick={handleCheckin} className="bg-blue-600 hover:bg-blue-700">
                      Log Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Visits</span>
                    <span className="font-semibold">{totalVisits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Unique Customers</span>
                    <span className="font-semibold">{customers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rewards Given</span>
                    <span className="font-semibold">{totalRewards}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Check-ins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Recent Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <div className="text-center py-4">Loading customers...</div>
                ) : (
                  <div className="space-y-3">
                    {customers.slice(0, 5).map((customer) => {
                      const progress = getProgressPercentage(customer.visits || 0);
                      
                      return (
                        <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{customer.phone}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={progress} className="flex-1 h-2" />
                              <span className="text-sm text-gray-600">
                                {getNextRewardText(customer.visits || 0)}
                              </span>
                            </div>
                          </div>
                          <Badge variant={customer.rewardEarned ? "default" : "secondary"}>
                            {customer.visits || 0} visits
                          </Badge>
                        </div>
                      );
                    })}
                    {customers.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No customers yet. Start by checking in your first customer!</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keep existing tabs content with real data */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Customer Database
                </CardTitle>
                <CardDescription>
                  View all customers and their visit history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input placeholder="Search by phone number..." className="max-w-md" />
                  </div>
                  
                  <div className="space-y-2">
                    {customers.map((customer) => {
                      const progress = getProgressPercentage(customer.visits || 0);
                      
                      return (
                        <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium">{customer.phone}</p>
                            <p className="text-sm text-gray-600">
                              Last visit: {customer.lastVisit?.toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={progress} className="flex-1 max-w-xs h-2" />
                              <span className="text-sm text-gray-600">
                                {getNextRewardText(customer.visits || 0)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={customer.rewardEarned ? "default" : "secondary"}>
                              {customer.visits || 0} visits
                            </Badge>
                            {customer.rewardEarned && (
                              <p className="text-sm text-emerald-600 mt-1">Reward earned!</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-emerald-600" />
                  Reward Settings
                </CardTitle>
                <CardDescription>
                  Configure reward thresholds and benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">10% Off Next Service</p>
                      <p className="text-sm text-gray-600">After 5 visits</p>
                    </div>
                    <Badge variant="outline">10%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Free Basic Service</p>
                      <p className="text-sm text-gray-600">After 10 visits</p>
                    </div>
                    <Badge variant="outline">Basic Cut</Badge>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Reward Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVisits}</div>
                  <p className="text-xs text-gray-600">All time visits</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
                  <Users className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customers.length}</div>
                  <p className="text-xs text-gray-600">Total customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rewards Given</CardTitle>
                  <Gift className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRewards}</div>
                  <p className="text-xs text-gray-600">Total rewards earned</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Most Loyal Customers</CardTitle>
                <CardDescription>Customers with the highest visit counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers
                    .sort((a, b) => (b.visits || 0) - (a.visits || 0))
                    .slice(0, 5)
                    .map((customer, index) => (
                      <div key={customer.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{customer.phone}</span>
                        </div>
                        <Badge>{customer.visits} visits</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
