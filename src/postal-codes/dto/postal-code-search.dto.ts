/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostalCodeSearchDto {
  @ApiProperty({
    example: 'LA FLORIDA',
    description: 'Name of the commune',
  })
  @IsString()
  @IsNotEmpty()
  commune: string;

  @ApiProperty({
    example: 'LAS ACACIAS',
    description: 'Street name',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    example: '7700',
    description: 'Street number',
  })
  @IsString()
  @IsNotEmpty()
  number: string;
}
