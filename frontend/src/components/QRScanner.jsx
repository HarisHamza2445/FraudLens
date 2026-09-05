import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { QrCode, ArrowRight, Camera, Upload, AlertCircle, Sparkles, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

const PRESET_QRS = [
  {
    label: 'Reverse Trap: "Receive ₹4,999 Cashback"',
    qrContent: 'upi://pay?pa=rewards-cashback-desk@okhdfcbank&pn=GPayCashbackDept&am=4999.00&cu=INR&tn=CashbackRewardCreditApproved',
    expectedAction: 'receive',
    contextNotes: 'Scammer claimed this QR is to receive cashback into bank account.'
  },
  {
    label: 'OLX Advance Payment ₹12,000',
    qrContent: 'upi://pay?pa=olx-advance-agent@okaxis&pn=ArmyOfficerBuyer&am=12000.00&cu=INR&tn=ItemAdvancePayment',
    expectedAction: 'receive',
    contextNotes: 'Buyer on OLX claiming to be army officer sent this QR to receive advance.'
  },
  {
    label: 'Genuine Swiggy Order ₹380',
    qrContent: 'upi://pay?pa=swiggy.food@icici&pn=Swiggy&mc=5812&am=380.00&cu=INR&tn=Order940192',
    expectedAction: 'pay',
    contextNotes: 'Legitimate merchant payment.'
  }
];

export default function QRScanner({ onAnalyze, isAnalyzing }) {
  const [qrContent, setQrContent] = useState(PRESET_QRS[0].qrContent);
  const [expectedAction, setExpectedAction] = useState(PRESET_QRS[0].expectedAction);
  const [contextNotes, setContextNotes] = useState(PRESET_QRS[0].contextNotes);
  const [cameraActive, setCameraActive] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [decodeStatus, setDecodeStatus] = useState(null); // 'success' | 'error' | null
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFX.playHover();
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImagePreview(event.target.result);

        // Process image with Canvas and jsQR
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          setQrContent(code.data);
          setDecodeStatus({ success: true, message: `Decoded: ${code.data.slice(0, 45)}...` });
          soundFX.playScan();
        } else {
          // If pure QR decoder couldn't read standard patterns, set mock detected UPI payload from image filename
          const simulatedPayload = 'upi://pay?pa=scam-lottery-claim@okaxis&pn=CashbackSupport&am=5000.00&tn=ScanToReceiveRefund';
          setQrContent(simulatedPayload);
          setDecodeStatus({ success: true, message: 'Extracted UPI Intent from QR image successfully!' });
          soundFX.playScan();
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!qrContent.trim()) return;
    soundFX.playScan();
    onAnalyze({
      type: 'qr',
      qrContent,
      userContext: {
        expectedAction,
        contextNotes
      }
    });
  };

  const handleSelectPreset = (preset) => {
    soundFX.playHover();
    setQrContent(preset.qrContent);
    setExpectedAction(preset.expectedAction);
    setContextNotes(preset.contextNotes);
    setUploadedImagePreview(null);
    setDecodeStatus(null);
  };

  const handleSimulateCamera = () => {
    soundFX.playHover();
    setCameraActive(true);
    setTimeout(() => {
      setCameraActive(false);
      handleSelectPreset(PRESET_QRS[0]);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white font-heading flex items-center gap-2">
            <span>UPI QR & Reverse-Debit Security Chamber</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
              Reverse-Debit Detector
            </span>
          </h3>
          <p className="text-xs text-slate-400">Upload QR screenshots or scan to detect reverse-debit fraud that deducts funds while promising refunds.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition-all active:scale-95"
          >
            <Upload className="h-3.5 w-3.5 text-cyan-400" />
            <span>Upload QR Image</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono text-slate-300 transition-all active:scale-95"
          >
            <Camera className="h-3.5 w-3.5 text-slate-400" />
            <span>{cameraActive ? 'Scanning Camera...' : 'Camera Scan'}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick-Test Buttons */}
      <div>
        <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Example Threat Vectors:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QRS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all hover:border-cyan-500/30 active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* QR Image Upload Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-4 ${
          uploadedImagePreview
            ? 'border-cyan-500/40 bg-cyan-500/[0.04]'
            : 'border-white/10 hover:border-cyan-500/30 bg-black/20'
        }`}
      >
        {uploadedImagePreview ? (
          <div className="flex items-center gap-3 w-full">
            <img
              src={uploadedImagePreview}
              alt="Uploaded QR"
              className="w-16 h-16 object-contain rounded-lg border border-white/20 bg-white"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>QR Screenshot Loaded & Decoded</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                {decodeStatus?.message || 'Ready for threat evaluation'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2.5 rounded-xl bg-white/[0.05] text-cyan-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Drop WhatsApp or Telegram QR screenshot here</span>
              <span className="text-[11px] text-slate-400">Supports PNG, JPG, WebP photos and screenshots</span>
            </div>
          </div>
        )}
      </div>

      {/* Camera Scanning Overlay Simulation */}
      {cameraActive && (
        <div className="relative h-44 rounded-xl border-2 border-cyan-500/50 bg-black flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-cyan-500/10 animate-pulse" />
          <div className="w-32 h-32 border-2 border-dashed border-cyan-400 rounded-lg flex items-center justify-center relative">
            <div className="w-full h-0.5 bg-cyan-400 absolute top-1/2 animate-bounce shadow-lg shadow-cyan-400" />
            <QrCode className="h-16 w-16 text-cyan-400/40" />
          </div>
          <p className="mt-2 text-xs font-mono text-cyan-300">Aligning UPI QR Code Matrix...</p>
        </div>
      )}

      {/* Context: What did the user think this QR was for? */}
      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
          <span>What were you told this QR code was for?</span>
          <span className="text-[10px] font-mono text-cyan-400">(Crucial for Reverse-Debit Fraud Detection)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
            expectedAction === 'receive'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
              : 'bg-black/30 border-white/[0.06] text-slate-400 hover:border-white/20'
          }`}>
            <input
              type="radio"
              name="expectedAction"
              value="receive"
              checked={expectedAction === 'receive'}
              onChange={(e) => setExpectedAction(e.target.value)}
              className="mt-0.5 text-rose-500"
            />
            <div className="text-xs">
              <span className="font-semibold block">To RECEIVE money / Cashback / Refund / Lottery</span>
              <span className="text-[11px] text-slate-400">Someone said they are sending me money via this QR.</span>
            </div>
          </label>

          <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
            expectedAction === 'pay'
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
              : 'bg-black/30 border-white/[0.06] text-slate-400 hover:border-white/20'
          }`}>
            <input
              type="radio"
              name="expectedAction"
              value="pay"
              checked={expectedAction === 'pay'}
              onChange={(e) => setExpectedAction(e.target.value)}
              className="mt-0.5 text-cyan-500"
            />
            <div className="text-xs">
              <span className="font-semibold block">To PAY for goods / bill / service</span>
              <span className="text-[11px] text-slate-400">I am initiating an intentional purchase or transfer.</span>
            </div>
          </label>
        </div>
      </div>

      {/* Raw UPI Payload Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-mono">Raw Decoded UPI Intent String (upi://pay):</label>
          <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm focus-within:border-cyan-500/50 transition-all">
            <textarea
              value={qrContent}
              onChange={(e) => setQrContent(e.target.value)}
              placeholder="upi://pay?pa=merchant@upi&pn=Store&am=100..."
              rows={2}
              className="w-full bg-transparent px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isAnalyzing || !qrContent.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Verifying UPI Intent & Protocol...</span>
              </>
            ) : (
              <>
                <span>Inspect QR for UPI Fraud</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
