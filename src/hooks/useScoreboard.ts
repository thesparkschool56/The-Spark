import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

export interface HouseScore {
  id: string;
  house_name: string;
  points: number;
  color_hex: string;
  campus_id: string;
}

export const useScoreboard = (campusId: string) => {
  const [scores, setScores] = useState<HouseScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scoreboardRef = ref(db, 'scoreboard');
    const unsubscribe = onValue(scoreboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const dataArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as HouseScore[];
        
        // Filter by campusId
        const filtered = dataArray.filter(s => String(s.campus_id) === String(campusId));
        setScores(filtered);
      } else {
        setScores([]);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [campusId]);

  return { scores, loading };
};
