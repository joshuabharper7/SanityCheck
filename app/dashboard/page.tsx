'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PipelineStepper } from '@/components/PipelineStepper';
import { PipelineBlueprint } from '@/utils/schema';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { Loader2, Sparkles, FileText, ChevronRight, Play } from 'lucide-react';

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<PipelineBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!jd.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pipeline/generate', {
        method: 'POST',
        body: JSON.stringify({ jd }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate pipeline');
      
      setBlueprint(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-text)] p-4 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Interview Dashboard</h1>
            <p className="opacity-60 text-sm">Prepare for your next role with custom AI pipelines.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex p-1 rounded-lg bg-[var(--card-canvas)] border border-[var(--border-neutral)]">
              {(['sleek-dark', 'clean-light', 'ocean-blue', 'forest-green', 'deep-purple'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-6 h-6 rounded-md m-0.5 transition-all ${
                    theme === t ? 'ring-2 ring-[var(--brand-accent)] scale-110' : 'opacity-40 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: t === 'sleek-dark' ? '#090d16' : 
                                     t === 'clean-light' ? '#f8fafc' :
                                     t === 'ocean-blue' ? '#020c1b' :
                                     t === 'forest-green' ? '#050f08' : '#070412'
                  }}
                  title={t.replace('-', ' ')}
                />
              ))}
            </div>
            <Button variant="secondary" size="sm">History</Button>
          </div>
        </header>

        {!blueprint ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[var(--brand-accent)]" />
                    New Interview Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-70">Paste Job Description</label>
                    <textarea 
                      className="w-full h-64 p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-neutral)] focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] outline-none transition-all resize-none text-sm leading-relaxed"
                      placeholder="Paste the full job description here to generate a tailored interview path..."
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-neutral)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)] bg-transparent" />
                      <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">Force Coding Stage</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-neutral)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)] bg-transparent" />
                      <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">Skip Whiteboard</span>
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={loading || !jd.trim()}
                    className="w-full py-6 text-lg rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing JD & Crafting Pipeline...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Smart Pipeline
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  <p className="font-bold mb-1">Generation Failed</p>
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How it works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm opacity-70 leading-relaxed">
                  <p>1. Paste a job description from LinkedIn, Indeed, or a company site.</p>
                  <p>2. Our local AI extracts the tech stack, experience level, and role expectations.</p>
                  <p>3. A customized 3-4 stage interview is generated with unique personas and question pools.</p>
                  <p>4. Start the interactive session with real-time audio and code evaluation.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-8">
              <PipelineStepper blueprint={blueprint} />
              <div className="mt-12 flex justify-between items-center pt-8 border-t border-[var(--border-neutral)]">
                <Button variant="ghost" onClick={() => setBlueprint(null)}>
                  Reset & Edit JD
                </Button>
                <Button 
                  size="lg" 
                  className="px-12 py-6 text-lg rounded-xl"
                  onClick={() => {
                    localStorage.setItem('sanity_check_blueprint', JSON.stringify(blueprint));
                    window.location.href = '/interview';
                  }}
                >
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Start Interview Session
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blueprint.stages.map((stage, i) => (
                <Card key={stage.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-[var(--brand-accent)] uppercase tracking-widest">
                      Stage {i + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[var(--border-neutral)] text-[8px] font-mono opacity-60">
                      {stage.type}
                    </span>
                  </div>
                  <h4 className="font-bold mb-2">{stage.name}</h4>
                  <p className="text-xs opacity-60 line-clamp-3 mb-4 italic">
                    "{stage.interviewerPersona}"
                  </p>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase opacity-40">Focus Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {stage.focusTechStack.map(tech => (
                        <span key={tech} className="px-1.5 py-0.5 rounded border border-[var(--border-neutral)] text-[8px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
