import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Clouvea ErrorBoundary caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleReset = () => {
    localStorage.removeItem('clouvea_device_identity_v2');
    window.location.href = '/';
  };

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1218] text-slate-100 flex items-center justify-center p-6 font-sans" dir="rtl">
          <div className="max-w-lg w-full bg-[#141a22] border border-rose-800/80 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-700/80 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">تنبيه في واجهة التطبيق</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                حدث خطأ مؤقت أثناء تحميل الواجهة. تم احتواء الخطأ تلقائياً ويمكنك إعادة تشغيل الجلسة الآن:
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>إعادة ضبط الجلسة</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
