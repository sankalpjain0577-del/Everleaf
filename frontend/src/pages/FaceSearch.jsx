import React, { useState } from 'react';
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

export default function FaceSearch() {
  const [selfie, setSelfie] = useState(null);
  const [preview, setPreview] = useState(null);
  const [matches, setMatches] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setSelfie(f);
    setPreview(URL.createObjectURL(f));
    setMatches(null);
  };

  const search = async () => {
    if (!selfie || !window.faceapi) return;
    setBusy(true);
    setStatus('Reading your selfie...');
    try {
      await ensureModels();
      const img = await window.faceapi.bufferToImage(selfie);
      const detection = await window.faceapi
        .detectSingleFace(img, new window.faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus('No face detected in that photo — try a clearer, front-facing selfie.');
        setMatches([]);
        return;
      }
      setStatus('Searching the gallery...');
      const res = await api.post('/gallery/face-search', { descriptor: Array.from(detection.descriptor) });
      setMatches(res.data.matches);
      setStatus(res.data.matches.length === 0 ? 'No matches yet — more photos may still be processing.' : '');
    } catch (err) {
      setStatus('Something went wrong reading that photo. Please try another.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="eyebrow mb-2">AI face search</p>
      <h1 className="font-display text-4xl mb-3">Find yourself in the gallery</h1>
      <p className="text-ink/60 mb-8">Upload a clear selfie and Everleaf will match it against every photo guests have shared so far.</p>

      <div className="card p-8 space-y-6">
        <input type="file" accept="image/*" capture="user" onChange={onFile}
          className="block w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-forest file:text-ivory file:cursor-pointer" />
        {preview && <img src={preview} alt="Selfie preview" className="w-32 h-32 object-cover rounded-full border border-ink/10" />}
        <button onClick={search} disabled={!selfie || busy} className="btn-primary w-full">
          {busy ? 'Searching...' : 'Find my photos'}
        </button>
        {status && <p className="text-sm text-ink/60">{status}</p>}
      </div>

      {matches && matches.length > 0 && (
        <div className="mt-10">
          <p className="eyebrow mb-4">{matches.length} photo(s) found</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {matches.map((m) => (
              <div key={m.photo_id} className="relative card overflow-hidden">
                <img src={m.url} alt="" className="w-full aspect-square object-cover" />
                {m.is_best_shot ? <span className="absolute top-2 left-2 seal bg-ivory/90">★ best</span> : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
