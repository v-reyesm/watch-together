import { Injectable } from '@nestjs/common';
import { MediaProvider, MediaSearchResult } from '../interfaces/media-provider.interface';

@Injectable()
export class TmdbService implements MediaProvider {
    search(query: string): Promise<MediaSearchResult[]> {
        throw new Error('Method not implemented.');
    }
    getDetails(id: number): Promise<MediaSearchResult | null> {
        throw new Error('Method not implemented.');
    }

}
