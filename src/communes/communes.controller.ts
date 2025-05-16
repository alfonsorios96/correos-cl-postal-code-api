import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommunesService } from './communes.service';
import { CommuneResponseDto } from './dto/commune-response.dto';

@ApiTags('Communes')
@Controller('communes')
export class CommunesController {
  constructor(private readonly communesService: CommunesService) {}

  @Get('all')
  @ApiOperation({
    summary: 'Get all communes in Chile',
    description: 'Returns all Chilean communes ordered alphabetically by name.',
  })
  @ApiOkResponse({
    description: 'List of communes retrieved successfully.',
    type: CommuneResponseDto,
    isArray: true,
  })
  async findAll(): Promise<CommuneResponseDto[]> {
    return this.communesService.findAllSorted();
  }
}
