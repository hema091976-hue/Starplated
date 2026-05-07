import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Add menu_context column — safe to run multiple times (IF NOT EXISTS)
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_context text DEFAULT '';`
    });

    if (error) {
      // Try alternative: just do a test select to see if column already exists
      const { data, error: selectError } = await supabaseAdmin
        .from('restaurants')
        .select('menu_context')
        .limit(1);

      if (selectError && selectError.message.includes('menu_context')) {
        return NextResponse.json({ 
          error: 'Column does not exist and could not be added via RPC. Please add it manually in Supabase SQL editor.',
          sql: 'ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_context text DEFAULT \'\';',
          rpcError: error.message
        }, { status: 500 });
      }

      // Column already exists
      return NextResponse.json({ success: true, message: 'Column menu_context already exists' });
    }

    return NextResponse.json({ success: true, message: 'Column menu_context added successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
