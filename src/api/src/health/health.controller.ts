import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    getHealth(): { status: string } {
        const result = { status: 'ok' };
        return result;
    }
}
