import { Module } from '@nestjs/common';
import { WatchListService } from './watch-list.service';
import { WatchListController } from './watch-list.controller';

@Module({
  controllers: [WatchListController],
  providers: [WatchListService],
})
export class WatchListModule {}
