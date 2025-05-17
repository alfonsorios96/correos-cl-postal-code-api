import { ApiProperty } from '@nestjs/swagger';

export class AppStatsDto {
  @ApiProperty({
    example: 16,
    description: 'Total number of regions in the database',
  })
  regions: number;

  @ApiProperty({
    example: 346,
    description: 'Total number of communes in the database',
  })
  communes: number;

  @ApiProperty({
    example: 10500,
    description: 'Total number of streets in the database',
  })
  streets: number;

  @ApiProperty({
    example: 158000,
    description: 'Total number of street numbers in the database',
  })
  streetNumbers: number;

  @ApiProperty({
    example: 145000,
    description: 'Total number of postal codes in the database',
  })
  postalCodes: number;
}
