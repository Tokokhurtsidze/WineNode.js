import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface HeroData {
  video?: string;
  posterUrl?: string;
}

export default function Hero() {
  const [data, setData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'heroSection'),
      (snap) => {
        if (!snap.empty) setData(snap.docs[0].data() as HeroData);
        setLoading(false);
      },
      (err) => { console.error('Error fetching hero:', err); setLoading(false); }
    );
    return unsub;
  }, []);

  if (loading) return <div className="h-screen bg-black" />;

  return (
    <section className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden bg-black">
      {data?.video && (
        <video
          src={data.video}
          poster={data.posterUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover object-center z-0 scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10" />
    </section>
  );
}
