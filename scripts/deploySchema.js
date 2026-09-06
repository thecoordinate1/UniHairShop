import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local if present
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mswbdibtcnilsvxxtrdy.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function runDeploy() {
  console.log('🚀 Checking Supabase connection and tables...');

  // Seed vendor profiles
  console.log('🌱 Seeding/Verifying vendor profiles...');
  const { error: vErr } = await supabase.from('vendor_profiles').upsert([
    {
      id: 'stf-1',
      name: 'Junior "The Fade King"',
      role: 'Master Barber & Stylist',
      campus: 'UNILUS Silverest Campus',
      dorm_location: 'Silverest Hostel, Block C, Room 14',
      avatar: '/images/barber_service.jpg',
      is_verified: true,
      badge: 'Verified Campus Stylist',
      travels_to_dorm: true,
      travel_fee: 20,
      has_studio: true,
      phone: '0971234567',
      bio: 'Campus favorite barber at UNILUS Silverest. 4+ years precision fades and beard sculpting. I travel to student rooms or host in Block C!',
      rating: 4.9,
      reviews_count: 128,
      payout_provider: 'Airtel Money',
      payout_number: '0971234567'
    },
    {
      id: 'stf-2',
      name: 'Thandiwe Banda',
      role: 'Lead Natural Hair & Braids Specialist',
      campus: 'UNILUS Silverest Campus',
      dorm_location: 'Silverest Girls Hostel, Block A, Room 08',
      avatar: '/images/hair_braids.jpg',
      is_verified: true,
      badge: 'Verified Campus Stylist',
      travels_to_dorm: true,
      travel_fee: 25,
      has_studio: true,
      phone: '0977654321',
      bio: 'Specialist in painless knotless braids, stitch lines, wig styling and natural hair maintenance for university students.',
      rating: 5.0,
      reviews_count: 94,
      payout_provider: 'MTN Mobile Money',
      payout_number: '0977654321'
    }
  ]);

  if (vErr) {
    console.log('Notice on vendor_profiles:', vErr.message);
  } else {
    console.log('✅ Vendor profiles synced successfully!');
  }
}

runDeploy();
