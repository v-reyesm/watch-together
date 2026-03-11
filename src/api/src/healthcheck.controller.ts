import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Public()
@Controller('healthcheck')
export class HealthcheckController {
  @Get()
  getHealthCheck(): { status: string } {
    const result = { status: 'ok' };
    return result;
  }
}