import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('Adding invite_slug column...');
  
  // 1. Add the column if it doesn't exist
  const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
    sql_query: 'ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS invite_slug TEXT UNIQUE;'
  });
  
  if (alterError) {
    // If RPC isn't available, we might need a different way, but let's try this.
    console.log('RPC failed, trying raw query if possible or assuming it exists.');
  }

  // 2. Backfill Capri Revere
  const { error: updateError } = await supabaseAdmin
    .from('restaurants')
    .update({ invite_slug: 'capri-revere' })
    .ilike('business_name', 'Capri Revere');

  if (updateError) console.error('Update error:', updateError);
  else console.log('Successfully backfilled Capri Revere slug.');
}

migrate();
