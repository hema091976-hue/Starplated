import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  // Auth check - only admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user.email !== 'admmin@starplated.com' && user.email !== 'admin@starplated.com')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const admin = createSupabaseAdmin(supabaseUrl, serviceKey);

  try {
    const { restaurantId, status } = await request.json();

    const validStatuses = ['trialing', 'active', 'canceled', 'past_due'];
    if (!restaurantId || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid restaurantId or status.' }, { status: 400 });
    }

    const { error } = await admin
      .from('restaurants')
      .update({ subscription_status: status })
      .eq('id', restaurantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, restaurantId, status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
