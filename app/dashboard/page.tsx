'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PipelineStepper } from '@/components/PipelineStepper';
import { PipelineBlueprint, InterviewHistoryItem } from '@/utils/schema';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { 
  Loader2, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Play, 
  History, 
  X, 
  Calendar, 
  Briefcase, 
  Award,
  ArrowRight,
  RotateCcw,
  Target,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Lightbulb,
  CircleHelp
} from 'lucide-react';

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<PipelineBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration State
  const [skipScreening, setSkipScreening] = useState(false);
  const [forceCoding, setForceCoding] = useState(false);
  const [skipCoding, setSkipCoding] = useState(false);
  const [language, setLanguage] = useState('en-US');

  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<InterviewHistoryItem[]>([]);
  const [selectedItem, setSelectedHistoryItem] = useState<InterviewHistoryItem | null>(null);

  const loadHistory = () => {
    console.log("Loading History...");
    const saved = JSON.parse(localStorage.getItem('sanity_check_history') || '[]');
    console.log("History found:", saved.length, "items");
    setHistoryItems(saved);
    setShowHistory(true);
  };

  const handleRetake = (item: InterviewHistoryItem) => {
    localStorage.setItem('sanity_check_blueprint', JSON.stringify(item.blueprint));
    window.location.href = '/interview';
  };

  const languages = [
    { label: 'English', value: 'en-US' },
    { label: 'Spanish', value: 'es-ES' },
    { label: 'French', value: 'fr-FR' },
    { label: 'German', value: 'de-DE' },
    { label: 'Mandarin', value: 'zh-CN' },
    { label: 'Japanese', value: 'ja-JP' },
  ];

  const handleGenerate = async () => {
    if (!jd.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pipeline/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          jd, 
          skipScreening, 
          forceCoding, 
          skipCoding,
          language: languages.find(l => l.value === language)?.label + " (" + language + ")"
        }),
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
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-text)] p-4 md:p-12 relative overflow-x-hidden">
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
            <Button variant="secondary" size="sm" onClick={loadHistory}>
              <History className="mr-2 h-4 w-4" /> History
            </Button>
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
                  <div className="flex flex-wrap gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-40">Interview Language</label>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="block w-full p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-neutral)] text-sm outline-none focus:border-[var(--brand-accent)]"
                      >
                        {languages.map(l => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-4 items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={skipScreening}
                          onChange={(e) => setSkipScreening(e.target.checked)}
                          className="w-4 h-4 rounded border-[var(--border-neutral)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)] bg-transparent" 
                        />
                        <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">Skip Screening</span>
                        <span className="cursor-help" title="Bypass the initial recruiter/HR screening stage and jump straight into domain-specific interviews.">
                          <CircleHelp className="h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={forceCoding}
                          onChange={(e) => setForceCoding(e.target.checked)}
                          className="w-4 h-4 rounded border-[var(--border-neutral)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)] bg-transparent" 
                        />
                        <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">Force Coding</span>
                        <span className="cursor-help" title="Ensure at least one stage is a technical whiteboard or coding assessment, regardless of the job type.">
                          <CircleHelp className="h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={skipCoding}
                          onChange={(e) => setSkipCoding(e.target.checked)}
                          className="w-4 h-4 rounded border-[var(--border-neutral)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)] bg-transparent" 
                        />
                        <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">Skip Whiteboard</span>
                        <span className="cursor-help" title="Prevent the AI from generating any coding or whiteboard stages, keeping the interview purely conversational or scenario-based.">
                          <CircleHelp className="h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </label>
                    </div>
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
                  <p>1. Paste any job description or just a job title to generate a tailored simulation.</p>
                  <p>2. Our local AI extracts core competencies, experience levels, and role-specific expectations.</p>
                  <p>3. A customized 2-4 stage interview is crafted with unique personas and target rubrics.</p>
                  <p>4. Engage in a high-fidelity session with real-time audio, contextual tools, and local AI evaluation.</p>
                  <p>5. Review your persistent history and localized study plans to track your growth over time.</p>
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

      {/* History Slide-over */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-2xl bg-[var(--bg-canvas)] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <header className="p-6 border-b border-[var(--border-neutral)] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[var(--brand-accent)]/10 flex items-center justify-center text-[var(--brand-accent)]">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Interview History</h2>
                  <p className="text-xs opacity-50 uppercase tracking-widest font-bold">Privacy-First Local Storage</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                <X className="h-5 w-5" />
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {historyItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                   <Briefcase className="h-16 w-16" />
                   <p>No completed interviews found yet.</p>
                </div>
              ) : selectedItem ? (
                /* Detail View (Scorecard) */
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                   <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setSelectedHistoryItem(null)}>
                      <ChevronRight className="rotate-180 mr-2 h-4 w-4" /> Back to List
                   </Button>
                   
                   <div className="space-y-2">
                     <h3 className="text-3xl font-black tracking-tight">{selectedItem.blueprint.jobTitle}</h3>
                     <p className="text-lg opacity-60">{selectedItem.blueprint.companyName}</p>
                   </div>

                   <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-[var(--brand-accent)]/20">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Overall Score</p>
                        <div className="flex items-baseline gap-1">
                           <span className="text-5xl font-black text-[var(--brand-accent)]">{selectedItem.scorecard.overallScore}</span>
                           <span className="text-xl font-bold opacity-20">/100</span>
                        </div>
                      </div>
                      <Button size="lg" className="rounded-xl px-6" onClick={() => handleRetake(selectedItem)}>
                         <RotateCcw className="mr-2 h-4 w-4" /> Re-take Interview
                      </Button>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <HistoryMetric label="Tech" value={selectedItem.scorecard.metrics.technicalAccuracy} icon={<Target className="h-3 w-3" />} />
                      <HistoryMetric label="Comm" value={selectedItem.scorecard.metrics.communicationClarity} icon={<TrendingUp className="h-3 w-3" />} />
                      <HistoryMetric label="Honesty" value={selectedItem.scorecard.metrics.honestyAndHumility} icon={<ShieldAlert className="h-3 w-3" />} />
                      <HistoryMetric label="STAR" value={selectedItem.scorecard.metrics.starAlignment} icon={<CheckCircle2 className="h-3 w-3" />} />
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
                        <Lightbulb className="h-3 w-3" /> Study Plan Highlights
                      </h4>
                      <div className="space-y-2">
                        {selectedItem.scorecard.localStudyPlan.map((p, i) => (
                          <div key={i} className="p-3 rounded-xl bg-black/20 border border-[var(--border-neutral)] text-xs">
                             <span className="font-bold text-[var(--brand-accent)] mr-2">{p.concept}:</span>
                             <span className="opacity-60">{p.reason}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              ) : (
                /* List View */
                historyItems.map((item) => (
                  <Card key={item.id} className="group hover:border-[var(--brand-accent)]/40 transition-colors cursor-pointer" onClick={() => setSelectedHistoryItem(item)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{item.blueprint.jobTitle}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] font-bold">
                            {item.scorecard.overallScore}%
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] opacity-40 font-medium">
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {item.blueprint.companyName}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Retake Interview" onClick={(e) => { e.stopPropagation(); handleRetake(item); }}>
                            <RotateCcw className="h-4 w-4" />
                         </Button>
                         <ChevronRight className="h-4 w-4 text-[var(--brand-accent)]" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function HistoryMetric({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="p-3 rounded-xl bg-black/10 border border-[var(--border-neutral)] flex items-center justify-between">
       <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-[var(--brand-accent)]/10 flex items-center justify-center text-[var(--brand-accent)]">
            {icon}
          </div>
          <span className="text-[10px] font-bold uppercase opacity-40 tracking-tighter">{label}</span>
       </div>
       <span className="text-xs font-black">{value}%</span>
    </div>
  );
}
