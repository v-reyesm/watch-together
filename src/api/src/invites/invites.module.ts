import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invite } from './entities/invite.entity';
import { WatchListMember } from '../watch-list/entities/watch-list-member.entity';
import { WatchList } from '../watch-list/entities/watch-list.entity';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invite, WatchList, WatchListMember])],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InvitesModule {}
