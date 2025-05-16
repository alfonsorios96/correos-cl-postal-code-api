import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { RegionResponseDto } from './dto/region-response.dto';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get('with-communes')
  @ApiOperation({
    summary: 'Get all regions with their communes',
    description: 'Returns all Chilean regions, each with its list of communes.',
  })
  @ApiOkResponse({
    description: 'List of regions with communes retrieved successfully.',
    type: RegionResponseDto,
    isArray: true,
  })
  async findAllWithCommunes(): Promise<RegionResponseDto[]> {
    return this.regionsService.findAllWithCommunes();
  }
}
