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

const projectRef = process.env.SUPABASE_PROJECT_REF || 'mswbdibtcnilsvxxtrdy';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN || '';

async function runMigration() {
  if (!accessToken) {
    console.log('ℹ️ Please provide SUPABASE_ACCESS_TOKEN environment variable to run remote migration API.');
    return;
  }

  console.log(`🚀 Connecting to Supabase Management API for project ${projectRef}...`);

  const sqlFilePath = path.join(__dirname, '..', 'supabase_schema.sql');
  const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sqlQuery })
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`❌ Migration failed with status ${response.status}:`, responseText);
      return;
    }

    console.log(`✅ Automated SQL migration executed successfully on Supabase!`);

    // Raw SQL run through the Management API doesn't trigger Supabase's usual
    // "reload schema" notification the dashboard/CLI sends after a migration.
    // Without this, PostgREST keeps serving its stale cached schema, so any
    // newly-added column is silently rejected on every write/select made
    // through the client SDK -- with no visible error, since most call sites
    // here swallow write failures. Always reload after applying this file.
    await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: "NOTIFY pgrst, 'reload schema';" })
    });
    console.log('🔄 Told PostgREST to reload its schema cache.');
  } catch (err) {
    console.error('❌ Network error during migration:', err);
  }
}

runMigration();
