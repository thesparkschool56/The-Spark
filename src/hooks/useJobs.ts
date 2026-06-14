import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

export interface JobPosition {
  id: string;
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
    const jobsRef = ref(db, 'job_positions');
    const unsubscribe = onValue(jobsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const dataArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })) as JobPosition[];
          
          const openJobs = dataArray
            .filter(j => j.status === 'Open')
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            
          setJobs(openJobs);
        } else {
          setJobs([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { jobs, loading, error };
};
