import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface JobPosition {
  id: number;
  title: string;
  description: string;
  department: string;
  campus_id: number;
  status: 'Open' | 'Closed';
  created_at: string;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('job_positions')
          .select('*')
          .eq('status', 'Open')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return { jobs, loading, error };
};
