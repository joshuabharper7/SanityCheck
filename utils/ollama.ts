import { Ollama } from 'ollama';

// In a real local environment, this is usually http://127.0.0.1:11434
// We use a singleton pattern for the Ollama client
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
});

export default ollama;
