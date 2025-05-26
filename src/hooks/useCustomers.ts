
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  phone: string;
  created_at: string;
  visits?: number;
  lastVisit?: Date;
  rewardEarned?: boolean;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          checkins!inner(*)
        `);

      if (error) throw error;

      // Process customers with visit counts
      const processedCustomers = data?.map(customer => {
        const visits = customer.checkins?.length || 0;
        const lastCheckin = customer.checkins?.sort((a: any, b: any) => 
          new Date(b.checkin_time).getTime() - new Date(a.checkin_time).getTime()
        )[0];

        return {
          id: customer.id,
          phone: customer.phone,
          created_at: customer.created_at,
          visits,
          lastVisit: lastCheckin ? new Date(lastCheckin.checkin_time) : new Date(customer.created_at),
          rewardEarned: visits >= 5 // Simple reward logic for now
        };
      }) || [];

      setCustomers(processedCustomers);
    } catch (error: any) {
      toast({
        title: "Error fetching customers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (phone: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ phone }])
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers(); // Refresh the list
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding customer",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const addCheckin = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('checkins')
        .insert([{ 
          customer_id: customerId,
          staff_user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      await fetchCustomers(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error adding check-in",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    addCustomer,
    addCheckin,
    refetch: fetchCustomers
  };
};
