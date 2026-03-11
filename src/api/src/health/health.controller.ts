import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
    @Get()
    getHealth(): { status: string } {
        const result = { status: 'ok' };
        return result;
    }
}
