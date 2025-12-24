import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceRecord, WorkOrder } from '@/types/database';
import { toast } from 'sonner';

// Maintenance Records
export function useMaintenanceRecords() {
  return useQuery({
    queryKey: ['maintenance-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          bus:buses(*)
        `)
        .order('scheduled_date', { ascending: false });
      
      if (error) throw error;
      return data as MaintenanceRecord[];
    },
  });
}

export function useCreateMaintenanceRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (record: Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at' | 'bus'>) => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .insert(record)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      toast.success('Maintenance record created');
    },
    onError: (error) => {
      toast.error('Failed to create record: ' + error.message);
    },
  });
}

export function useUpdateMaintenanceRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...record }: Partial<MaintenanceRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .update(record)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      toast.success('Maintenance record updated');
    },
    onError: (error) => {
      toast.error('Failed to update record: ' + error.message);
    },
  });
}

// Work Orders
export function useWorkOrders() {
  return useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          bus:buses(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkOrder[];
    },
  });
}

export function useMyWorkOrders() {
  return useQuery({
    queryKey: ['my-work-orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          bus:buses(*)
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkOrder[];
    },
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at' | 'bus'>) => {
      const { data, error } = await supabase
        .from('work_orders')
        .insert(order)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-work-orders'] });
      toast.success('Work order created');
    },
    onError: (error) => {
      toast.error('Failed to create work order: ' + error.message);
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...order }: Partial<WorkOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update(order)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-work-orders'] });
      toast.success('Work order updated');
    },
    onError: (error) => {
      toast.error('Failed to update work order: ' + error.message);
    },
  });
}
