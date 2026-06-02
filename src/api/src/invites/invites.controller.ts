import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { InvitesService } from './invites.service';

@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post('watch-lists/:id/invites')
  create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.invitesService.create(currentUser.id, id);
  }

  @Get('watch-lists/:id/invites')
  findAll(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.invitesService.findAll(currentUser.id, id);
  }

  @Delete('watch-lists/:id/invites/:inviteId')
  revoke(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Param('inviteId', ParseIntPipe) inviteId: number,
  ) {
    return this.invitesService.revoke(currentUser.id, id, inviteId);
  }

  @Post('invites/:token/join')
  join(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('token') token: string,
  ) {
    return this.invitesService.join(currentUser.id, token);
  }
}
