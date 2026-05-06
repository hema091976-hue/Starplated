'use server'

import { createClient } from '@/utils/supabase/server'

export async function logScanEvent(restaurantId: string) {
  // If it's the demo restaurant or not a UUID, don't try to log it
  if (restaurantId === 'demo-restaurant' || restaurantId.length !== 36) return;

  try {
    const supabase = await createClient();
    await supabase.from('analytics_events').insert({
      restaurant_id: restaurantId,
      event_type: 'scan'
    });
  } catch (error) {
    console.error('Failed to log scan event', error);
  }
}
