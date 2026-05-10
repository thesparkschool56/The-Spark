import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  order: number;
}

export const useFounders = () => {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        const { data, error } = await supabase
          .from('founders')
          .select('*')
          .order('order', { ascending: true });

        if (error) throw error;
        setFounders(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFounders();
  }, []);

  return { founders, loading, error };
};
