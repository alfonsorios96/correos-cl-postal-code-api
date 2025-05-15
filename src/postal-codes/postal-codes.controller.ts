/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PostalCodesService } from './postal-codes.service';
import { PostalCodeSearchDto } from './dto/postal-code-search.dto';
import { PostalCodeResponseDto } from './dto/postal-code-response.dto';

@ApiTags('Postal Codes')
@Controller('postal-codes')
export class PostalCodesController {
  constructor(private readonly postalCodesService: PostalCodesService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Find a postal code by commune, street, and number',
    description:
      'Looks up a Chilean postal code using Correos de Chile. If not cached, it scrapes the website and stores the result.',
  })
  @ApiQuery({ name: 'commune', required: true, example: 'LA FLORIDA' })
  @ApiQuery({ name: 'street', required: true, example: 'LAS ACACIAS' })
  @ApiQuery({ name: 'number', required: true, example: '7700' })
  @ApiOkResponse({
    description: 'Postal code found successfully.',
    type: PostalCodeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or scraping failure.',
    schema: {
      example: {
        error: 'Scraper failed: Search button did not become enabled in time.',
      },
    },
  })
  async search(
    @Query() dto: PostalCodeSearchDto,
  ): Promise<PostalCodeResponseDto> {
    const result = await this.postalCodesService.findOrScrape(dto);

    if ('error' in result) {
      throw new BadRequestException(result.error);
    }

    return result;
  }
}
