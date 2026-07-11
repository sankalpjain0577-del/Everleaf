import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-ivory/85 border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl text-forest tracking-tight">
          Everleaf
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-body text-sm text-ink/80">
          <Link to="/pricing" className="hover:text-forest">Pricing</Link>
          {user && <Link to="/dashboard" className="hover:text-forest">Dashboard</Link>}
          {user && <Link to="/gallery" className="hover:text-forest">Gallery</Link>}
          {user?.role === 'guest' && <Link to="/face-search" className="hover:text-forest">Find My Photos</Link>}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline seal">{user.event_code}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Sign in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
