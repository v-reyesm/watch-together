import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    getHealth(): any {
        let result = { status: 'ok' }
        return result;
    }
}
