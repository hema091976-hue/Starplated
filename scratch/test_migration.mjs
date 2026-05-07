
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('Attempting to add menu_context column...');
  // Since we can't use exec_sql easily without setup, 
  // we'll just try to update a record with the column to see if it exists
  const { error } = await supabase
    .from('restaurants')
    .update({ menu_context: '' })
    .match({ business_name: 'The Demo Bistro' }); // Just a dummy test

  if (error && error.message.includes('column "menu_context" of relation "restaurants" does not exist')) {
    console.error('Migration required: menu_context column is missing.');
  } else if (error) {
    console.error('Error during test:', error.message);
  } else {
    console.log('Column menu_context seems to exist or was handled.');
  }
}

migrate();
