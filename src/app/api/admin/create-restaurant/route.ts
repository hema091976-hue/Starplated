import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  // Auth check - only admin can use this
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user.email !== 'admmin@starplated.com' && user.email !== 'admin@starplated.com')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server configuration error: missing service key.' }, { status: 500 });
  }

  const admin = createSupabaseAdmin(supabaseUrl, serviceKey);

  try {
    const body = await request.json();
    const { businessName, tempEmail, googlePlaceId, description, menuContext, logoUrl } = body;

    if (!businessName || !tempEmail) {
      return NextResponse.json({ error: 'Business Name and Email are required.' }, { status: 400 });
    }

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 1. Create Auth User
    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email: tempEmail,
      email_confirm: true,
      password: Math.random().toString(36).slice(-10) + 'A1!',
      app_metadata: { is_mailed: true, invite_slug: slug },
      user_metadata: { business_name: businessName },
    });

    if (userError) {
      return NextResponse.json({ error: 'Auth Failed: ' + userError.message }, { status: 400 });
    }

    const userId = userData.user.id;

    // 2. Create Restaurant Record
    const { error: restError } = await admin.from('restaurants').upsert({
      id: userId,
      business_name: businessName,
      google_place_id: googlePlaceId || null,
      ambiance_context: description || null,
      menu_context: menuContext || null,
      logo_url: logoUrl || null,
      subscription_status: 'trialing',
    });

    if (restError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Database Failed: ' + restError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: userId, businessName, slug });
  } catch (e: any) {
    return NextResponse.json({ error: 'Unexpected error: ' + e.message }, { status: 500 });
  }
}
