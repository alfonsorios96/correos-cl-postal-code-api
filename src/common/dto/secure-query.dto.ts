import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SecureQueryDto {
  @ApiProperty({
    description: 'Secure password to access protected endpoints',
    example: 'supersecure-long-password-5481',
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
