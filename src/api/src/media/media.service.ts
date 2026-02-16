import { Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MediaService {
  create(createMovieDto: CreateMovieDto) {
    return 'This action adds a new media item';
  }

  findAll() {
    return `This action returns all media items`;
  }

  findOne(id: number) {
    return `This action returns a #${id} media item`;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} media item`;
  }

  remove(id: number) {
    return `This action removes a #${id} media item`;
  }
}
