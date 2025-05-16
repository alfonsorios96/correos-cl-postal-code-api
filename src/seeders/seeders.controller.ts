import { Controller, Post, Body, HttpException } from '@nestjs/common';
import { SeedersService } from './seeders.service';
import { SeedRequestDto } from './dto/seed-request.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Seeders')
@Controller('seeders')
export class SeedersController {
  constructor(private readonly seedersService: SeedersService) {}

  @Post('regions')
  @ApiOperation({
    summary: 'Seed regions',
    description:
      'Seeds all Chilean regions into the database. Requires a secure password.',
  })
  @ApiResponse({ status: 201, description: 'Regions seeded successfully' })
  @ApiResponse({
    status: 418,
    description: 'Unauthorized attempt with joke message',
  })
  async seedRegions(@Body() body: SeedRequestDto) {
    this.validatePasswordOrThrow(body.password);
    return this.seedersService.seedRegions();
  }

  @Post('communes')
  @ApiOperation({
    summary: 'Seed communes',
    description:
      'Seeds all Chilean communes associated with their respective regions. Requires a secure password.',
  })
  @ApiResponse({ status: 201, description: 'Communes seeded successfully' })
  @ApiResponse({
    status: 418,
    description: 'Unauthorized attempt with joke message',
  })
  async seedCommunes(@Body() body: SeedRequestDto) {
    this.validatePasswordOrThrow(body.password);
    return this.seedersService.seedCommunes();
  }

  @Post('all')
  @ApiOperation({
    summary: 'Seed regions and communes',
    description:
      'Runs both region and commune seeders in sequence. Requires a secure password.',
  })
  @ApiResponse({
    status: 201,
    description: 'All seeding completed successfully',
  })
  @ApiResponse({
    status: 418,
    description: 'Unauthorized attempt with joke message',
  })
  async seedAll(@Body() body: SeedRequestDto) {
    this.validatePasswordOrThrow(body.password);

    const regionsResult = await this.seedersService.seedRegions();
    const communesResult = await this.seedersService.seedCommunes();

    return {
      regions: regionsResult.message,
      communes: communesResult.message,
      message: '🌱 Full seeding completed successfully!',
    };
  }

  private validatePasswordOrThrow(password: string) {
    const correctPassword =
      process.env.SEED_PASSWORD ?? 'supersecure-long-password-5481';

    if (password !== correctPassword) {
      const messages = [
        'What are you doing mother fucker?',
        'You shall not pass, script kiddie.',
        'Nice try, Neo. This is not the Matrix.',
        '418 - I am a teapot, and you just brewed nonsense.',
        'You have been stopped by the guardian of the seeds.',
        'Unauthorized? More like unworthy.',
        'Only root may plant these seeds.',
        'No password? No party.',
        'Bro... seriously?',
        'The seed gods frown upon your ignorance.',
        'Expected: password. Received: pure audacity.',
        'Access denied. Go touch some grass.',
        'Password rejected. Please try hacking NASA instead.',
        'Wrong password and now you owe me a coffee.',
        'Who let you in here? Not me.',
        'Go home, you’re drunk on POST requests.',
        'Your attempt has been logged... by a toaster.',
        'This endpoint has rejected your vibes.',
        'Request rejected. Try StackOverflow for sympathy.',
        'Bruh...',
        'Sorry, this endpoint is allergic to bad passwords.',
      ];

      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      throw new HttpException(randomMessage, 418);
    }
  }
}
