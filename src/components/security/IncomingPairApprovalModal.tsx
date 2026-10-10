import React from 'react';
import { useClouvea } from '../../context/ClouveaContext';
import {
  ShieldAlert,
  Smartphone,
  Check,
  X,
  Wifi,
  Lock
} from 'lucide-react';

export const IncomingPairApprovalModal: React.FC = () => {
  const {
    incomingPairRequest,
    acceptPairRequest,
    rejectPairRequest,
    language
  } = useClouvea();

  if (!incomingPairRequest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#161f2b] border-2 border-[#1d99f3] rounded-3xl p-6 text-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#1d99f3]/20 border border-[#1d99f3]/50 flex items-center justify-center text-[#3daee9] mx-auto shadow-lg shadow-sky-500/30">
            <Smartphone className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-lg font-extrabold text-white">
            {language === 'ar' ? 'طلب اقتران هاتف وارد!' : 'Incoming Pairing Request!'}
          </h2>

          <p className="text-xs text-slate-300">
            {language === 'ar'
              ? 'يرغب هاتف تحكم جديد بالاقتران مع هذا الجهاز للوصول إلى المجلدات والملفات المصرح بها'
              : 'A remote controller phone wants to pair with this device to access authorized scopes'}
          </p>
        </div>

        {/* Remote Device Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-1.5 text-center">
          <div className="text-sm font-bold text-sky-400">
            {incomingPairRequest.controller.name}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {incomingPairRequest.controller.model}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            <span>رمز المصادقة: {incomingPairRequest.code}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => rejectPairRequest(incomingPairRequest)}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>{language === 'ar' ? 'رفض' : 'Reject'}</span>
          </button>

          <button
            onClick={() => acceptPairRequest(incomingPairRequest)}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{language === 'ar' ? 'قبول واعتماد' : 'Accept & Trust'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
