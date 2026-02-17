import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMovieDto } from './dto/create-movie.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.mediaService.create(createMovieDto);
  }

  @Get()
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: Partial<CreateMovieDto>) {
    return this.mediaService.update(+id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(+id);
  }
}
