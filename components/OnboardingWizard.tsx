'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Cpu, Download, Zap } from 'lucide-react';

type Tier = 'LITE' | 'STANDARD' | 'PRO';

interface ModelConfig {
  interviewer: string;
  grader: string;
  req: string;
  tooltip: string;
}

const TIER_CONFIG: Record<Tier, ModelConfig> = {
  LITE: { 
    interviewer: 'llama3.2:3b', 
    grader: 'qwen2.5-coder:7b', 
    req: '< 8GB RAM', 
    tooltip: 'For older hardware or limited resources.' 
  },
  STANDARD: { 
    interviewer: 'llama3.1:8b', 
    grader: 'qwen2.5-coder:14b', 
    req: '8GB - 16GB RAM', 
    tooltip: 'Recommended balance for modern laptops.' 
  },
  PRO: { 
    interviewer: 'llama3.1:8b', 
    grader: 'qwen3-coder:30b', 
    req: '>= 16GB RAM', 
    tooltip: 'For high-end workstations and dedicated GPUs.' 
  }
};

interface SystemStatus {
  online: boolean;
  message: string;
  installedModels?: string[];
}

export const OnboardingWizard: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<Tier>('STANDARD');
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [pullStatus, setPullStatus] = useState<string>('');

  const checkSystem = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system-check');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystem();
  }, []);

  const handlePullModel = async (model: string) => {
    setPullingModel(model);
    setPullProgress(0);
    setPullStatus('Initializing...');
    try {
      const response = await fetch('/api/pull-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            setPullProgress(data.progress || 0);
            setPullStatus(data.status || 'Downloading...');
            if (data.status === 'success') {
              setTimeout(() => { setPullingModel(null); checkSystem(); }, 1000);
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      setPullStatus('Error pulling model');
      setTimeout(() => setPullingModel(null), 3000);
    }
  };

  if (loading && !pullingModel) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-[var(--brand-accent)]" />
        <p className="text-lg font-medium text-[var(--fg-text)]">Detecting Environment...</p>
      </div>
    );
  }

  const isOllamaRunning = status?.online;
  const installed = status?.installedModels || [];
  const currentConfig = TIER_CONFIG[tier];
  
  const interviewerReady = installed.some(m => m.includes(currentConfig.interviewer));
  const graderReady = installed.some(m => m.includes(currentConfig.grader));

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Tier Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(Object.keys(TIER_CONFIG) as Tier[]).map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            title={TIER_CONFIG[t].tooltip}
            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              tier === t 
                ? 'bg-[var(--brand-accent)]/10 border-[var(--brand-accent)] shadow-[0_0_15px_var(--shadow-brand)]' 
                : 'bg-[var(--card-canvas)] border-[var(--border-neutral)] opacity-60 hover:opacity-100'
            }`}
          >
            <Zap className={`h-5 w-5 ${tier === t ? 'text-[var(--brand-accent)]' : ''}`} />
            <span className="text-xs font-black tracking-widest">{t} TIER</span>
            <div className="space-y-1 text-[10px] opacity-60 font-mono text-center">
              <p className="font-bold text-[var(--brand-accent)]">{TIER_CONFIG[t].req}</p>
              <div className="opacity-50">
                <p>{TIER_CONFIG[t].interviewer}</p>
                <p>{TIER_CONFIG[t].grader}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Card glow={!isOllamaRunning || !interviewerReady || !graderReady}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-[var(--brand-accent)]" />
            Environment Setup Wizard
          </CardTitle>
          <p className="text-sm text-[var(--fg-text)] opacity-70">
            Current Tier: <span className="font-bold text-[var(--brand-accent)]">{tier}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ollama Connection */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--border-neutral)]/30 border border-[var(--border-neutral)]">
            <div className="flex items-center gap-3">
              {isOllamaRunning ? <CheckCircle className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />}
              <div>
                <p className="font-semibold text-[var(--fg-text)]">Ollama Connection</p>
                <p className="text-xs text-[var(--fg-text)] opacity-60">Port 11434 status</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOllamaRunning ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              {isOllamaRunning ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Interviewer Model */}
          <div className="p-4 rounded-lg bg-[var(--border-neutral)]/30 border border-[var(--border-neutral)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {interviewerReady ? <CheckCircle className="h-6 w-6 text-green-500" /> : <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                <div>
                  <p className="font-semibold text-[var(--fg-text)]">Interviewer Engine</p>
                  <p className="text-xs text-[var(--fg-text)] opacity-60">{currentConfig.interviewer}</p>
                </div>
              </div>
              {interviewerReady ? <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500">READY</span> : (
                <Button size="sm" variant="outline" className="h-8" onClick={() => handlePullModel(currentConfig.interviewer)} disabled={!!pullingModel}>
                  {pullingModel === currentConfig.interviewer ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="mr-2 h-3 w-3" />}
                  {pullingModel === currentConfig.interviewer ? 'Pulling...' : 'Pull Model'}
                </Button>
              )}
            </div>
            {pullingModel === currentConfig.interviewer && <div className="mt-4"><Progress value={pullProgress} label={pullStatus} /></div>}
          </div>

          {/* Evaluation Model */}
          <div className="p-4 rounded-lg bg-[var(--border-neutral)]/30 border border-[var(--border-neutral)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {graderReady ? <CheckCircle className="h-6 w-6 text-green-500" /> : <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                <div>
                  <p className="font-semibold text-[var(--fg-text)]">Evaluation Engine</p>
                  <p className="text-xs text-[var(--fg-text)] opacity-60">{currentConfig.grader}</p>
                </div>
              </div>
              {graderReady ? <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500">READY</span> : (
                <Button size="sm" variant="outline" className="h-8" onClick={() => handlePullModel(currentConfig.grader)} disabled={!!pullingModel}>
                  {pullingModel === currentConfig.grader ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="mr-2 h-3 w-3" />}
                  {pullingModel === currentConfig.grader ? 'Pulling...' : 'Pull Model'}
                </Button>
              )}
            </div>
            {pullingModel === currentConfig.grader && <div className="mt-4"><Progress value={pullProgress} label={pullStatus} /></div>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-6">
          {!isOllamaRunning && (
            <div className="w-full p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-[var(--fg-text)] space-y-4">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-bold">Ollama Daemon Unreachable</p>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                {status?.message || "Please ensure Ollama is installed and running on your machine."}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a 
                  href="https://ollama.com/download/windows" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  <Download className="mr-2 h-4 w-4" /> Download Ollama for Windows
                </a>
                <Button variant="secondary" size="sm" onClick={checkSystem}>
                  I've launched it, retry!
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-between w-full">
            <Button variant="secondary" onClick={checkSystem} disabled={loading || !!pullingModel}>Refresh Status</Button>
            <Button variant="primary" disabled={!isOllamaRunning || !interviewerReady || !graderReady || !!pullingModel} onClick={() => window.location.href = '/dashboard'}>
              Proceed to Dashboard
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
