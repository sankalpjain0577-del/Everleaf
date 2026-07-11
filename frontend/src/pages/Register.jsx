import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('couple');
  const [form, setForm] = useState({ name: '', email: '', password: '', event_title: '', event_code: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [createdCode, setCreatedCode] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await register({ ...form, role });
      if (role === 'couple') {
        setCreatedCode(user.event_code);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (createdCode) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="eyebrow mb-2">Your event is live</p>
        <h1 className="font-display text-3xl mb-6">Share this code with your guests</h1>
        <div className="card p-8">
          <span className="seal text-lg px-6 py-3">{createdCode}</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-8">Go to dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <p className="eyebrow mb-2">Join Everleaf</p>
      <h1 className="font-display text-3xl mb-8">Create your account</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setRole('couple')}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium border ${role === 'couple' ? 'bg-forest text-ivory border-forest' : 'border-ink/20 text-ink/70'}`}>
          I'm the couple
        </button>
        <button onClick={() => setRole('guest')}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium border ${role === 'guest' ? 'bg-forest text-ivory border-forest' : 'border-ink/20 text-ink/70'}`}>
          I'm a guest
        </button>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-4">
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-ink/50">Full name</label>
          <input className="input mt-1" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-ink/50">Email</label>
          <input className="input mt-1" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-ink/50">Password</label>
          <input className="input mt-1" type="password" required minLength={8} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {role === 'couple' ? (
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-ink/50">Event name</label>
            <input className="input mt-1" placeholder="Priya & Arjun's Wedding" required value={form.event_title}
              onChange={(e) => setForm({ ...form, event_title: e.target.value })} />
          </div>
        ) : (
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-ink/50">Event code</label>
            <input className="input mt-1 font-mono uppercase" placeholder="6Z8E62" required value={form.event_code}
              onChange={(e) => setForm({ ...form, event_code: e.target.value })} />
          </div>
        )}
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Creating account...' : 'Create account'}</button>
      </form>
      <p className="text-sm text-ink/60 mt-4">
        Already have an account? <Link to="/login" className="text-forest underline">Sign in</Link>
      </p>
    </div>
  );
}
