import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    api.get('/gallery').then((res) => {
      setPhotos(res.data.photos);
      setEvent(res.data.event);
    }).catch(() => {});
  }, []);

  const bestShots = photos.filter((p) => p.is_best_shot);

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <p className="eyebrow mb-2">Dashboard</p>
      <h1 className="font-display text-4xl mb-1">{event?.title || 'Your event'}</h1>
      <p className="text-ink/60 mb-8">Signed in as <span className="font-medium">{user?.name}</span> · {user?.role}</p>

      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        <div className="card p-6">
          <p className="eyebrow mb-2">Event code</p>
          <span className="seal text-base px-4 py-2">{event?.code || user?.event_code}</span>
        </div>
        <div className="card p-6">
          <p className="eyebrow mb-2">Total photos</p>
          <p className="font-display text-3xl">{photos.length}</p>
        </div>
        <div className="card p-6">
          <p className="eyebrow mb-2">Best shots tagged</p>
          <p className="font-display text-3xl">{bestShots.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link to="/upload" className="btn-primary">Upload photos</Link>
        <Link to="/gallery" className="btn-secondary">View gallery</Link>
        {user?.role === 'guest' && <Link to="/face-search" className="btn-secondary">Find my photos</Link>}
      </div>
    </div>
  );
}
