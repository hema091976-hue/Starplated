'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Updates the core restaurant profile and AI context settings.
 * Note: Logo URL is handled separately via updateLogoUrl.
 */
export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/auth')

  const businessName    = formData.get('business_name') as string
  const googlePlaceId   = formData.get('google_place_id') as string
  const ambianceContext = formData.get('ambiance_context') as string
  const menuContext     = formData.get('menu_context') as string

  const { error } = await supabase
    .from('restaurants')
    .update({
      business_name:    businessName,
      google_place_id:  googlePlaceId,
      ambiance_context: ambianceContext,
      menu_context:     menuContext,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating settings:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

/**
 * Updates only the logo URL in the database.
 * This is called after the client-side upload to Supabase Storage.
 */
export async function updateLogoUrl(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('restaurants')
    .update({ logo_url: url })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating logo URL:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
