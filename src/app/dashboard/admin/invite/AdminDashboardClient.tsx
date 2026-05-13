'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Building2, Mail, Link as LinkIcon, Edit, Utensils, Upload,
  Download, ExternalLink, Plus, X, CheckCircle2,
  Sparkles, Users, AlertCircle, Loader2, QrCode, Copy, Check, ChevronDown
} from 'lucide-react';

type Restaurant = {
  id: string;
  business_name: string;
  created_at: string;
  google_place_id: string | null;
  subscription_status: string | null;
  isMailed: boolean;
  email: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  trialing:  { label: 'Trialing',  color: 'text-indigo-400',  bg: 'bg-indigo-500/20 border-indigo-500/30' },
  active:    { label: 'Active',    color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  canceled:  { label: 'Canceled',  color: 'text-red-400',     bg: 'bg-red-500/20 border-red-500/30' },
  past_due:  { label: 'Past Due',  color: 'text-amber-400',   bg: 'bg-amber-500/20 border-amber-500/30' },
  organic:   { label: 'Organic',   color: 'text-slate-400',   bg: 'bg-white/5 border-white/10' },
};

function StatusSelector({ restaurantId, initialStatus }: { restaurantId: string; initialStatus: string }) {
  const key = initialStatus || 'organic';
  const [status, setStatus] = useState(key);
  const [saving, setSaving] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.organic;

  async function handleChange(newStatus: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
        className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border cursor-pointer appearance-none pr-6 ${cfg.bg} ${cfg.color} focus:outline-none disabled:opacity-50`}
      >
        <option value="trialing">Trialing</option>
        <option value="active">Active</option>
        <option value="canceled">Canceled</option>
        <option value="past_due">Past Due</option>
      </select>
      {saving
        ? <Loader2 size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
        : <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
      }
    </div>
  );
}

function QRModal({ restaurant, baseUrl, onClose }: { restaurant: Restaurant; baseUrl: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const reviewUrl = `${baseUrl}/${restaurant.id}/review`;  // ← Direct customer review URL

  const copyUrl = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('admin-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);
      }
      const a = document.createElement('a');
      a.download = `${restaurant.business_name.replace(/\s+/g, '_')}_QR.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1a2e] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">{restaurant.business_name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Customer Review QR Code</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <QRCodeSVG id="admin-qr-code" value={reviewUrl} size={200} level="H" includeMargin={false} />
        </div>

        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold text-center mb-1">Scan to leave a review</p>
        <p className="text-xs text-slate-600 font-mono text-center break-all mb-6 px-2">{reviewUrl}</p>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={downloadQR} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm">
            <Download size={16} /> Download PNG
          </button>
          <button onClick={copyUrl} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm">
            {copied ? <><Check size={16} className="text-emerald-400" /> Copied!</> : <><Copy size={16} /> Copy Link</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddRestaurantModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (id: string, name: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const fileName = `admin-provisioned/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('menus').upload(fileName, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('menus').getPublicUrl(fileName);
      setLogoUrl(publicUrl);
      setLogoPreview(publicUrl);
    } catch (err: any) {
      setFormError('Logo upload failed: ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    const fd = new FormData(e.currentTarget);
    const body = {
      businessName: fd.get('business_name'),
      tempEmail: fd.get('temp_email'),
      googlePlaceId: fd.get('google_place_id'),
      description: fd.get('description'),
      menuContext: fd.get('menu_context'),
      logoUrl: logoUrl || null,
    };
    try {
      const res = await fetch('/api/admin/create-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Something went wrong.'); return; }
      onSuccess(data.id, data.businessName);
    } catch (err: any) {
      setFormError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0a1628] border border-white/10 rounded-3xl max-w-xl w-full shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#0a1628]/95 backdrop-blur-sm border-b border-white/5 px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h3 className="text-xl font-bold text-white">Add New Restaurant</h3>
            <p className="text-sm text-slate-400 mt-0.5">Pre-provision an account for physical outreach</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-xl"><X size={20} /></button>
        </div>

        {formError && (
          <div className="mx-8 mt-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-sm">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-7">

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Restaurant Logo</label>
            <div className="flex items-center gap-5 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                {logoPreview
                  ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  : <Building2 size={24} className="text-slate-600" />
                }
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-2">512×512px recommended. PNG or JPG.</p>
                <input type="file" ref={logoRef} accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <button type="button" onClick={() => logoRef.current?.click()} disabled={uploadingLogo}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-sm font-bold border border-indigo-500/20 transition-all disabled:opacity-50">
                  {uploadingLogo ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> {logoPreview ? 'Change Logo' : 'Upload Logo'}</>}
                </button>
              </div>
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Business Name *</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input name="business_name" type="text" required placeholder="e.g. Santorini Greek Taverna"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Restaurant Email *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input name="temp_email" type="email" required placeholder="e.g. owner@restaurant.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Google Place ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-300">Google Place ID</label>
              <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                target="_blank" rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-bold uppercase tracking-tight">
                How do I find this? ↗
              </a>
            </div>
            <p className="text-xs text-slate-500 mb-2">Ensures AI reviews link directly to this restaurant's Google Maps listing.</p>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input name="google_place_id" type="text" placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div className="mt-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-indigo-400 font-black uppercase tracking-wider text-[10px] mr-1">Pro Tip:</span>
                Search your restaurant in the finder above. Copy the string shown after "Place ID:" and paste it here.
              </p>
            </div>
          </div>

          {/* Ambiance */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Ambiance & Vibe</label>
            <p className="text-xs text-slate-500 mb-2">Describe the atmosphere. The AI uses this to write authentic reviews.</p>
            <div className="relative">
              <Edit size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <textarea name="description" rows={2} placeholder="e.g. Upscale Italian bistro with romantic candlelit tables, exposed brick walls, and soft jazz..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" />
            </div>
          </div>

          {/* Menu Context */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Menu Items & Signature Dishes</label>
            <div className="mb-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-indigo-400 font-black uppercase tracking-wider text-[10px] mr-1">✦ Pro Tip:</span>
                Just paste a few dish names. E.g. "Truffle pasta, wagyu burger, tiramisu, espresso martini"
              </p>
            </div>
            <div className="relative">
              <Utensils size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <textarea name="menu_context" rows={3} placeholder="e.g. Moussaka, Souvlaki, Tzatziki, House Red Wine, Baklava..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {loading ? <><Loader2 className="animate-spin" size={18} /> Provisioning...</> : <><Sparkles size={18} /> Generate Invite & QR Code</>}
          </button>
        </form>
      </div>
    </div>
  );
}

}

export function AdminDashboardClient({
  restaurants: initialRestaurants,
  baseUrl,
  error,
  successSlug,
  successName,
}: {
  restaurants: Restaurant[];
  baseUrl: string;
  error?: string;
  successSlug?: string;
  successName?: string;
}) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [showAddModal, setShowAddModal] = useState(false);
  const [qrRestaurant, setQrRestaurant] = useState<Restaurant | null>(null);
  const [newSuccess, setNewSuccess] = useState<{ id: string; name: string } | null>(null);

  function handleSuccess(id: string, name: string) {
    setShowAddModal(false);
    setNewSuccess({ id, name });
    // Add to local list immediately without full page reload
    const newRest: Restaurant = {
      id, business_name: name,
      created_at: new Date().toISOString(),
      google_place_id: null,
      subscription_status: 'trialing',
      isMailed: true,
      email: '',
    };
    setRestaurants(prev => [newRest, ...prev]);
    // Auto-show QR
    setQrRestaurant(newRest);
  }

  const mailedCount = restaurants.filter(r => r.isMailed).length;
  const activeCount = restaurants.filter(r => r.subscription_status === 'active').length;  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 mt-1">Manage and provision restaurant accounts for your outreach campaign.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shrink-0"
        >
          <Plus size={18} /> Add Restaurant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Total</p>
          <p className="text-3xl font-bold text-white">{restaurants.length}</p>
          <p className="text-xs text-slate-500 mt-1">Restaurants</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Mailed</p>
          <p className="text-3xl font-bold text-indigo-400">{mailedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Physical invites sent</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Converted</p>
          <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
          <p className="text-xs text-slate-500 mt-1">Paying subscribers</p>
        </div>
      </div>

      {(error || newSuccess) && (
        <div className="mb-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {newSuccess && (
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-4">
              <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-white font-semibold">✅ {newSuccess.name} provisioned!</p>
                <p className="text-slate-400 text-sm mt-0.5">QR code is ready — the popup is shown automatically.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restaurant List */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users size={18} className="text-slate-400" /> All Restaurants
        </h2>

        {restaurants.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
            <Building2 size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No restaurants yet. Add your first one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {restaurants.map((rest) => (
              <div key={rest.id} className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">{rest.business_name}</h3>
                      {rest.isMailed && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Mailed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{rest.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <StatusSelector restaurantId={rest.id} initialStatus={rest.subscription_status || 'trialing'} />
                  <a
                    href={`/${rest.id}/review`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors"
                  >
                    <ExternalLink size={14} /> Test Review
                  </a>
                  <button
                    onClick={() => setQrRestaurant(rest)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium text-white transition-colors"
                  >
                    <QrCode size={14} /> QR Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddRestaurantModal onClose={() => setShowAddModal(false)} onSuccess={handleSuccess} />
      )}
      {qrRestaurant && (
        <QRModal restaurant={qrRestaurant} baseUrl={baseUrl} onClose={() => setQrRestaurant(null)} />
      )}
    </div>
  );
}
