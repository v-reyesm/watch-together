import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchListService } from './watch-list.service';
import { WatchListController } from './watch-list.controller';
import { WatchList } from './entities/watch-list.entity';
import { WatchListMember } from './entities/watch-list-member.entity';
import { WatchEvent } from './entities/watch-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WatchList, WatchListMember, WatchEvent]),
  ],
  controllers: [WatchListController],
  providers: [WatchListService],
})
export class WatchListModule {}
