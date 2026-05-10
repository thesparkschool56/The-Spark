import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    const getInitialScores = async () => {
      const { data } = await supabase
        .from('scoreboard')
        .select('*')
        .eq('campus_id', campusId);
      setScores(data || []);
      setLoading(false);
    };
    getInitialScores();

    const channel = supabase
      .channel(`public:scoreboard:${campusId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scoreboard' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newScore = payload.new as HouseScore;
            if (String(newScore.campus_id) === campusId) {
              setScores(prev => [...prev, newScore]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as HouseScore;
            if (String(updated.campus_id) === campusId) {
              setScores(prev => prev.map(s => s.id === updated.id ? updated : s));
            }
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setScores(prev => prev.filter(s => s.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campusId]);

  return { scores, loading };
};
