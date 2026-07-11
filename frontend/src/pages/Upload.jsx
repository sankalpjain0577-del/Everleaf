import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
let modelsLoaded = false;

async function ensureModels() {
  if (modelsLoaded || !window.faceapi) return;
  await Promise.all([
    window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);
  modelsLoaded = true;
}

export default function Upload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [tagFaces, setTagFaces] = useState(true);

  const submit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;
    setBusy(true);
    setStatus('Uploading photos...');
    try {
      const form = new FormData();
      files.forEach((f) => form.append('photos', f));
      const res = await api.post('/gallery/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (tagFaces && window.faceapi) {
        setStatus('Detecting faces for smart search...');
        await ensureModels();
        // Re-fetch the newly uploaded photos to get their IDs and URLs
        const galleryRes = await api.get('/gallery');
        const recent = galleryRes.data.photos.filter((p) => p.burst_group === res.data.burst_group);

        for (const photo of recent) {
          try {
            const img = await window.faceapi.fetchImage(photo.url);
            const detections = await window.faceapi
              .detectAllFaces(img, new window.faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptors();
            if (detections.length > 0) {
              const descriptors = detections.map((d) => ({ descriptor: Array.from(d.descriptor) }));
              await api.post(`/gallery/${photo.id}/faces`, { descriptors });
            }
          } catch { /* skip photo on detection failure */ }
        }
      }

      setStatus(`Uploaded ${res.data.uploaded} photo${res.data.uploaded > 1 ? 's' : ''}.`);
      setTimeout(() => navigate('/gallery'), 800);
    } catch (err) {
      setStatus(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="eyebrow mb-2">Add to the album</p>
      <h1 className="font-display text-4xl mb-8">Upload your photos</h1>

      <form onSubmit={submit} className="card p-8 space-y-6">
        <div>
          <input type="file" accept="image/*" multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="block w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-forest file:text-ivory file:cursor-pointer" />
          {files.length > 0 && <p className="text-xs text-ink/50 mt-2">{files.length} file(s) selected · uploaded together as one burst so the best shot can be picked automatically.</p>}
        </div>

        <label className="flex items-center gap-3 text-sm text-ink/70">
          <input type="checkbox" checked={tagFaces} onChange={(e) => setTagFaces(e.target.checked)} className="accent-forest" />
          Run AI face detection so guests can find themselves later
        </label>

        <button disabled={busy || files.length === 0} className="btn-primary w-full">
          {busy ? 'Working...' : 'Upload'}
        </button>
        {status && <p className="text-sm text-ink/60">{status}</p>}
      </form>
    </div>
  );
}
