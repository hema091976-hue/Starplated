'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function QRCodeDisplay({ reviewUrl, businessName }: { reviewUrl: string, businessName: string }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${businessName.replace(/\s+/g, '_')}_QR_Code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex flex-col items-center">
      <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8">
        <QRCodeSVG 
          id="qr-code-svg"
          value={reviewUrl} 
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">{businessName}</h2>
      <p className="text-slate-400 text-sm mb-8 text-center break-all max-w-[280px]">
        {reviewUrl}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button 
          onClick={downloadQR}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          <Download size={18} />
          Download
        </button>
        <button 
          onClick={copyUrl}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {copied ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
          {copied ? 'Copied' : 'Copy URL'}
        </button>
      </div>
    </div>
  );
}
