import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Shield, Zap, Coins } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-text)] selection:bg-[var(--brand-accent)]/30">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-16 px-4 md:px-24 overflow-hidden">
        <div className="z-10 text-center space-y-6 max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-[0_0_30px_var(--shadow-brand)] border border-[var(--brand-accent)]/20">
              <Image 
                src="/logo.png" 
                alt="SanityCheck Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/20 text-[var(--brand-accent)] text-xs font-bold tracking-widest uppercase mb-4">
            Zero-Dependency • Privacy-First • Local AI
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Master Your Next <br /> 
            <span className="text-[var(--brand-accent)] drop-shadow-[0_0_15px_var(--shadow-brand)]">Professional Interview</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-70 max-w-2xl mx-auto leading-relaxed">
            Run infinite high-fidelity mock interviews entirely on your local machine. 
            No cloud APIs, no subscriptions, total data sovereignty.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg rounded-xl">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="https://github.com/joshuabharper7/SanityCheck" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full px-8 py-6 text-lg rounded-xl">
                View Source
              </Button>
            </a>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full bg-[var(--brand-accent)] blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] rounded-full bg-[var(--brand-accent)] blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 md:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[var(--brand-accent)]/20 flex items-center justify-center text-[var(--brand-accent)]">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Total Sovereignty</h3>
            <p className="opacity-60 text-sm leading-relaxed">
              Your resumes, job descriptions, and interview transcripts never leave your machine. Zero tracking, zero external APIs.
            </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[var(--brand-accent)]/20 flex items-center justify-center text-[var(--brand-accent)]">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Low-Latency</h3>
            <p className="opacity-60 text-sm leading-relaxed">
              Achieve near real-time conversational feedback loops by scaling model architectures to your local GPU capabilities.
            </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[var(--brand-accent)]/20 flex items-center justify-center text-[var(--brand-accent)]">
              <Coins className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Zero-Cost</h3>
            <p className="opacity-60 text-sm leading-relaxed">
              Infinite mock interviews without token fees. Once installed, your practice sessions are entirely free and offline-capable.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[var(--border-neutral)] text-center opacity-40 text-sm">
        <p>&copy; 2026 SanityCheck Open Source Project. Local-First AI.</p>
      </footer>
    </main>
  );
}
