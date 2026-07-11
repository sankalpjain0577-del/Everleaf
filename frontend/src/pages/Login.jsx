import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <p className="eyebrow mb-2">Welcome back</p>
      <h1 className="font-display text-3xl mb-8">Sign in to Everleaf</h1>
      <form onSubmit={submit} className="card p-6 space-y-4">
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-ink/50">Email</label>
          <input className="input mt-1" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-ink/50">Password</label>
          <input className="input mt-1" type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p className="text-sm text-ink/60 mt-4">
        New here? <Link to="/register" className="text-forest underline">Create an event or join one</Link>
      </p>
    </div>
  );
}
