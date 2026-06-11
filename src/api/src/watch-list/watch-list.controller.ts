import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { AddListItemDto } from './dto/add-list-item.dto';
import { CreateWatchListDto } from './dto/create-watch-list.dto';
import { UpdateWatchListDto } from './dto/update-watch-list.dto';
import { WatchListService } from './watch-list.service';

@Controller('watch-lists')
export class WatchListController {
  constructor(private readonly watchListService: WatchListService) {}

  @Post()
  create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() createWatchListDto: CreateWatchListDto,
  ) {
    return this.watchListService.create(currentUser.id, createWatchListDto);
  }

  @Get()
  findAll(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.watchListService.findAll(currentUser.id);
  }

  @Get('summary')
  summary(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.watchListService.summary(currentUser.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.watchListService.findOne(currentUser.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWatchListDto: UpdateWatchListDto,
  ) {
    return this.watchListService.update(currentUser.id, id, updateWatchListDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.watchListService.remove(currentUser.id, id);
  }

  // 'me' must be declared before ':memberId' so it is not parsed as an id.
  @Delete(':id/members/me')
  leave(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.watchListService.leave(currentUser.id, id);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.watchListService.removeMember(currentUser.id, id, memberId);
  }

  @Post(':id/items')
  addItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() addListItemDto: AddListItemDto,
  ) {
    return this.watchListService.addItem(currentUser.id, id, addListItemDto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.watchListService.removeItem(currentUser.id, id, itemId);
  }

  @Post(':id/items/:itemId/watch-events')
  markWatched(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.watchListService.markWatched(currentUser.id, id, itemId);
  }

  @Delete(':id/items/:itemId/watch-events/latest')
  undoLatestWatch(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.watchListService.undoLatestWatch(currentUser.id, id, itemId);
  }
}
