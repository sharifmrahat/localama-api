import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStart(): { status: number; message: string; success: boolean } {
    return this.appService.getStart();
  }
}
