import { Injectable } from '@nestjs/common';
import { CreateTvSeryDto } from './dto/create-tv-sery.dto';
import { UpdateTvSeryDto } from './dto/update-tv-sery.dto';

@Injectable()
export class TvSeriesService {
  create(createTvSeryDto: CreateTvSeryDto) {
    return 'This action adds a new tvSery';
  }

  findAll() {
    return `This action returns all tvSeries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tvSery`;
  }

  update(id: number, updateTvSeryDto: UpdateTvSeryDto) {
    return `This action updates a #${id} tvSery`;
  }

  remove(id: number) {
    return `This action removes a #${id} tvSery`;
  }
}
