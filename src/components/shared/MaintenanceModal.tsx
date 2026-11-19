'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MaintenanceModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkAndShow = () => {
      try {
        const hasSeenMaintenance = localStorage.getItem('xfactor_maintenance_notice_seen');
        if (hasSeenMaintenance) return;

        const isResearchVerified = localStorage.getItem('xfactor_research_verified');
        if (isResearchVerified) {
          timer = setTimeout(() => setIsOpen(true), 500);
        } else {
          const onVerified = () => {
            timer = setTimeout(() => setIsOpen(true), 400);
          };
          window.addEventListener('xfactor_research_verified', onVerified, { once: true });
        }
      } catch {
        setIsOpen(true);
      }
    };

    checkAndShow();

    const onManualOpen = () => setIsOpen(true);
    window.addEventListener('open-maintenance-modal', onManualOpen);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-maintenance-modal', onManualOpen);
    };
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem('xfactor_maintenance_notice_seen', 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0b111e] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl shadow-amber-950/40 text-foreground relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close maintenance notice"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <span className="text-2xl" role="img" aria-label="Construction">🚧</span>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-1">
              Website Update
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              We&apos;re Under Maintenance! 🚧
            </h2>
          </div>
        </div>

        {/* Message body */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-5">
          We&apos;re working behind the scenes to bring you a better experience!
        </p>

        {/* Good News Callout Box */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 sm:p-5 mb-5 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="text-emerald-300 font-bold text-base leading-snug">
                Good news! We&apos;re still accepting orders through our website.
              </p>
              <p className="text-slate-300 text-xs sm:text-sm">
                You can continue placing your orders as usual.
              </p>
            </div>
          </div>
        </div>

        {/* Thank You Note */}
        <p className="text-xs sm:text-sm text-slate-400 mb-6 italic">
          Thank you for your patience and support!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/shop" onClick={handleClose} className="flex-1">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg shadow-amber-950/40 border border-amber-400/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Continue Placing Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleClose}
            className="border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
}
