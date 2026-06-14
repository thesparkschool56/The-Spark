import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

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
    const foundersRef = ref(db, 'founders');
    const unsubscribe = onValue(foundersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const dataArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })) as Founder[];
          
          const sortedFounders = dataArray.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFounders(sortedFounders);
        } else {
          setFounders([]);
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

  return { founders, loading, error };
};
