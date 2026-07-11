import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Upload from './pages/Upload';
import FaceSearch from './pages/FaceSearch';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/face-search" element={<ProtectedRoute roles={['guest']}><FaceSearch /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="border-t border-ink/10 py-8 text-center text-xs text-ink/40 font-mono">
        EVERLEAF — AI WEDDING GALLERY
      </footer>
    </div>
  );
}
