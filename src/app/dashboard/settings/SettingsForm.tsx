'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Link as LinkIcon, Building2, Trash2, Loader2, Sparkles } from 'lucide-react';
import { updateSettings, updateLogoUrl } from '../actions';
import { createClient } from '@/utils/supabase/client';

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  async function handleAction(formData: FormData) {
    setIsSaving(true);
    const result = await updateSettings(formData);
    setIsSaving(false);
    
    if (result.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } else {
      alert(result.error);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('menus')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('menus')
        .getPublicUrl(fileName);
      
      const result = await updateLogoUrl(publicUrl);
      
      if (result.error) {
        alert(result.error);
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during upload');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Profile & Context</h1>
        <p className="text-slate-400">Configure your business details so the AI can generate highly specific reviews.</p>
      </div>

      <form action={handleAction} className="space-y-8">
        
        {/* Business Profile Card */}
        <div className="bg-[#0F172A]/50 border border-white/5 rounded-[24px] p-5 md:p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            Business Profile
          </h2>
          
          <div className="space-y-8">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3" htmlFor="business_name">Business Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-400 text-slate-500">
                  <Building2 size={18} />
                </div>
                <input 
                  id="business_name"
                  name="business_name"
                  type="text" 
                  defaultValue={initialData?.business_name || ''}
                  className="w-full bg-[#020617]/80 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-lg font-medium placeholder:text-slate-700"
                  placeholder="e.g. The Rusty Spoon"
                  required
                />
              </div>
            </div>

            {/* Restaurant Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Restaurant Logo</label>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 p-5 md:p-6 bg-[#020617]/40 border border-white/5 rounded-[20px]">
                <div className="w-24 h-24 bg-[#0F172A] rounded-full overflow-hidden border-2 border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                  {initialData?.logo_url ? (
                    <img src={initialData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-700">
                      <Sparkles size={32} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    Recommended: <span className="text-white font-medium">512x512px</span> (Square PNG or JPG).<br/>
                    This will appear at the top of your customer review page.
                  </p>
                  <input 
                    type="file" 
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="flex items-center gap-2.5 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-sm font-bold transition-all border border-indigo-500/20 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isUploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {initialData?.logo_url ? 'Change Logo' : 'Upload Logo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Google Place ID */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                <label className="block text-sm font-medium text-slate-300" htmlFor="google_place_id">Google Place ID</label>
                <a 
                  href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-bold tracking-tight uppercase"
                >
                  How do I find this?
                </a>
              </div>
              <p className="text-xs text-slate-500 mb-3">This ensures reviews go to your exact Google Maps listing.</p>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-400 text-slate-500">
                  <LinkIcon size={18} />
                </div>
                <input 
                  id="google_place_id"
                  name="google_place_id"
                  type="text" 
                  defaultValue={initialData?.google_place_id || ''}
                  placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                  className="w-full bg-[#020617]/80 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm"
                />
              </div>
              <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-indigo-400 font-black uppercase tracking-[0.1em] text-[10px] mr-2">Pro Tip:</span> 
                  Search for your restaurant name in the finder linked above. Once found, copy the string after &quot;Place ID:&quot; and paste it here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ambiance Card */}
        <div className="bg-[#0F172A]/50 border border-white/5 rounded-[24px] p-5 md:p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-2">Ambiance & Vibe</h2>
          <p className="text-sm text-slate-400 mb-8">Describe your restaurant's atmosphere, style, and what makes the experience special.</p>
          
          <textarea 
            name="ambiance_context"
            className="w-full h-40 bg-[#020617]/80 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[15px] leading-relaxed transition-all placeholder:text-slate-700"
            defaultValue={initialData?.ambiance_context || ''}
            placeholder="e.g. Upscale Italian bistro with romantic candlelit tables, exposed brick walls, and soft jazz. Warm and intimate — perfect for date nights..."
          />
        </div>

        {/* Menu Items Card */}
        <div className="bg-[#0F172A]/50 border border-white/5 rounded-[24px] p-5 md:p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-2">Menu Items & Signature Dishes</h2>
          <p className="text-sm text-slate-400 mb-8">List your key dishes, drinks, and specials. The AI will mention these by name in reviews.</p>
          
          <div className="mb-6 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-[18px]">
            <p className="text-[12px] text-slate-400 leading-relaxed">
              <span className="text-indigo-400 font-black uppercase tracking-[0.1em] text-[10px] mr-2">✦ Pro Tip:</span>
              Just paste a few dish names. E.g. &quot;Truffle pasta, wagyu burger, tiramisu, espresso martini&quot;
            </p>
          </div>

          <textarea 
            name="menu_context"
            className="w-full h-40 bg-[#020617]/80 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[15px] leading-relaxed transition-all placeholder:text-slate-700"
            defaultValue={initialData?.menu_context || ''}
            placeholder="e.g. Handmade tagliatelle, truffle arancini, wood-fired margherita pizza, tiramisu, Aperol spritz..."
          />
        </div>

        {/* Save Button Bar */}
        <div className="sticky bottom-4 md:bottom-8 z-10 pt-4">
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.1em] py-4 md:py-5 px-4 md:px-8 rounded-2xl transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] text-sm md:text-base"
          >
            {isSaved ? (
              <><CheckCircle2 size={24} /> Settings Saved Successfully</>
            ) : isSaving ? (
              <><Loader2 size={24} className="animate-spin" /> Saving Changes...</>
            ) : (
              'Save Profile & AI Context'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
