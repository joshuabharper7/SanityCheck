import React from 'react';
import { OnboardingWizard } from '@/components/OnboardingWizard';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 bg-[var(--bg-canvas)] text-[var(--fg-text)]">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Welcome to <span className="text-[var(--brand-accent)]">SanityCheck</span>
          </h1>
          <p className="text-lg opacity-70">
            The privacy-first, local AI interview simulator.
          </p>
        </div>
        
        <OnboardingWizard />
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--brand-accent)] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--brand-accent)] opacity-[0.03] blur-[120px]" />
      </div>
    </main>
  );
}
