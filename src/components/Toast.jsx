import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type === 'success' ? 'toast-success' : ''}`}>
          {t.type === 'success' ? (
            <CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} />
          ) : (
            <Info size={18} style={{ color: 'var(--primary)' }} />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
