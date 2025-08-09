import {
  Controller,
  Post,
  Body,
  Sse,
  MessageEvent,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { ChatRequestInput } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: ChatRequestInput) {
    const { model, prompt } = body;
    if (!model || !prompt) {
      throw new BadRequestException('Model and prompt are required');
    }

    console.log({ model, prompt });
    const response = await this.chatService.chat(model, prompt);
    return { reply: response };
  }

  @Sse('stream')
  stream(@Query() query: ChatRequestInput): Observable<MessageEvent> {
    const { model, prompt } = query;
    if (!model || !prompt) {
      throw new BadRequestException('Model and prompt are required');
    }

    return new Observable<MessageEvent>((observer) => {
      (async () => {
        try {
          for await (const chunk of this.chatService.chatStream(
            model,
            prompt,
          )) {
            observer.next({ data: chunk });
          }
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }
}
