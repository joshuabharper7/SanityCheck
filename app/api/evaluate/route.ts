import { NextResponse } from 'next/server';
import ollama from '@/utils/ollama';
import { EVALUATION_SYSTEM_PROMPT } from '@/utils/prompts';
import { EvaluationScorecardSchema } from '@/utils/schema';

export async function POST(req: Request) {
  try {
    const { history, blueprint } = await req.json();

    if (!history || !blueprint) {
      return NextResponse.json({ error: "Transcript history and blueprint are required" }, { status: 400 });
    }

    const prompt = `
      ${EVALUATION_SYSTEM_PROMPT}

      INTERVIEW BLUEPRINT:
      Job Title: ${blueprint.jobTitle}
      Company: ${blueprint.companyName}
      Experience Level: ${blueprint.experienceLevel}

      INTERVIEW TRANSCRIPT:
      ${history.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}
    `;

    // Tiered model selection for evaluation
    let response;
    const modelsToTry = ['qwen3-coder:30b', 'qwen2.5-coder:14b', 'qwen2.5-coder:7b', 'llama3.1:8b'];
    
    for (const model of modelsToTry) {
      try {
        response = await ollama.chat({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          format: 'json',
          stream: false,
        });
        if (response) break;
      } catch (e) {
        console.warn(`Model ${model} not found or failed, trying next...`);
      }
    }

    if (!response) {
      throw new Error("No suitable evaluation model found. Please pull models in the setup wizard.");
    }

    const content = response.message.content;
    
    try {
      const jsonContent = JSON.parse(content);
      const validatedData = EvaluationScorecardSchema.parse(jsonContent);
      
      return NextResponse.json(validatedData);
    } catch (parseError: any) {
      console.error("Failed to parse or validate evaluation response:", parseError);
      return NextResponse.json({ 
        error: "Evaluation failed to generate valid structured data.",
        details: parseError.message,
        raw: content
      }, { status: 422 });
    }

  } catch (error: any) {
    console.error("Evaluation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
