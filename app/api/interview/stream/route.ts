import { NextResponse } from 'next/server';
import ollama from '@/utils/ollama';

export async function POST(req: Request) {
  try {
    const { history, systemPersona, activeQuestion, rubric } = await req.json();

    const formattedMessages = [
      { 
        role: 'system', 
        content: `
You are the interviewer. Your profile settings: [${systemPersona}].
You are evaluating the candidate on this question: "${activeQuestion}".
Key metrics of a passing answer: "${rubric}".

CRITICAL INSTRUCTIONS:
1. Speak with high human authenticity: use natural conversational fillers like "Hmm," "I see," or "That's an interesting point" where appropriate.
2. Maintain a professional, supportive, but technically rigorous tone.
3. Keep responses concise (maximum of 2 short paragraphs, under 70 words total).
4. If the candidate answers partially, you may ask ONE targeted follow-up question to probe their depth.
5. If they satisfy the rubric or state they don't know, acknowledge it naturally and transition.
6. If they say they do not know, praise their honesty and immediately pivot.
7. CRITICAL STATE CONTROL: If the candidate has satisfied the core rubric for the current question ("${activeQuestion}"), OR if you have already asked a follow-up and decide to move on, you MUST append the exact string [NEXT_QUESTION] at the very end of your response.
8. Never break character. Never output technical evaluations mid-interview.
        `
      },
      ...history
    ];

    const streamResponse = await ollama.chat({
      model: 'llama3.1:8b',
      messages: formattedMessages,
      stream: true
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamResponse) {
          const chunkText = chunk.message.content;
          if (chunkText) {
            controller.enqueue(encoder.encode(chunkText));
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (error: any) {
    console.error("Interview Stream Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
