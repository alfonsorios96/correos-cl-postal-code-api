import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SeedRequestDto {
  @ApiProperty({
    description: 'Secure password required to run the seeder.',
    example: 'supersecure-long-password-5481',
    minLength: 20,
  })
  @IsString()
  @MinLength(20)
  password: string;
}
