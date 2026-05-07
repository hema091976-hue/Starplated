
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching schema:', error);
  } else {
    console.log('Columns in restaurants table:', Object.keys(data[0] || {}));
  }
}

checkSchema();
