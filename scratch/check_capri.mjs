import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('id, business_name')
    .ilike('business_name', '%Capri%');
    
  console.log('Match results:', data);
  if (error) console.error('Error:', error);
}

check();
