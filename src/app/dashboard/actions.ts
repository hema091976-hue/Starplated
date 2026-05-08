'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/auth')

  const businessName    = formData.get('business_name') as string
  const googlePlaceId   = formData.get('google_place_id') as string
  const ambianceContext = formData.get('ambiance_context') as string
  const menuContext     = formData.get('menu_context') as string
  const logoUrl         = formData.get('logo_url') as string

  const { error } = await supabase
    .from('restaurants')
    .update({
      business_name:    businessName,
      google_place_id:  googlePlaceId,
      ambiance_context: ambianceContext,
      menu_context:     menuContext,
      logo_url:         logoUrl,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating settings:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function uploadMenu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const files = formData.getAll('file') as File[]
  if (files.length === 0) return { error: 'No files provided' }

  const uploadedUrls = []

  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('menus')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: uploadError.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('menus')
      .getPublicUrl(fileName)
    
    uploadedUrls.push(publicUrl)
  }

  // Get current menu_urls
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('menu_urls')
    .eq('id', user.id)
    .single()

  const currentUrls = Array.isArray(restaurant?.menu_urls) ? restaurant.menu_urls : []
  const newUrls = [...currentUrls, ...uploadedUrls]

  // Update restaurant record
  const { error: dbError } = await supabase
    .from('restaurants')
    .update({ menu_urls: newUrls })
    .eq('id', user.id)

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function removeMenuFile(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get current menu_urls
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('menu_urls')
    .eq('id', user.id)
    .single()

  if (!restaurant) return { error: 'Restaurant not found' }

  const currentUrls = Array.isArray(restaurant.menu_urls) ? restaurant.menu_urls : []
  const newUrls = currentUrls.filter((u: string) => u !== url)

  // Update restaurant record
  const { error: dbError } = await supabase
    .from('restaurants')
    .update({ menu_urls: newUrls })
    .eq('id', user.id)

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function uploadLogo(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('menus') 
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      return { error: `Storage Error: ${uploadError.message}` }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('menus')
      .getPublicUrl(fileName)

    // Update restaurant record logo_url
    const { error: dbError } = await supabase
      .from('restaurants')
      .update({ logo_url: publicUrl })
      .eq('id', user.id)

    if (dbError) {
      return { error: `Database Error: ${dbError.message}` }
    }

    revalidatePath('/dashboard', 'layout')
    return { success: true, url: publicUrl }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred during upload' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
