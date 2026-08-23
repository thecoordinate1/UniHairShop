import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts, dismissToast } = useApp();

  if (!toasts.length) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle size={18} className="text-[#FF2D55] shrink-0" />;
      default:
        return <Info size={18} className="text-[#007AFF] shrink-0" />;
    }
  };

  return (
    <div className="toast-container" role="status" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type === 'success' ? 'toast-success' : t.type === 'error' ? 'toast-error' : ''}`}
          onClick={() => dismissToast(t.id)}
          role="alert"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dismissToast(t.id); }}
          aria-label={`${t.type}: ${t.message}. Click to dismiss.`}
        >
          {getIcon(t.type)}
          <span className="flex-1 text-left">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
