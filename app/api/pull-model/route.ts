import { NextResponse } from 'next/server';
import ollama from '@/utils/ollama';

export async function POST(req: Request) {
  try {
    const { model } = await req.json();

    if (!model) {
      return NextResponse.json({ error: "Model name is required" }, { status: 400 });
    }

    const response = await ollama.pull({
      model,
      stream: true,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        for await (const part of response) {
          if (part.status === 'pulling manifest') {
             controller.enqueue(encoder.encode(JSON.stringify({ status: 'manifest', progress: 0 }) + '\n'));
          } else if (part.total && part.completed) {
            const progress = (part.completed / part.total) * 100;
            controller.enqueue(encoder.encode(JSON.stringify({ status: 'downloading', progress }) + '\n'));
          } else {
             controller.enqueue(encoder.encode(JSON.stringify({ status: part.status, progress: 0 }) + '\n'));
          }
        }
        controller.enqueue(encoder.encode(JSON.stringify({ status: 'success', progress: 100 }) + '\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked'
      },
    });
  } catch (error: any) {
    console.error("Model Pull Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
