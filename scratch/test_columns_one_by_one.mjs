
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testColumns() {
  const columns = ['id', 'business_name', 'google_place_id', 'ambiance_context', 'menu_urls'];
  
  for (const col of columns) {
    const { error } = await supabase.from('restaurants').select(col).limit(1);
    if (error) {
      console.log(`Column ${col} FAILED:`, error.message);
    } else {
      console.log(`Column ${col} OK`);
    }
  }
}

testColumns();
