import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StreamingProvidersService } from './streaming-providers.service';
import { CreateStreamingProviderDto } from './dto/create-streaming-provider.dto';
import { UpdateStreamingProviderDto } from './dto/update-streaming-provider.dto';

@Controller('streaming-providers')
export class StreamingProvidersController {
  constructor(
    private readonly streamingProvidersService: StreamingProvidersService,
  ) {}

  @Post()
  create(@Body() createStreamingProviderDto: CreateStreamingProviderDto) {
    return this.streamingProvidersService.create(createStreamingProviderDto);
  }

  @Get()
  findAll() {
    return this.streamingProvidersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.streamingProvidersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStreamingProviderDto: UpdateStreamingProviderDto,
  ) {
    return this.streamingProvidersService.update(
      +id,
      updateStreamingProviderDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.streamingProvidersService.remove(+id);
  }
}
