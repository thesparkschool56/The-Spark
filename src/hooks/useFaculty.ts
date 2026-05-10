import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Faculty {
  id: number;
  name: string;
  role: string;
  section: 'Primary' | 'Secondary' | 'Senior' | 'Admin';
  image_url: string;
  subject: string;
}

export const useFaculty = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const { data, error } = await supabase
          .from('faculty')
          .select('*');

        if (error) throw error;
        setFaculty(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const groupedFaculty = faculty.reduce((acc, member) => {
    if (!acc[member.section]) acc[member.section] = [];
    acc[member.section].push(member);
    return acc;
  }, {} as Record<string, Faculty[]>);

  return { faculty, groupedFaculty, loading, error };
};
