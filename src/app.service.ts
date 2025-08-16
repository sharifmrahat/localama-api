import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStart(): { status: number; message: string; success: boolean } {
    return {
      status: 200,
      success: true,
      message: 'Localama API is Running',
    };
  }
}
