import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { TmdbService } from './tmdb.service';

describe('TmdbService', () => {
  let service: TmdbService;
  let httpGet: jest.Mock;

  beforeEach(async () => {
    httpGet = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        {
          provide: HttpService,
          useValue: {
            get: httpGet,
          },
        },
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMediaDetails', () => {
    const creditsData = {
      id: 1,
      cast: [
        { id: 10, name: 'Second Lead', order: 1 },
        { id: 11, name: 'Main Lead', order: 0 },
        { id: 12, name: 'Extra 6', order: 6 },
        { id: 13, name: 'Third', order: 2 },
        { id: 14, name: 'Fourth', order: 3 },
        { id: 15, name: 'Fifth', order: 4 },
      ],
      crew: [
        { id: 20, name: 'Jane Director', job: 'Director' },
        { id: 21, name: 'Some Writer', job: 'Writer' },
      ],
    };

    const providersData = {
      id: 1,
      results: {
        US: {
          flatrate: [
            { provider_id: 8, provider_name: 'Netflix' },
            { provider_id: 9, provider_name: 'Max' },
          ],
        },
      },
    };

    function mockEndpoints() {
      httpGet.mockImplementation((url: string) => {
        if (url.includes('/credits')) return of({ data: creditsData });
        if (url.includes('/watch/providers'))
          return of({ data: providersData });
        return of({ data: {} });
      });
    }

    it('returns director, top cast (ordered, capped at 5) and providers', async () => {
      mockEndpoints();
      const details = await service.getMediaDetails('movie', 1);

      expect(details.director).toBe('Jane Director');
      expect(details.cast).toEqual([
        'Main Lead',
        'Second Lead',
        'Third',
        'Fourth',
        'Fifth',
      ]);
      expect(details.providers).toEqual(['Netflix', 'Max']);
    });

    it('degrades gracefully when a TMDB call fails', async () => {
      httpGet.mockImplementation((url: string) => {
        if (url.includes('/credits')) return of({ data: creditsData });
        if (url.includes('/watch/providers'))
          return throwError(() => new Error('boom'));
        return of({ data: {} });
      });

      const details = await service.getMediaDetails('movie', 1);
      expect(details.director).toBe('Jane Director');
      expect(details.providers).toEqual([]);
    });

    it('ignores regions other than the configured/US region', async () => {
      // Only a non-preferred, non-US region is available. We must NOT surface it,
      // since wrong-country availability is more misleading than showing nothing.
      httpGet.mockImplementation((url: string) => {
        if (url.includes('/credits'))
          return of({ data: { id: 1, cast: [], crew: [] } });
        if (url.includes('/watch/providers'))
          return of({
            data: {
              id: 1,
              results: {
                DE: { flatrate: [{ provider_id: 2, provider_name: 'WOW' }] },
              },
            },
          });
        return of({ data: {} });
      });

      const details = await service.getMediaDetails('tv', 1);
      expect(details.providers).toEqual([]);
    });

    it('uses the US region when no configured region is set', async () => {
      httpGet.mockImplementation((url: string) => {
        if (url.includes('/credits'))
          return of({ data: { id: 1, cast: [], crew: [] } });
        if (url.includes('/watch/providers'))
          return of({
            data: {
              id: 1,
              results: {
                US: { flatrate: [{ provider_id: 8, provider_name: 'Netflix' }] },
                DE: { flatrate: [{ provider_id: 2, provider_name: 'WOW' }] },
              },
            },
          });
        return of({ data: {} });
      });

      const details = await service.getMediaDetails('movie', 1);
      expect(details.providers).toEqual(['Netflix']);
    });
  });
});
