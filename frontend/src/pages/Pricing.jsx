import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function Pricing() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.get('/pricing').then((res) => setPlans(res.data.plans));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <p className="eyebrow mb-2 text-center">Pricing</p>
      <h1 className="font-display text-4xl text-center mb-14">One price per event, not per month</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`card p-8 flex flex-col ${plan.id === 'plus' ? 'border-gold border-2' : ''}`}>
            {plan.id === 'plus' && <span className="seal self-start mb-4">Most chosen</span>}
            <h2 className="font-display text-2xl text-forest">{plan.name}</h2>
            <p className="mt-2 text-3xl font-display">
              {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
              <span className="text-sm text-ink/50 font-body"> {plan.period}</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink/70 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2"><span className="text-gold">✦</span>{f}</li>
              ))}
            </ul>
            <Link to="/register" className="btn-primary text-center mt-8">Choose {plan.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
