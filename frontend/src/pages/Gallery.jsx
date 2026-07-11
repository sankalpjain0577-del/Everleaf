import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Gallery() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/gallery').then((res) => setPhotos(res.data.photos)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    if (!confirm('Delete this photo?')) return;
    await api.delete(`/gallery/${id}`);
    load();
  };

  const visible = filter === 'best' ? photos.filter((p) => p.is_best_shot) : photos;

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-2">Shared gallery</p>
          <h1 className="font-display text-4xl">Every guest, one album</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm border ${filter === 'all' ? 'bg-forest text-ivory border-forest' : 'border-ink/20'}`}>All ({photos.length})</button>
          <button onClick={() => setFilter('best')} className={`px-4 py-2 rounded-full text-sm border ${filter === 'best' ? 'bg-forest text-ivory border-forest' : 'border-ink/20'}`}>★ Best shots ({photos.filter(p => p.is_best_shot).length})</button>
        </div>
      </div>

      {loading ? (
        <p className="text-ink/50">Loading gallery...</p>
      ) : visible.length === 0 ? (
        <div className="card p-12 text-center text-ink/60">
          No photos yet. Be the first to <a href="/upload" className="text-forest underline">upload one</a>.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {visible.map((p) => (
            <div key={p.id} className="relative group card overflow-hidden">
              <img src={p.url} alt="" className="w-full aspect-square object-cover" />
              {p.is_best_shot ? <span className="absolute top-2 left-2 seal bg-ivory/90">★ best</span> : null}
              {(p.uploader_id === user?.id || user?.role === 'couple') && (
                <button onClick={() => remove(p.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-ivory/90 text-ink text-xs rounded-full px-2 py-1">
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
