import { PartialType } from '@nestjs/mapped-types';
import { CreateStreamingProviderDto } from './create-streaming-provider.dto';

export class UpdateStreamingProviderDto extends PartialType(CreateStreamingProviderDto) {}
