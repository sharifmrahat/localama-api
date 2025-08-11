import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStart(): { status: number; message: string } {
    return {
      status: 200,
      message: 'Localama API is Running',
    };
  }
}
