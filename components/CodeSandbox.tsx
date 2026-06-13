'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Send, Code2, Save, Trash2 } from 'lucide-react';

interface CodeSandboxProps {
  initialValue?: string;
  onSubmit: (code: string) => void;
  title?: string;
}

export const CodeSandbox: React.FC<CodeSandboxProps> = ({ 
  initialValue = '', 
  onSubmit,
  title = "Technical Workspace"
}) => {
  const [code, setCode] = useState(initialValue);

  return (
    <div className="flex flex-col h-full bg-[var(--card-canvas)] rounded-2xl border border-[var(--border-neutral)] overflow-hidden shadow-2xl">
      {/* Sandbox Header */}
      <div className="px-6 py-4 border-b border-[var(--border-neutral)] bg-black/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-[var(--brand-accent)]" />
          <span className="text-xs font-bold uppercase tracking-widest opacity-70">{title}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCode('')} title="Clear">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Save Draft">
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 w-full h-full p-6 bg-transparent text-[var(--fg-text)] font-mono text-sm leading-relaxed resize-none outline-none focus:ring-0"
          placeholder="// Write your code, notes, or architectural diagram here...
// Example:
function solve() {
  return true;
}"
        />
      </div>

      {/* Submission Footer */}
      <div className="p-4 bg-black/10 border-t border-[var(--border-neutral)] flex justify-end items-center gap-4">
        <p className="text-[10px] opacity-40 italic">Submit when ready for AI review</p>
        <Button 
          onClick={() => onSubmit(code)} 
          disabled={!code.trim()}
          className="rounded-xl px-6"
        >
          Submit Solution <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
