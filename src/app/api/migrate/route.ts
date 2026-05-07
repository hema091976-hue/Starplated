import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Add menu_context to restaurants
    await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_context text DEFAULT '';`
    }).catch(() => {});

    // 2. Add session_id to analytics_events for accurate conversion tracking
    // We try multiple ways because exec_sql might be missing
    const { error: sessionError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS session_id text;`
    });

    if (sessionError) {
      return NextResponse.json({ 
        error: 'Could not run migration via RPC. Please run this SQL manually in Supabase:',
        sql: `
          ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_context text DEFAULT '';
          ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS session_id text;
        `
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Migrations applied successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
