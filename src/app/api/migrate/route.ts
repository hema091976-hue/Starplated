import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const results = [];

    // 1. Add menu_context to restaurants
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_context text DEFAULT '';`
      });
      if (error) throw error;
      results.push('restaurants.menu_context added or already exists');
    } catch (e: any) {
      results.push(`restaurants.menu_context FAILED: ${e.message}`);
    }

    // 2. Add session_id to analytics_events
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS session_id text;`
      });
      if (error) throw error;
      results.push('analytics_events.session_id added or already exists');
    } catch (e: any) {
      results.push(`analytics_events.session_id FAILED: ${e.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration process completed',
      results 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
