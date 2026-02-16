import { Module } from '@nestjs/common';
import { StreamingProvidersService } from './streaming-providers.service';
import { StreamingProvidersController } from './streaming-providers.controller';

@Module({
  controllers: [StreamingProvidersController],
  providers: [StreamingProvidersService],
})
export class StreamingProvidersModule {}
