export default () => ({
  environment: process.env.ENVIRONMENT || 'Development',
  appName: process.env.APP_NAME || 'Localama API',
  hostUrl: process.env.HOST_URL || 'http://localhost',
  port: parseInt(process.env.PORT || '5050', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434/api/chat',
});
