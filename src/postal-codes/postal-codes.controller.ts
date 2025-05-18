import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PostalCodesService } from './postal-codes.service';
import { PostalCodeSearchDto } from './dto/postal-code-search.dto';
import { PostalCodeResponseDto } from './dto/postal-code-response.dto';
import { SecureQueryDto } from '../common/dto/secure-query.dto';
import { validatePasswordOrThrow } from '../utils/validate-password.util';

type PaginatedPostalCodes = {
  data: PostalCodeResponseDto[];
  meta: { total: number; page: number; limit: number };
};

@ApiTags('Postal Codes')
@Controller('postal-codes')
export class PostalCodesController {
  constructor(private readonly postalCodesService: PostalCodesService) {}

  @Get('search')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Find a postal code by commune, street and number',
    description:
      'Searches first in DB; if not found, scrapes Correos de Chile and stores the result.',
  })
  @ApiOkResponse({ type: PostalCodeResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input or scraping failure.',
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
    if ('error' in result) throw new BadRequestException(result.error);
    return result;
  }

  @Get()
  @ApiOperation({
    summary: 'Paginated list of all postal codes',
    description:
      'Returns every known postal code with its associated addresses. Supports pagination.',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    example: 'supersecure-long-password-5481',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: 'Paginated list',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            street: 'AVENIDA APOQUINDO',
            number: '3000',
            commune: 'LAS CONDES',
            region: 'REGIÓN METROPOLITANA',
            postalCode: '7550174',
          },
        ],
        meta: { total: 42, page: 1, limit: 20 },
      },
    },
  })
  async findAll(
    @Query() secure: SecureQueryDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<PaginatedPostalCodes> {
    validatePasswordOrThrow(secure.password);
    return this.postalCodesService.findAll(page, limit);
  }

  @Get(':code')
  @ApiOperation({
    summary: 'Get all addresses for a specific postal code',
    description:
      'Returns every street + number that maps to the given Chilean postal code.',
  })
  @ApiParam({ name: 'code', example: '7550174' })
  @ApiQuery({
    name: 'password',
    required: true,
    example: 'supersecure-long-password-5481',
  })
  @ApiOkResponse({
    description: 'List of addresses that share the postal code.',
    type: [PostalCodeResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Postal code not found.',
    schema: {
      example: {
        statusCode: 404,
        message: "Postal code '9999999' not found",
        error: 'Not Found',
      },
    },
  })
  async findByCode(
    @Param('code') code: string,
    @Query() secure: SecureQueryDto,
  ): Promise<PostalCodeResponseDto[]> {
    validatePasswordOrThrow(secure.password);
    return this.postalCodesService.findByCode(code);
  }
}
