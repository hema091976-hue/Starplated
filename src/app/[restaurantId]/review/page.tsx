import { createClient } from '@/utils/supabase/server';
import { ReviewUI } from './ReviewUI';
import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ReviewPage({ params }: { params: { restaurantId: string } }) {
  const { restaurantId } = await params;
  const sessionId = Math.random().toString(36).substring(2, 15);
  
  const supabase = await createClient();

  const { data: restaurant, error } = await supabaseAdmin
    .from('restaurants')
    .select('id, business_name, google_place_id, ambiance_context, menu_urls')
    .eq('id', restaurantId)
    .single();

  if (error || !restaurant) {
    if (restaurantId === 'demo-restaurant') {
      return (
        <ReviewUI 
          restaurant={{ 
            id: 'demo-restaurant', 
            business_name: 'The Demo Bistro', 
            google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
            ambiance_context: 'A cozy, modern bistro with artisanal coffee and homemade pastries.',
            menu_urls: []
          }} 
          sessionId={sessionId}
        />
      );
    }
    return notFound();
  }

  // Log the scan event with session ID
  await supabaseAdmin.from('analytics_events').insert({
    restaurant_id: restaurantId,
    event_type: 'scan',
    session_id: sessionId
  });

  return <ReviewUI restaurant={restaurant} sessionId={sessionId} />;
}
