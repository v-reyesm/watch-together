import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token obtained from Google Identity Services',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token de Google es obligatorio' })
  idToken: string;
}
