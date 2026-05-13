'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Building2, Mail, Link as LinkIcon, Edit, Utensils,
  Download, ExternalLink, Plus, X, CheckCircle2,
  Sparkles, Users, AlertCircle, Loader2, QrCode, Copy, Check
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${pending ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {pending ? <><Loader2 className="animate-spin" size={18} /> Provisioning...</> : <><Sparkles size={18} /> Generate Invite & QR Code</>}
    </button>
  );
}

function QRModal({ restaurant, baseUrl, onClose }: { restaurant: Restaurant; baseUrl: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const welcomeUrl = `${baseUrl}/welcome/${restaurant.id}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(welcomeUrl);
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
            <p className="text-xs text-slate-500 mt-0.5">Activation QR Code</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <QRCodeSVG id="admin-qr-code" value={welcomeUrl} size={200} level="H" includeMargin={false} />
        </div>

        <p className="text-xs text-slate-500 font-mono text-center break-all mb-6 px-2">{welcomeUrl}</p>

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

function AddRestaurantModal({ createAction, onClose }: { createAction: (f: FormData) => Promise<void>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1a2e] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Add New Restaurant</h3>
            <p className="text-sm text-slate-400 mt-0.5">Pre-provision an account for physical outreach</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        <form action={createAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Business Name *</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input name="business_name" type="text" required placeholder="e.g. Santorini Greek Taverna"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Restaurant Email *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input name="temp_email" type="email" required placeholder="e.g. owner@restaurant.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Google Place ID</label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input name="google_place_id" type="text" placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Ambiance & Vibe</label>
            <div className="relative">
              <Edit size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <textarea name="description" rows={2} placeholder="e.g. cozy, family-friendly, premium Mediterranean..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Menu Context (Dishes & Drinks)</label>
            <div className="relative">
              <Utensils size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <textarea name="menu_context" rows={3} placeholder="e.g. Moussaka, Souvlaki, Tzatziki, House Red Wine, Baklava..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" />
            </div>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

export function AdminDashboardClient({
  restaurants,
  baseUrl,
  createAction,
  error,
  successSlug,
  successName,
}: {
  restaurants: Restaurant[];
  baseUrl: string;
  createAction: (f: FormData) => Promise<void>;
  error?: string;
  successSlug?: string;
  successName?: string;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [qrRestaurant, setQrRestaurant] = useState<Restaurant | null>(null);

  const mailedCount = restaurants.filter(r => r.isMailed).length;
  const activeCount = restaurants.filter(r => r.subscription_status === 'active').length;

  return (
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

      {/* Error / Success banners */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {successSlug && (
        <div className="mb-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-4">
          <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-white font-semibold">✅ {successName || 'Restaurant'} provisioned!</p>
            <p className="text-slate-400 text-sm mt-0.5">Find it in the list below to download the QR code.</p>
          </div>
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
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        rest.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        rest.isMailed ? 'bg-indigo-500/20 text-indigo-400' :
                        'bg-white/5 text-slate-500'
                      }`}>
                        {rest.subscription_status === 'active' ? 'Active' : rest.isMailed ? 'Mailed' : 'Organic'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{rest.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`/welcome/${rest.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors"
                  >
                    <ExternalLink size={14} /> Test Flow
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
        <AddRestaurantModal createAction={createAction} onClose={() => setShowAddModal(false)} />
      )}
      {qrRestaurant && (
        <QRModal restaurant={qrRestaurant} baseUrl={baseUrl} onClose={() => setQrRestaurant(null)} />
      )}
    </div>
  );
}
