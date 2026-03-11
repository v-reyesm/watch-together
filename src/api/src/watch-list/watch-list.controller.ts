import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WatchListService } from './watch-list.service';
import { CreateWatchListDto } from './dto/create-watch-list.dto';
import { UpdateWatchListDto } from './dto/update-watch-list.dto';

@Controller('watch-list')
export class WatchListController {
  constructor(private readonly watchListService: WatchListService) {}

  @Post()
  create(@Body() createWatchListDto: CreateWatchListDto) {
    return this.watchListService.create(createWatchListDto);
  }

  @Get()
  findAll() {
    return this.watchListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.watchListService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWatchListDto: UpdateWatchListDto) {
    return this.watchListService.update(+id, updateWatchListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.watchListService.remove(+id);
  }
}
