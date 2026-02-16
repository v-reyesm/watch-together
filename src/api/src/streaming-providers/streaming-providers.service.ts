import { Injectable } from '@nestjs/common';
import { CreateStreamingProviderDto } from './dto/create-streaming-provider.dto';
import { UpdateStreamingProviderDto } from './dto/update-streaming-provider.dto';

@Injectable()
export class StreamingProvidersService {
  create(createStreamingProviderDto: CreateStreamingProviderDto) {
    return 'This action adds a new streamingProvider';
  }

  findAll() {
    return `This action returns all streamingProviders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} streamingProvider`;
  }

  update(id: number, updateStreamingProviderDto: UpdateStreamingProviderDto) {
    return `This action updates a #${id} streamingProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} streamingProvider`;
  }
}
