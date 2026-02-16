import { Controller, Get} from '@nestjs/common';

@Controller('healthcheck')
export class HealthcheckController {
  @Get()
  getHealthCheck(): any {
    let result = { status: 'ok' }
    return result;
  }
}