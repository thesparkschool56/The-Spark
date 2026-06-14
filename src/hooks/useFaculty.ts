import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

export interface Faculty {
  id: string;
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
    const facultyRef = ref(db, 'faculty');
    const unsubscribe = onValue(facultyRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const dataArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })) as Faculty[];
          setFaculty(dataArray);
        } else {
          setFaculty([]);
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

  const groupedFaculty = faculty.reduce((acc, member) => {
    if (!acc[member.section]) acc[member.section] = [];
    acc[member.section].push(member);
    return acc;
  }, {} as Record<string, Faculty[]>);

  return { faculty, groupedFaculty, loading, error };
};
