import { IsString, IsNotEmpty } from 'class-validator';

export class ChatRequestInput {
  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;
}
