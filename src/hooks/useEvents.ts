import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  image_url: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventsRef = ref(db, 'events');
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
            id,
            ...val
          })) as Event[];
          
          // Filter out past events to match previous behavior if needed, or just set all
          const today = new Date().toISOString();
          const futureEvents = dataArray.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
          
          setEvents(futureEvents);
        } else {
          setEvents([]);
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

  return { events, loading, error };
};
