
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, Gift, Plus, Search, Clock } from 'lucide-react';

interface Customer {
  id: string;
  phone: string;
  visits: number;
  lastVisit: Date;
  rewardEarned?: boolean;
}

interface RewardRule {
  visits: number;
  description: string;
  type: 'discount' | 'free_item';
  value: string;
}

const Index = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', phone: '(555) 123-4567', visits: 7, lastVisit: new Date('2024-05-25') },
    { id: '2', phone: '(555) 987-6543', visits: 3, lastVisit: new Date('2024-05-24') },
    { id: '3', phone: '(555) 456-7890', visits: 10, lastVisit: new Date('2024-05-23'), rewardEarned: true },
  ]);
  
  const [rewardRules] = useState<RewardRule[]>([
    { visits: 5, description: '10% Off Next Service', type: 'discount', value: '10%' },
    { visits: 10, description: 'Free Basic Service', type: 'free_item', value: 'Basic Cut' },
  ]);

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const handleCheckin = () => {
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

    if (existingCustomer) {
      const updatedCustomers = customers.map(c => 
        c.phone === formattedPhone 
          ? { ...c, visits: c.visits + 1, lastVisit: new Date() }
          : c
      );
      setCustomers(updatedCustomers);
      
      const newVisits = existingCustomer.visits + 1;
      const earnedReward = rewardRules.find(r => r.visits === newVisits);
      
      if (earnedReward) {
        toast({
          title: "🎉 Reward Earned!",
          description: `Customer earned: ${earnedReward.description}`,
          duration: 5000
        });
      } else {
        toast({
          title: "Visit logged successfully",
          description: `Customer now has ${newVisits} visits`,
        });
      }
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        phone: formattedPhone,
        visits: 1,
        lastVisit: new Date()
      };
      setCustomers([...customers, newCustomer]);
      
      toast({
        title: "New customer added",
        description: "First visit logged successfully",
      });
    }

    setPhoneNumber('');
  };

  const getNextReward = (visits: number) => {
    return rewardRules.find(r => r.visits > visits) || rewardRules[rewardRules.length - 1];
  };

  const getProgressPercentage = (visits: number) => {
    const nextReward = getNextReward(visits);
    if (!nextReward) return 100;
    return (visits / nextReward.visits) * 100;
  };

  const totalVisits = customers.reduce((sum, c) => sum + c.visits, 0);
  const totalRewards = customers.filter(c => c.rewardEarned).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Salon Loyalty Dashboard</h1>
          <p className="text-gray-600">Manage customer visits and track rewards</p>
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
                <div className="space-y-3">
                  {customers.slice(0, 5).map((customer) => {
                    const nextReward = getNextReward(customer.visits);
                    const progress = getProgressPercentage(customer.visits);
                    
                    return (
                      <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{customer.phone}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={progress} className="flex-1 h-2" />
                            <span className="text-sm text-gray-600">
                              {customer.visits}/{nextReward?.visits} visits
                            </span>
                          </div>
                        </div>
                        <Badge variant={customer.rewardEarned ? "default" : "secondary"}>
                          {customer.visits} visits
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
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
                      const nextReward = getNextReward(customer.visits);
                      const progress = getProgressPercentage(customer.visits);
                      
                      return (
                        <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium">{customer.phone}</p>
                            <p className="text-sm text-gray-600">
                              Last visit: {customer.lastVisit.toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={progress} className="flex-1 max-w-xs h-2" />
                              <span className="text-sm text-gray-600">
                                {customer.visits}/{nextReward?.visits} visits to next reward
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={customer.rewardEarned ? "default" : "secondary"}>
                              {customer.visits} visits
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

          {/* Rewards Tab */}
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
                  {rewardRules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{rule.description}</p>
                        <p className="text-sm text-gray-600">After {rule.visits} visits</p>
                      </div>
                      <Badge variant="outline">{rule.value}</Badge>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Reward Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
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
                    .sort((a, b) => b.visits - a.visits)
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
