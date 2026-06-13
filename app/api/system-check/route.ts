import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ping Ollama local API tags endpoint
    const pingResponse = await fetch('http://127.0.0.1:11434/api/tags', { 
      signal: AbortSignal.timeout(2000) 
    });

    if (!pingResponse.ok) {
      return NextResponse.json({ 
        online: false, 
        message: "Ollama is running but the local API returned an unhealthy status code." 
      });
    }

    const data = await pingResponse.json();
    const installedModels = data.models?.map((m: any) => m.name) || [];

    // Diagnostic requirements check
    const requirements = {
      interviewerLoaded: installedModels.includes('llama3.1:8b') || 
                         installedModels.includes('llama3.1:latest') ||
                         installedModels.some((m: string) => m.startsWith('llama3.1')),
      graderLoaded: installedModels.includes('qwen3-coder:30b') || 
                    installedModels.includes('qwen3-coder:latest') || 
                    installedModels.some((m: string) => m.startsWith('qwen2.5-coder')) ||
                    installedModels.some((m: string) => m.startsWith('qwen3-coder')),
    };

    return NextResponse.json({
      online: true,
      installedModels,
      requirements,
      message: "Diagnostics complete."
    });
  } catch (error) {
    return NextResponse.json({
      online: false,
      message: "Ollama daemon unreachable on port 11434. Verify that Ollama is launched and running locally."
    }, { status: 503 });
  }
}
