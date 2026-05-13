import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { AdminDashboardClient } from './AdminDashboardClient';

export default async function AdminInvitePage(props: {
  searchParams: Promise<{ error?: string; success?: string; slug?: string; businessName?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user.email !== 'admmin@starplated.com' && user.email !== 'admin@starplated.com')) {
    redirect('/dashboard');
  }

  const headerList = await headers();
  const host = headerList.get('host') || 'starplated.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: allRestaurants }, { data: { users } }] = await Promise.all([
    supabaseAdmin.from('restaurants').select('id, business_name, created_at, google_place_id, subscription_status'),
    supabaseAdmin.auth.admin.listUsers(),
  ]);

  const restaurants = (allRestaurants || [])
    .map(rest => {
      const owner = users.find(u => u.id === rest.id);
      const isMailed = owner?.app_metadata?.is_mailed === true;
      return { ...rest, isMailed, email: owner?.email || '' };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  async function createMailedRestaurant(formData: FormData) {
    'use server';
    try {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!serviceKey || !supabaseUrl) {
        return redirect(`/dashboard/admin/invite?error=${encodeURIComponent('Config Error: SUPABASE_SERVICE_ROLE_KEY missing.')}`);
      }
      const admin = createSupabaseAdmin(supabaseUrl, serviceKey);

      const businessName = (formData.get('business_name') as string)?.trim();
      const tempEmail = (formData.get('temp_email') as string)?.trim();
      const googlePlaceId = (formData.get('google_place_id') as string)?.trim();
      const description = formData.get('description') as string;
      const menuContext = formData.get('menu_context') as string;

      if (!businessName || !tempEmail) {
        return redirect(`/dashboard/admin/invite?error=${encodeURIComponent('Business Name and Email are required.')}`);
      }

      const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const { data: userData, error: userError } = await admin.auth.admin.createUser({
        email: tempEmail,
        email_confirm: true,
        password: Math.random().toString(36).slice(-10) + 'A1!',
        app_metadata: { is_mailed: true, invite_slug: slug },
        user_metadata: { business_name: businessName },
      });

      if (userError) {
        return redirect(`/dashboard/admin/invite?error=${encodeURIComponent('Auth Failed: ' + userError.message)}`);
      }

      const userId = userData.user.id;

      const { error: restError } = await admin.from('restaurants').upsert({
        id: userId,
        business_name: businessName,
        google_place_id: googlePlaceId,
        ambiance_context: description,
        menu_context: menuContext,
        subscription_status: 'trialing',
      });

      if (restError) {
        await admin.auth.admin.deleteUser(userId);
        return redirect(`/dashboard/admin/invite?error=${encodeURIComponent('DB Failed: ' + restError.message)}`);
      }

      revalidatePath('/dashboard/admin/invite');
      redirect(`/dashboard/admin/invite?success=true&slug=${userId}&businessName=${encodeURIComponent(businessName)}`);
    } catch (e: any) {
      if (e.message?.includes('NEXT_REDIRECT')) throw e;
      return redirect(`/dashboard/admin/invite?error=${encodeURIComponent('Error: ' + e.message)}`);
    }
  }

  return (
    <AdminDashboardClient
      restaurants={restaurants}
      baseUrl={baseUrl}
      createAction={createMailedRestaurant}
      error={searchParams.error}
      successSlug={searchParams.success ? searchParams.slug : undefined}
      successName={searchParams.businessName}
    />
  );
}
