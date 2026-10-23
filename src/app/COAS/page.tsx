"use client";
import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { FileCheck, ShieldCheck, Mail, ArrowRight, Clock, FlaskConical, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function COAsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Header section */}
          <div className="text-center mb-12 mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-4 border border-accent/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Independent Verification & Quality</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
              Certificates of Analysis (COA)
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every compound in our catalogue undergoes rigorous third-party analytical testing. Batch-specific Certificates of Analysis are readily provided upon request.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 pb-8 border-b border-border/60">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent">
                  <FileCheck className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Available Upon Request for Every Batch
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    To ensure researchers receive exact lot-matched testing reports, Certificates of Analysis are delivered on demand for all research orders and compound inquiries.
                  </p>
                </div>
              </div>

              {/* Steps / Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-background/80 border border-border/80 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-accent font-semibold text-sm mb-2">
                    <FlaskConical className="w-4 h-4" />
                    <span>1. Batch Matched</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tested via High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS) to verify ≥98% purity.
                  </p>
                </div>

                <div className="bg-background/80 border border-border/80 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-accent font-semibold text-sm mb-2">
                    <Mail className="w-4 h-4" />
                    <span>2. Simple Request</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Provide your compound name or order number through our contact form or via email to request testing data.
                  </p>
                </div>

                <div className="bg-background/80 border border-border/80 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-accent font-semibold text-sm mb-2">
                    <Clock className="w-4 h-4" />
                    <span>3. Rapid Turnaround</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our team provides the verified independent laboratory documentation within 24 business hours.
                  </p>
                </div>
              </div>

              {/* Key Assurances */}
              <div className="space-y-3 mb-10 bg-accent/5 border border-accent/15 rounded-xl p-6 text-sm">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  What Each COA Includes:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground text-xs pl-6 list-disc">
                  <li>HPLC Chromatogram & Purity Percentage</li>
                  <li>Mass Spectrometry (MS) Molecular Weight Confirmation</li>
                  <li>Lot & Batch Identification Number</li>
                  <li>Gross & Net Peptide Content Verification</li>
                  <li>Synthesis Date & Storage Stability Specifications</li>
                  <li>Independent Third-Party Laboratory Certification</li>
                </ul>
              </div>

              {/* Call to action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-medium shadow-[0_0_20px_rgba(11,95,255,0.3)]">
                    Request a COA <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/shop" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-border hover:bg-card">
                    Browse Research Products
                  </Button>
                </Link>
                <span className="text-xs text-muted-foreground sm:ml-auto">
                  Direct email: <a href="mailto:info@xfactorpeps.com" className="text-accent underline">info@xfactorpeps.com</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
