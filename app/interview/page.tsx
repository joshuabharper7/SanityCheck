'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CodeSandbox } from '@/components/CodeSandbox';
import { PipelineBlueprint, PipelineStage } from '@/utils/schema';
import { 
  Mic, 
  MicOff, 
  MessageSquare, 
  ChevronRight, 
  ArrowLeft, 
  Loader2, 
  Volume2, 
  VolumeX,
  Play,
  Terminal,
  Code,
  Square
} from 'lucide-react';

export default function InterviewPage() {
  const [blueprint, setBlueprint] = useState<PipelineBlueprint | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const { isListening, liveStreamText, startListening, stopAndSubmit } = useSpeechToText(blueprint?.languageCode || 'en-US');

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, streamingText, liveStreamText]);

  useEffect(() => {
    const saved = localStorage.getItem('sanity_check_blueprint');
    if (saved) {
      try {
        setBlueprint(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse blueprint", e);
      }
    }
  }, []);

  const handleMicToggle = async () => {
    if (isListening) {
      const transcript = stopAndSubmit();
      if (transcript) {
        const newUserMessage = { role: 'user' as const, content: transcript };
        const updatedHistory = [...history, newUserMessage];
        setHistory(updatedHistory);
        processAIResponse(updatedHistory);
      }
    } else {
      startListening();
    }
  };

  const processAIResponse = async (chatHistory: { role: 'user' | 'assistant', content: string }[]) => {
    if (!blueprint) return;
    
    setIsProcessing(true);
    setStreamingText('');
    
    const currentStage = blueprint.stages[currentStageIndex];
    const currentQuestion = currentStage.questionPool[currentQuestionIndex];

    try {
      const response = await fetch('/api/interview/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: chatHistory,
          systemPersona: currentStage.interviewerPersona,
          activeQuestion: currentQuestion.questionText,
          rubric: currentQuestion.idealRubric
        })
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        fullText += chunk;
        // Clean streaming text to hide token mid-stream
        setStreamingText(fullText.replace(/\[?_?NEXT_QUESTION_?\]?/i, '').trim());
      }

      // Robust check for transition token using regex
      const tokenRegex = /\[?_?NEXT_QUESTION_?\]?/i;
      const shouldAdvance = tokenRegex.test(fullText);
      const cleanText = fullText.replace(tokenRegex, '').trim();

      setHistory(prev => [...prev, { role: 'assistant', content: cleanText }]);
      speak(cleanText, () => {
        if (shouldAdvance) {
          nextQuestion();
        }
      }, blueprint?.languageCode || 'en-US');
      setStreamingText('');
      
    } catch (error) {
      console.error("Stream Error", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCodeSubmit = (code: string) => {
    const submissionMessage = `[USER SUBMITTED CODE/NOTES]:\n\`\`\`\n${code}\n\`\`\``;
    const updatedHistory = [...history, { role: 'user' as const, content: submissionMessage }];
    setHistory(updatedHistory);
    processAIResponse(updatedHistory);
  };

  const startInterview = () => {
    if (!blueprint) return;
    setIsStarted(true);
    const firstStage = blueprint.stages[0];
    const firstQuestion = firstStage.questionPool[0].questionText;
    const initialMessage = `Hello. I am your interviewer today. We are starting with the ${firstStage.name} stage. Here is your first question: ${firstQuestion}`;
    setHistory([{ role: 'assistant', content: initialMessage }]);
    speak(initialMessage, undefined, blueprint?.languageCode || 'en-US');
  };

  const nextQuestion = () => {
    if (!blueprint) return;
    
    const currentStage = blueprint.stages[currentStageIndex];
    let nextStageIdx = currentStageIndex;
    let nextQuestionIdx = currentQuestionIndex;

    if (currentQuestionIndex < currentStage.questionPool.length - 1) {
      nextQuestionIdx++;
    } else if (currentStageIndex < blueprint.stages.length - 1) {
      nextStageIdx++;
      nextQuestionIdx = 0;
    } else {
      // Interview complete
      localStorage.setItem('sanity_check_transcript', JSON.stringify(history));
      window.location.href = '/recap';
      return;
    }

    setCurrentStageIndex(nextStageIdx);
    setCurrentQuestionIndex(nextQuestionIdx);

    const nextQuestionText = blueprint.stages[nextStageIdx].questionPool[nextQuestionIdx].questionText;
    const transitionMessage = nextQuestionIdx === 0 
      ? `Moving on to the ${blueprint.stages[nextStageIdx].name} stage. Here is your question: ${nextQuestionText}`
      : `Let's move to the next item. ${nextQuestionText}`;

    setHistory(prev => [...prev, { role: 'assistant', content: transitionMessage }]);
    speak(transitionMessage, undefined, blueprint?.languageCode || 'en-US');
  };

  if (!blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)]">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--brand-accent)]" />
      </div>
    );
  }

  const currentStage = blueprint.stages[currentStageIndex];
  const isSplitScreen = currentStage.type === 'WHITEBOARD_REVIEW';

  if (!isStarted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)] p-4">
        <Card className="max-w-xl w-full text-center p-12">
          <CardHeader>
            <div className="mx-auto w-20 h-20 rounded-full bg-[var(--brand-accent)]/10 flex items-center justify-center mb-6">
              <Play className="h-10 w-10 text-[var(--brand-accent)] fill-current" />
            </div>
            <CardTitle className="text-3xl">Ready to Begin?</CardTitle>
            <p className="opacity-60 mt-2">
              You are about to start your mock interview for <strong>{blueprint.jobTitle}</strong>.
              Ensure your microphone and speakers are working.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 py-8">
            <div className="flex justify-center gap-8 text-sm font-medium">
              <div className="flex flex-col items-center">
                <span className="text-[var(--brand-accent)] text-xl font-bold">{blueprint.stages.length}</span>
                <span className="opacity-40 uppercase tracking-widest text-[10px]">Stages</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[var(--brand-accent)] text-xl font-bold">{blueprint.stages.length * 3}</span>
                <span className="opacity-40 uppercase tracking-widest text-[10px]">Questions</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[var(--brand-accent)] text-xl font-bold">~25m</span>
                <span className="opacity-40 uppercase tracking-widest text-[10px]">Duration</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={startInterview} className="w-full py-6 text-lg rounded-xl">
              Start Session
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="h-screen bg-[var(--bg-canvas)] text-[var(--fg-text)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-[var(--border-neutral)] flex justify-between items-center bg-[var(--card-canvas)]/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--brand-accent)] flex items-center justify-center">
            {currentStage.type === 'WHITEBOARD_REVIEW' ? <Code className="h-5 w-5 text-white" /> : 
             currentStage.type === 'SCENARIO_WALKTHROUGH' ? <Terminal className="h-5 w-5 text-white" /> : 
             <MessageSquare className="h-5 w-5 text-white" />}
          </div>
          <div>
            <h2 className="font-bold text-sm">{currentStage.name}</h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(currentStage.questionPool.length)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 w-4 rounded-full ${i <= currentQuestionIndex ? 'bg-[var(--brand-accent)]' : 'bg-[var(--border-neutral)]'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">
                Question {currentQuestionIndex + 1} of 3
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
             <p className="text-[10px] font-bold uppercase opacity-30 tracking-widest">Candidate</p>
             <p className="text-xs font-medium">{blueprint.jobTitle}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => { stopSpeaking(); window.location.href = '/dashboard'; }}>
            Quit Session
          </Button>
        </div>
      </header>

      {/* Main Workspace Split */}
      <div className={`flex-1 grid ${isSplitScreen ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} overflow-hidden`}>
        
        {/* Chat / Interviewer Side */}
        <div className="flex flex-col h-full border-r border-[var(--border-neutral)]/50 bg-black/5 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="max-w-2xl mx-auto w-full space-y-6">
              {history.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`max-w-[90%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-[var(--brand-accent)] text-white rounded-tr-none' 
                      : 'glass-panel rounded-tl-none'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content.startsWith('[USER SUBMITTED') ? (
                        <div className="space-y-2">
                           <p className="font-bold text-[10px] opacity-60 uppercase tracking-tighter italic">Technical Submission Received</p>
                           <pre className="text-[10px] font-mono bg-black/20 p-2 rounded overflow-x-auto">{msg.content.split('\n').slice(2, -1).join('\n')}</pre>
                        </div>
                      ) : msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {streamingText && (
                <div className="flex justify-start animate-in fade-in duration-200">
                  <div className="max-w-[90%] p-4 rounded-2xl glass-panel rounded-tl-none border-[var(--brand-accent)]/30">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{streamingText.replace('[NEXT_QUESTION]', '')}</p>
                    <div className="mt-2 flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)] animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)] animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              {isListening && (
                <div className="flex justify-end pt-4">
                  <div className="max-w-[85%] p-4 rounded-2xl bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/20 text-[var(--brand-accent)] rounded-tr-none italic">
                    <p className="text-sm">{liveStreamText || "Listening..."}</p>
                    <p className="text-[9px] mt-2 font-bold uppercase tracking-widest opacity-60">Recording - Click Mic to Stop</p>
                  </div>
                </div>
              )}
              
              {/* Reference point for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Controls */}
          <div className="p-6 border-t border-[var(--border-neutral)]/50 bg-[var(--card-canvas)]/30">
             <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <Button 
                    size="lg"
                    variant={isListening ? "primary" : "outline"}
                    className={`w-16 h-16 rounded-full transition-all duration-300 ${isListening ? 'scale-110 shadow-[0_0_25px_var(--shadow-brand)] animate-pulse' : ''}`}
                    onClick={handleMicToggle}
                    disabled={isProcessing || isSpeaking}
                  >
                    {isListening ? <Square className="h-6 w-6 fill-white" /> : <Mic className="h-6 w-6" />}
                  </Button>

                  <div className="flex flex-col items-start gap-1">
                    <div className={`h-4 flex items-center gap-0.5`}>
                      {isSpeaking && [...Array(5)].map((_, i) => (
                        <div key={i} className="w-0.5 bg-[var(--brand-accent)] rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDuration: `${0.5 + Math.random()}s` }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {isSpeaking ? 'AI Speaking' : isListening ? 'Recording Answer' : 'Waiting'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={nextQuestion} disabled={isProcessing || isSpeaking}>
                    Skip Question <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
             </div>
          </div>
        </div>

        {/* Sandbox Side (Conditional) */}
        {isSplitScreen && (
          <div className="hidden lg:flex flex-col h-full p-6 bg-black/20 animate-in fade-in slide-in-from-right-4 duration-500">
            <CodeSandbox 
              title={currentStage.type === 'WHITEBOARD_REVIEW' ? 'Code Editor' : 'Environment Sandbox'}
              onSubmit={handleCodeSubmit}
            />
          </div>
        )}

      </div>
    </main>
  );
}
