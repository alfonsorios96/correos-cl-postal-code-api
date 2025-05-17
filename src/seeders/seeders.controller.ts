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

  @Post('normalize')
  @ApiOperation({
    summary: 'Normalize database',
    description:
      'Normalizes commune/street/postalCode data: trims, merges duplicates, and updates names. Requires a secure password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Normalization completed successfully',
  })
  @ApiResponse({
    status: 418,
    description: 'Unauthorized attempt with joke message',
  })
  async normalize(@Body() body: SeedRequestDto) {
    this.validatePasswordOrThrow(body.password);
    return this.seedersService.normalizeDatabase(true);
  }

  @Post('all')
  @ApiOperation({
    summary: 'Seed all core data and normalize the database',
    description:
      'Executes the full seeding process for regions and communes, followed by a database normalization routine. Cleans up duplicates, trims postal codes, and standardizes street and commune names. Requires a secure password.',
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
    const normalizationResult =
      await this.seedersService.normalizeDatabase(true);

    return {
      regions: regionsResult.message,
      communes: communesResult.message,
      normalization: normalizationResult.message,
      message: '🌱 Full seeding and normalization completed successfully!',
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
        'You triggered a firewall powered by bad jokes.',
        'No password, no paradise.',
        'Congratulations, you played yourself.',
        'This endpoint has better security than your bank.',
        'Bad password detected. Self-destruct in 3... 2... 1...',
        'You tried to seed without watering the plants first.',
        'The console is crying right now.',
        'May your POST requests be forever denied.',
        'Nope. Not today, junior.',
        'The force is not with you.',
        'You’ve been rate-limited by karma.',
        'You just got blocked by a rubber duck.',
        'Your credentials were reviewed and found cringe.',
        'This action has been forwarded to your mom.',
        'Go read the docs, they miss you.',
        'Even ChatGPT wouldn’t allow this.',
        'Try again after finishing your coffee.',
        'Wrong password. But at least you tried.',
        'Permission denied. Try using common sense.',
        'You must construct additional pylons.',
        'Try using sudo in real life.',
        'Endpoint sealed by ancient dev magic.',
        'Did you think this was a public API?',
        'This is a secure endpoint. You are not.',
        'Even your dog knows that was a bad idea.',
        'Your keyboard is judging you right now.',
        'Wrong password. Try 1234... just kidding, don’t.',
        'System response: bruh moment detected.',
        'Unauthorized entry attempt... reported to Skynet.',
      ];

      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      throw new HttpException(randomMessage, 418);
    }
  }
}
