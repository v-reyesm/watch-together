import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TvSeriesService } from './tv-series.service';
import { CreateTvSeryDto } from './dto/create-tv-sery.dto';
import { UpdateTvSeryDto } from './dto/update-tv-sery.dto';

@Controller('tv-series')
export class TvSeriesController {
  constructor(private readonly tvSeriesService: TvSeriesService) {}

  @Post()
  create(@Body() createTvSeryDto: CreateTvSeryDto) {
    return this.tvSeriesService.create(createTvSeryDto);
  }

  @Get()
  findAll() {
    return this.tvSeriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tvSeriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTvSeryDto: UpdateTvSeryDto) {
    return this.tvSeriesService.update(+id, updateTvSeryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tvSeriesService.remove(+id);
  }
}
