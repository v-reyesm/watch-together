import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchListService } from './watch-list.service';
import { WatchListController } from './watch-list.controller';
import { WatchList } from './entities/watch-list.entity';
import { WatchListMember } from './entities/watch-list-member.entity';
import { WatchEvent } from './entities/watch-event.entity';
import { Media } from '../media/entities/media.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WatchList,
      WatchListMember,
      WatchEvent,
      Media,
      User,
    ]),
  ],
  controllers: [WatchListController],
  providers: [WatchListService],
})
export class WatchListModule {}
