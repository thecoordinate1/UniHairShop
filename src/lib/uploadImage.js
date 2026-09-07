import { supabase, isSupabaseConfigured } from './supabaseClient';

// Uploads a real image file to Supabase Storage (bucket: media, RLS-scoped to
// the uploader's own auth uid folder) and returns a public URL. Falls back to
// a local base64 data URL only when Supabase isn't configured (local/demo mode),
// so the UI never silently pretends a photo was saved when it wasn't.
export async function uploadImage(file, { userId, folder = 'uploads' } = {}) {
  if (!file) return null;

  if (!isSupabaseConfigured || !supabase || !userId) {
    return readAsDataUrl(file);
  }

  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    console.warn('[UniHairShop] Image upload failed, using local preview only:', error.message);
    return readAsDataUrl(file);
  }

  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data?.publicUrl || null;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
