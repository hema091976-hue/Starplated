'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Link as LinkIcon, Building2, Trash2, Loader2 } from 'lucide-react';
import { updateSettings, uploadMenu, removeMenuFile, uploadLogo } from '../actions';

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    
    const result = await uploadMenu(formData);
    setIsUploading(false);
    
    if (result.error) {
      alert(result.error);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadLogo(formData);
    setIsUploadingLogo(false);
    
    if (result.error) {
      alert(result.error);
    }
    
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }

  async function handleRemoveMenu(url: string) {
    if (!confirm('Are you sure you want to remove this menu file?')) return;
    setIsUploading(true);
    const result = await removeMenuFile(url);
    setIsUploading(false);
    
    if (result?.error) {
      alert(result.error);
    }
  }

  const menuUrls = Array.isArray(initialData?.menu_urls) ? initialData.menu_urls : [];

  return (
    <div className="space-y-6">
      <form action={handleAction} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Business Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="business_name">Business Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={16} className="text-slate-500" />
                </div>
                <input 
                  id="business_name"
                  name="business_name"
                  type="text" 
                  defaultValue={initialData?.business_name || ''}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Restaurant Logo</label>
              <div className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="w-20 h-20 bg-black/40 rounded-full overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                  {initialData?.logo_url ? (
                    <img src={initialData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={32} className="text-slate-700" />
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Recommended: <span className="text-white font-medium">512x512px</span> (Square PNG or JPG).<br/>
                    This will appear at the top of your review page.
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
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-all border border-indigo-500/20 disabled:opacity-50"
                  >
                    {isUploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {initialData?.logo_url ? 'Change Logo' : 'Upload Logo'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300" htmlFor="google_place_id">Google Place ID</label>
                <a 
                  href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  How do I find this?
                </a>
              </div>
              <p className="text-xs text-slate-500 mb-2">This ensures reviews go to your exact Google Maps listing.</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon size={16} className="text-slate-500" />
                </div>
                <input 
                  id="google_place_id"
                  name="google_place_id"
                  type="text" 
                  defaultValue={initialData?.google_place_id || ''}
                  placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div className="mt-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider mr-1">Pro Tip:</span> 
                  Search for your restaurant name in the finder linked above. Once found, copy the string after "Place ID:" and paste it here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ambiance Context */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Ambiance & Vibe</h2>
          <p className="text-sm text-slate-400 mb-6">Describe your restaurant's atmosphere, style, and what makes the experience special. The AI uses this to write authentic-sounding reviews.</p>
          
          <textarea 
            name="ambiance_context"
            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            defaultValue={initialData?.ambiance_context || ''}
            placeholder="e.g. Upscale Italian bistro with romantic candlelit tables, exposed brick walls, and soft jazz. Warm and intimate — perfect for date nights. Known for exceptional wine service and a welcoming, unhurried atmosphere."
          />
        </div>

        {/* Menu Context */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Menu Items & Signature Dishes</h2>
          <p className="text-sm text-slate-400 mb-4">List your key dishes, drinks, and specials. The AI will mention these by name in generated reviews — making them sound specific and authentic.</p>
          <div className="mb-4 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <span className="text-indigo-400 font-bold uppercase tracking-wider mr-1">✦ Pro Tip:</span>
              Just paste a few dish names or your best-sellers. E.g. &quot;Truffle pasta, wagyu burger, tiramisu, espresso martini, weekend brunch specials&quot;
            </p>
          </div>
          <textarea 
            name="menu_context"
            className="w-full h-28 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            defaultValue={initialData?.menu_context || ''}
            placeholder="e.g. Handmade tagliatelle, truffle arancini, wood-fired margherita pizza, tiramisu, Aperol spritz, weekend brunch with bottomless mimosas..."
          />
        </div>

        <button 
          type="submit"
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSaved ? (
            <><CheckCircle2 size={18} /> Settings Saved</>
          ) : isSaving ? (
            'Saving...'
          ) : (
            'Save Profile & Settings'
          )}
        </button>
      </form>

      {/* Menu Upload (Separate from main form) */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Upload Menu (PDF or Images)</h2>
        <p className="text-sm text-slate-400 mb-6">Upload multiple files if your menu has multiple pages.</p>
        
        {menuUrls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {menuUrls.map((url: string, index: number) => (
              <div key={url} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-blue-400" />
                  <div>
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm text-slate-200 hover:text-white font-medium underline-offset-4 hover:underline">
                      Menu Page {index + 1}
                    </a>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveMenu(url)}
                  disabled={isUploading}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors disabled:opacity-50"
                  title="Remove Menu"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,image/*"
            multiple
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={32} className="text-indigo-400 mb-4" />
            <p className="text-sm text-white font-medium">
              {isUploading ? 'Uploading...' : 'Click to upload menu pages'}
            </p>
            <p className="text-xs text-slate-500 mt-2">You can select multiple files at once</p>
          </button>
        </div>
      </div>
    </div>
  );
}
