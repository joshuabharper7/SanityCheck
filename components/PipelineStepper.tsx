'use client';

import React from 'react';
import { PipelineBlueprint } from '@/utils/schema';
import { CheckCircle2, Circle, Code, MessageSquare, Terminal } from 'lucide-react';

interface PipelineStepperProps {
  blueprint: PipelineBlueprint;
  activeStageIndex?: number;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ 
  blueprint, 
  activeStageIndex = -1 
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'WHITEBOARD_REVIEW': return <Code className="h-5 w-5" />;
      case 'SCENARIO_WALKTHROUGH': return <Terminal className="h-5 w-5" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--fg-text)]">{blueprint.jobTitle}</h2>
          <p className="text-sm text-[var(--fg-text)] opacity-60">
            {blueprint.companyName} • {blueprint.experienceLevel} Experience
          </p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/20 text-[var(--brand-accent)] text-sm font-bold">
          {blueprint.stages.length} Stages Generated
        </div>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-5 left-5 w-[2px] h-[calc(100%-40px)] bg-[var(--border-neutral)] md:top-5 md:left-5 md:w-[calc(100%-40px)] md:h-[2px] -z-10" />

        <div className="flex flex-col md:flex-row justify-between gap-8">
          {blueprint.stages.map((stage, index) => {
            const isActive = index === activeStageIndex;
            const isCompleted = index < activeStageIndex;
            
            return (
              <div key={stage.id} className="flex flex-row md:flex-col items-start gap-4 flex-1">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-[var(--brand-accent)] text-white shadow-[0_0_15px_var(--shadow-brand)]' 
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-[var(--card-canvas)] border-2 border-[var(--border-neutral)] text-[var(--fg-text)] opacity-60'
                }`}>
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : getIcon(stage.type)}
                </div>
                
                <div className="space-y-1">
                  <p className={`text-sm font-bold tracking-tight ${isActive ? 'text-[var(--brand-accent)]' : 'text-[var(--fg-text)]'}`}>
                    {stage.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
                    {stage.type.replace('_', ' ')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {stage.focusTechStack.slice(0, 3).map(tech => (
                      <span key={tech} className="px-1.5 py-0.5 rounded bg-[var(--border-neutral)] text-[8px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
