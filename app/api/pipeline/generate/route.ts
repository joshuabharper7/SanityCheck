import { NextResponse } from 'next/server';
import ollama from '@/utils/ollama';
import { PIPELINE_GENERATION_PROMPT } from '@/utils/prompts';
import { PipelineBlueprintSchema } from '@/utils/schema';

export async function POST(req: Request) {
  try {
    const { jd, forceCoding, skipCoding } = await req.json();

    if (!jd) {
      return NextResponse.json({ error: "Job Description is required" }, { status: 400 });
    }

    const prompt = `
      ${PIPELINE_GENERATION_PROMPT}

      USER CONFIGURATION:
      - forceCoding: ${forceCoding || false}
      - skipCoding: ${skipCoding || false}

      JOB DESCRIPTION:
      ${jd}
    `;

    const response = await ollama.chat({
      model: 'llama3.1:8b',
      messages: [{ role: 'user', content: prompt }],
      format: 'json',
      stream: false,
    });

    const content = response.message.content;
    
    try {
      const jsonContent = JSON.parse(content);
      const validatedData = PipelineBlueprintSchema.parse(jsonContent);
      
      return NextResponse.json(validatedData);
    } catch (parseError: any) {
      console.error("Failed to parse or validate Ollama response:", parseError);
      return NextResponse.json({ 
        error: "Generated pipeline was invalid. Please try again.",
        details: parseError.message,
        raw: content
      }, { status: 422 });
    }

  } catch (error: any) {
    console.error("Pipeline Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
