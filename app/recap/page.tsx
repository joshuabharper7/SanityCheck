'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { EvaluationScorecard } from '@/utils/schema';
import { 
  Trophy, 
  Target, 
  Lightbulb, 
  ShieldAlert, 
  Terminal, 
  RefreshCcw, 
  Home,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  Copy,
  Check
} from 'lucide-react';

export default function RecapPage() {
  const [scorecard, setScorecard] = useState<EvaluationScorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const evaluateSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = JSON.parse(localStorage.getItem('sanity_check_transcript') || '[]');
      const blueprint = JSON.parse(localStorage.getItem('sanity_check_blueprint') || 'null');

      if (!history.length || !blueprint) {
        throw new Error("No session data found to evaluate.");
      }

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, blueprint })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');
      
      setScorecard(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluateSession();
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-canvas)] p-8">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-[var(--brand-accent)]/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-[var(--brand-accent)] rounded-full border-t-transparent animate-spin" />
          <BrainCircuit className="absolute inset-0 m-auto h-10 w-10 text-[var(--brand-accent)] animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Principal Director is Grading...</h2>
        <p className="opacity-60 text-center max-w-md">
          Analyzing your transcript for technical accuracy, communication clarity, and the "No-BS" metric.
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-canvas)] p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Evaluation Error</h2>
        <p className="opacity-60 mb-8">{error}</p>
        <Button onClick={evaluateSession}>Retry Evaluation</Button>
      </main>
    );
  }

  if (!scorecard) return null;

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-text)] p-4 md:p-12 pb-24">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header & Overall Score */}
        <header className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/20 text-[var(--brand-accent)] text-xs font-bold uppercase tracking-widest">
              <Trophy className="h-3 w-3" /> Interview Complete
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Analytical Recap</h1>
            <p className="text-lg opacity-70 leading-relaxed max-w-2xl">
              {scorecard.performanceSummary}
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-accent)]/5 to-transparent pointer-events-none" />
            <span className="text-sm font-bold opacity-40 uppercase tracking-widest mb-2">Overall Score</span>
            <div className="relative">
              <span className="text-7xl font-black text-[var(--brand-accent)] drop-shadow-[0_0_20px_var(--shadow-brand)]">
                {scorecard.overallScore}
              </span>
              <span className="text-2xl font-bold opacity-30">/100</span>
            </div>
          </div>
        </header>

        {/* Metrics Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            label="Technical Accuracy" 
            value={scorecard.metrics.technicalAccuracy} 
            icon={<Target className="h-4 w-4" />} 
          />
          <MetricCard 
            label="Communication" 
            value={scorecard.metrics.communicationClarity} 
            icon={<TrendingUp className="h-4 w-4" />} 
          />
          <MetricCard 
            label="Honesty & Humility" 
            value={scorecard.metrics.honestyAndHumility} 
            icon={<ShieldAlert className="h-4 w-4" />} 
            description="The 'No-BS' Metric"
          />
          <MetricCard 
            label="STAR Alignment" 
            value={scorecard.metrics.starAlignment} 
            icon={<CheckCircle2 className="h-4 w-4" />} 
          />
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-green-500/20 bg-green-500/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" /> Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {scorecard.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm opacity-80">
                    <span className="h-5 w-5 rounded bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" /> Growth Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {scorecard.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm opacity-80">
                    <span className="h-5 w-5 rounded bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Local Study Plan */}
        <Card className="border-[var(--brand-accent)]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[var(--brand-accent)]" /> 
              Localized Study Plan
            </CardTitle>
            <p className="text-xs opacity-60">Actionable steps to bridge your knowledge gaps using local AI.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scorecard.localStudyPlan.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[var(--border-neutral)]/30 border border-[var(--border-neutral)] space-y-3">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]" />
                  {item.concept}
                </h4>
                <p className="text-xs opacity-60 leading-relaxed italic">
                  "{item.reason}"
                </p>
                <div className="relative group">
                  <div className="bg-black/40 rounded-lg p-3 pr-10 font-mono text-[10px] text-[var(--brand-accent)] overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {item.localOllamaRefCommand}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.localOllamaRefCommand, i)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  >
                    {copiedIndex === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 opacity-40 group-hover:opacity-100" />}
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button variant="secondary" size="lg" className="rounded-xl px-8" onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" /> Exit to Home
          </Button>
          <Button size="lg" className="rounded-xl px-8" onClick={() => window.location.href = '/dashboard'}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Start New Session
          </Button>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value, icon, description }: { label: string, value: number, icon: React.ReactNode, description?: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-3 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="h-8 w-8 rounded-lg bg-[var(--brand-accent)]/10 flex items-center justify-center text-[var(--brand-accent)]">
          {icon}
        </div>
        <span className="text-lg font-black">{value}%</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-40">{label}</p>
        {description && <p className="text-[10px] opacity-30 mt-0.5">{description}</p>}
      </div>
      <Progress value={value} className="mt-2" />
    </div>
  );
}
