import { supabase } from './supabaseClient';

// Starts a real mobile money collection against an existing booking or
// order. The server (initiate-payment Edge Function) re-derives and
// validates the amount itself — this is a thin, trusting wrapper.
export async function initiatePayment({ type, id, amount, phone, provider }) {
  const { data, error } = await supabase.functions.invoke('initiate-payment', {
    body: { type, id, amount, phone, provider }
  });
  if (error) {
    throw new Error(error.message || 'Unable to start payment.');
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  return data;
}

// Polls payment_transactions (readable via the existing participant RLS
// policy) until the payment-webhook Edge Function marks it paid/failed, or
// the timeout elapses.
export async function pollPaymentStatus(depositId, { intervalMs = 3000, timeoutMs = 90000 } = {}) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const { data } = await supabase
      .from('payment_transactions')
      .select('status')
      .eq('provider_reference', depositId)
      .maybeSingle();
    if (data?.status === 'paid') return 'paid';
    if (data?.status === 'failed') return 'failed';
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return 'timeout';
}

export const PAWAPAY_PROVIDERS = [
  { code: 'AIRTEL_OAPI_ZMB', label: 'Airtel Money', shortLabel: 'Airtel', brandClass: 'airtel' },
  { code: 'MTN_MOMO_ZMB', label: 'MTN Mobile Money', shortLabel: 'MTN', brandClass: 'mtn' },
  { code: 'ZAMTEL_ZMB', label: 'Zamtel Kwacha', shortLabel: 'Zamtel', brandClass: 'zamtel' }
];
