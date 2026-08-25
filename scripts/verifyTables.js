const projectRef = process.env.SUPABASE_PROJECT_REF || 'mswbdibtcnilsvxxtrdy';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN || '';

async function verifyTables() {
  if (!accessToken) {
    console.log('ℹ️ Provide SUPABASE_ACCESS_TOKEN env variable to run database inspection.');
    return;
  }

  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const tables = await response.json();
  console.log('📋 Public Tables currently live in Supabase:');
  console.table(tables);
}

verifyTables();
