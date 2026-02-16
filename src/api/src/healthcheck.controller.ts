import { Controller, Get} from '@nestjs/common';

@Controller('healthcheck')
export class HealthcheckController {
  @Get()
  getHealthCheck(): { status: string } {
    const result = { status: 'ok' };
    return result;
  }
}