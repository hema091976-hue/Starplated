import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const email = `test-mailed-${Date.now()}@example.com`;
  
  // 1. Create user
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: 'SecurePassword123!',
    app_metadata: { is_mailed: true }
  });
  
  if (userError) {
    console.error('Error creating user', userError);
    return;
  }
  
  console.log('User created:', userData.user.id);
  
  // 2. Generate link
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email
  });
  
  if (linkError) {
    console.error('Error generating link', linkError);
    return;
  }
  
  console.log('Action Link:', linkData.properties.action_link);
  
  // Clean up
  await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
}

test();
