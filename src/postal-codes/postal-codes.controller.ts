import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
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
  @HttpCode(200)
  @ApiOperation({
    summary: 'Find a postal code by commune, street, and number',
    description:
      'Searches for a Chilean postal code by commune, street and number. If not found in the DB, the system scrapes Correos de Chile and stores it if valid.',
  })
  @ApiOkResponse({
    description: 'Postal code found successfully.',
    type: PostalCodeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input, missing parameters, or scraping failure.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Commune "LAS CONDES" not found',
        error: 'Bad Request',
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
