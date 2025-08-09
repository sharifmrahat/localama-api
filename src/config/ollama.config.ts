export default () => ({
  ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434/api/chat',
});
