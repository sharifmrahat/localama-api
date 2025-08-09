import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly configService: ConfigService;
  // In-memory chat history, keyed by sessionId or userId
  private chatHistories: Record<string, { role: string; content: string }[]> =
    {};

  async chat(model: string, prompt: string, sessionId: string = 'default') {
    // Append user message to history
    if (!this.chatHistories[sessionId]) {
      this.chatHistories[sessionId] = [];
    }
    this.chatHistories[sessionId].push({ role: 'user', content: prompt });

    const ollamaHost = 'http://localhost:11434/api/chat';

    const response = await fetch(ollamaHost, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: this.chatHistories[sessionId],
        stream: false,
      }),
    });

    console.log({ response });

    if (!response.ok) {
      this.logger.error(`Ollama API error: ${response.statusText}`);
      throw new Error('Failed to get response from Ollama');
    }

    const data = await response.json();

    console.log({ data });

    // Save assistant reply in history
    const assistantMessage = data.message?.content || '';
    this.chatHistories[sessionId].push({
      role: 'assistant',
      content: assistantMessage,
    });

    console.log({ response, data, assistantMessage });

    return assistantMessage;
  }

  async *chatStream(
    model: string,
    prompt: string,
    sessionId: string = 'default',
  ) {
    if (!this.chatHistories[sessionId]) {
      this.chatHistories[sessionId] = [];
    }
    this.chatHistories[sessionId].push({ role: 'user', content: prompt });

    const ollamaHost = this.configService.get<string>('OLLAMA_HOST');

    const response = await fetch(ollamaHost, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: this.chatHistories[sessionId],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get streaming response from Ollama');
    }

    const decoder = new TextDecoder();
    let assistantMessage = '';

    for await (const chunk of response.body) {
      // Ensure chunk is a Uint8Array for TextDecoder
      const uint8Chunk =
        typeof chunk === 'string' ? Buffer.from(chunk) : new Uint8Array(chunk);
      const textChunk = decoder.decode(uint8Chunk, { stream: true });
      assistantMessage += textChunk;
      yield textChunk;
    }

    // Final decode flush
    assistantMessage += decoder.decode();
    this.chatHistories[sessionId].push({
      role: 'assistant',
      content: assistantMessage,
    });
  }
}
