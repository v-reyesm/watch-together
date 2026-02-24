import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaSearchType } from '../providers/interfaces/media-provider.interface';

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Get('search')
    async search(
        @Query('query') query?: string,
        @Query('page') page?: string,
        @Query('type') type?: string,
    ) {
        const trimmed = typeof query === 'string' ? query.trim() : '';
        if (!trimmed) {
            throw new BadRequestException('query is required and must be a non-empty string');
        }
        const pageNum = page != null ? Math.max(1, parseInt(page, 10) || 1) : 1;
        const searchType: MediaSearchType = type === 'tv' ? 'tv' : 'movie';
        return this.mediaService.search(trimmed, pageNum, searchType);
    }
}
