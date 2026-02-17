import { Injectable } from '@nestjs/common';
import { CreateWatchListDto } from './dto/create-watch-list.dto';
import { UpdateWatchListDto } from './dto/update-watch-list.dto';

@Injectable()
export class WatchListService {
  create(createWatchListDto: CreateWatchListDto) {
    return 'This action adds a new watchList';
  }

  findAll() {
    return `This action returns all watchList`;
  }

  findOne(id: number) {
    return `This action returns a #${id} watchList`;
  }

  update(id: number, updateWatchListDto: UpdateWatchListDto) {
    return `This action updates a #${id} watchList`;
  }

  remove(id: number) {
    return `This action removes a #${id} watchList`;
  }
}
