import { createClient } from '@/utils/supabase/server';
import { ReviewUI } from './ReviewUI';
import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Separate admin client for logging scans without user session
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ReviewPage({ params }: { params: { restaurantId: string } }) {
  const { restaurantId } = await params;
  
  const supabase = await createClient();

  // Fetch restaurant details
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('id, business_name, google_place_id, ambiance_context, menu_urls')
    .eq('id', restaurantId)
    .single();

  if (error || !restaurant) {
    // If it's the demo ID, provide mock data
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
        />
      );
    }
    return notFound();
  }

  // Log the scan event
  await supabaseAdmin.from('analytics_events').insert({
    restaurant_id: restaurantId,
    event_type: 'scan'
  });

  return <ReviewUI restaurant={restaurant} />;
}
