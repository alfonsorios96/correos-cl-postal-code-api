import { ApiProperty } from '@nestjs/swagger';

export class CommuneSummaryDto {
  @ApiProperty({ example: 'b3e8f284-b6ce-4b92-bbfb-021153a498f6' })
  id: string;

  @ApiProperty({ example: 'LA FLORIDA' })
  name: string;
}
