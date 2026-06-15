import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { MediaService } from './media.service';
import { MediaSearchType } from '../providers/interfaces/media-provider.interface';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Public()
  @Get('top-rated')
  topRated(@Query('limit') limit?: string) {
    const parsed = limit != null ? parseInt(limit, 10) : NaN;
    const safeLimit = Number.isFinite(parsed) ? parsed : 3;
    return this.mediaService.getTopRated(safeLimit);
  }

  @Get('search')
  async search(
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('type') type?: string,
  ) {
    const trimmed = typeof query === 'string' ? query.trim() : '';
    if (!trimmed) {
      throw new BadRequestException(
        'query is required and must be a non-empty string',
      );
    }
    const pageNum = page != null ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const searchType: MediaSearchType | 'both' =
      type === 'tv' ? 'tv' : type === 'movie' ? 'movie' : 'both';
    return this.mediaService.search(trimmed, pageNum, searchType);
  }

  @Post(':id/watch-events')
  markWatchedAlone(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: string,
  ) {
    return this.mediaService.markWatchedAlone(
      currentUser.id,
      id,
      this.parseMediaType(type),
    );
  }

  @Delete(':id/watch-events/latest')
  undoWatchAlone(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: string,
  ) {
    return this.mediaService.undoWatchAlone(
      currentUser.id,
      id,
      this.parseMediaType(type),
    );
  }

  private parseMediaType(type?: string): MediaSearchType | undefined {
    return type === 'tv' || type === 'movie' ? type : undefined;
  }
}
