import { createClient } from '@/utils/supabase/server';
import { SettingsForm } from './SettingsForm';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile & Context</h1>
        <p className="text-slate-400 mt-1">Configure your business details so the AI can generate highly specific reviews.</p>
      </div>

      <SettingsForm initialData={restaurant} />
    </div>
  );
}
