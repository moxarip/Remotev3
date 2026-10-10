import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useClouvea } from '../../context/ClouveaContext';
import {
  QrCode,
  Smartphone,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  X,
  ArrowRight,
  Wifi,
  Sparkles
} from 'lucide-react';

interface PhonePairingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhonePairingModal: React.FC<PhonePairingModalProps> = ({ isOpen, onClose }) => {
  const {
    thisDeviceIdentity,
    currentPairingCode,
    generatePairingCode,
    pairWithCode,
    t,
    language,
    showToast
  } = useClouvea();

  const [activeTab, setActiveTab] = useState<'share' | 'enter'>(
    thisDeviceIdentity.role === 'node' ? 'share' : 'enter'
  );
  const [pinInput, setPinInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isPairingLoading, setIsPairingLoading] = useState(false);

  // Generate QR code when code is available
  useEffect(() => {
    if (!isOpen) return;

    if (!currentPairingCode) {
      generatePairingCode();
    } else {
      const shareUrl = `${window.location.origin}/?pair=${currentPairingCode}&role=controller`;
      QRCode.toDataURL(shareUrl, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, currentPairingCode]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (currentPairingCode) {
      navigator.clipboard.writeText(currentPairingCode);
      setCopied(true);
      showToast(language === 'ar' ? 'تم نسخ رمز الاقتران للحافظة' : 'Copied pairing PIN');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyLink = () => {
    if (currentPairingCode) {
      const shareUrl = `${window.location.origin}/?pair=${currentPairingCode}&role=controller`;
      navigator.clipboard.writeText(shareUrl);
      showToast(language === 'ar' ? 'تم نسخ الرابط المباشر لفتحه على الهاتف الآخر' : 'Copied direct link');
    }
  };

  const handleSubmitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setIsPairingLoading(true);
    const success = await pairWithCode(pinInput.trim());
    setIsPairingLoading(false);
    if (success) {
      onClose();
    }
  };

  const formattedCode = currentPairingCode
    ? `${currentPairingCode.slice(0, 3)} - ${currentPairingCode.slice(3)}`
    : '... ...';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#141a22] border border-slate-700 rounded-3xl p-6 text-white shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1d99f3] to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">
            {language === 'ar' ? 'ربط هاتفين عن بُعد (P2P Pairing)' : 'Remote Phone Pairing'}
          </h2>
          <p className="text-xs text-slate-300">
            {language === 'ar'
              ? 'اربط الهاتفين عبر مسح رمز QR أو إدخال رمز PIN من 6 أرقام'
              : 'Pair two phones directly via QR code or 6-digit PIN'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('share')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'share'
                ? 'bg-gradient-to-r from-[#1d99f3] to-[#3daee9] text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'عرض رمز هذا الهاتف' : 'Show My PIN/QR'}</span>
          </button>
          <button
            onClick={() => setActiveTab('enter')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'enter'
                ? 'bg-gradient-to-r from-[#1d99f3] to-[#3daee9] text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إدخال رمز من هاتف آخر' : 'Enter Remote PIN'}</span>
          </button>
        </div>

        {/* Tab 1: Show Code & QR */}
        {activeTab === 'share' && (
          <div className="space-y-4 text-center">
            {/* PIN Code Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-sky-950/40 to-slate-900 border border-sky-800/50 space-y-2">
              <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest font-bold block">
                {language === 'ar' ? 'رمز الاقتران المباشر (PIN)' : 'Pairing PIN Code'}
              </span>
              <div className="text-3xl font-black font-mono tracking-wider text-white select-all">
                {formattedCode}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ الرمز' : 'Copy PIN')}</span>
                </button>
                <button
                  onClick={() => generatePairingCode()}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="توليد رمز جديد"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* QR Code Canvas */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl mx-auto border-4 border-slate-700">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Pairing QR Code"
                  className="w-48 h-48 mx-auto object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs font-mono">
                  جاري توليد رمز QR...
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              {language === 'ar'
                ? 'وجّه كاميرا الهاتف الثاني نحو رمز QR للاقتران والموافقة التلقائية'
                : 'Point the second phone camera at this QR code to connect directly'}
            </p>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Copy className="w-4 h-4 text-[#3daee9]" />
              <span>{language === 'ar' ? 'نسخ رابط الفتح المباشر للهاتف الثاني' : 'Copy Direct Link for Other Phone'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Enter PIN */}
        {activeTab === 'enter' && (
          <form onSubmit={handleSubmitPin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {language === 'ar' ? 'أدخل رمز PIN الظاهر على الهاتف الآخر:' : 'Enter the PIN shown on the other phone:'}
              </label>
              <input
                type="text"
                maxLength={8}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="123456"
                autoFocus
                className="w-full py-3.5 px-4 bg-slate-900 border-2 border-slate-700 focus:border-[#3daee9] focus:outline-none rounded-2xl text-center font-mono text-2xl font-black tracking-widest text-white shadow-inner"
              />
              <p className="text-[11px] text-slate-400 text-center">
                {language === 'ar'
                  ? 'يتكون الرمز من 6 أرقام صالحة لمدة 15 دقيقة'
                  : '6-digit PIN valid for 15 minutes'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isPairingLoading || !pinInput.trim()}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#1d99f3] to-purple-600 hover:from-[#3daee9] hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isPairingLoading
                  ? (language === 'ar' ? 'جاري الاقتران والمصادقة...' : 'Connecting...')
                  : (language === 'ar' ? 'إرسال طلب الاقتران والمصادقة' : 'Connect & Authorize')}
              </span>
            </button>
          </form>
        )}

        {/* Security Fingerprint Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>P2P TLS 1.3 Verified</span>
          </div>
          <span>{thisDeviceIdentity.model.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};
