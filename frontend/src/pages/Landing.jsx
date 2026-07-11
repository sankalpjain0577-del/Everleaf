import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="eyebrow mb-4">A shared album, wherever your guests are</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink">
            Every guest's camera roll, <span className="italic text-forest">woven into one</span> wedding gallery.
          </h1>
          <p className="mt-6 text-ink/70 text-lg leading-relaxed max-w-md">
            Guests upload from their phones. Everleaf quietly sorts the blurry from the beautiful,
            separates the couple from the crowd, and helps everyone find themselves in the reel —
            without ever leaving the venue's wifi.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">Create your event</Link>
            <Link to="/pricing" className="btn-secondary">See pricing</Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-ink/50 font-mono">
            <span>01 — Upload</span>
            <span>02 — Sort</span>
            <span>03 — Find yourself</span>
          </div>
        </div>
        <div className="relative">
          <div className="card p-6 -rotate-2">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-forest-light/30 to-blush/40" />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="seal">EVENT: 6Z8E62</span>
              <span className="font-mono text-xs text-gold">★ best shot</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white/40">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
          {[
            { title: 'Bride & groom, separated', body: 'Reference photos let the couple pull every shot they\'re in, apart from the rest of the crowd.' },
            { title: 'Guest selfie search', body: 'Guests snap a selfie and instantly see every photo they appear in — no scrolling required.' },
            { title: 'Best shot, chosen for you', body: 'Burst uploads are compared for sharpness so the clearest frame rises to the top automatically.' }
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="font-display text-xl text-forest mb-2">{f.title}</h3>
              <p className="text-sm text-ink/70 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
