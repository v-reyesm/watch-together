import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AddListItemDto } from './dto/add-list-item.dto';
import { CreateWatchListDto } from './dto/create-watch-list.dto';
import { UpdateWatchListDto } from './dto/update-watch-list.dto';
import { UpdateEpisodeProgressDto } from './dto/update-episode-progress.dto';
import { EpisodeProgress } from './entities/episode-progress.entity';
import { WatchEvent } from './entities/watch-event.entity';
import { WatchListMember } from './entities/watch-list-member.entity';
import { WatchList } from './entities/watch-list.entity';
import { Media } from '../media/entities/media.entity';
import { Movie } from '../movies/entities/movie.entity';
import { TvSerie } from '../tv-series/entities/tv-serie.entity';
import { User } from '../users/entities/user.entity';

type WatchStatus = 'pending' | 'watchedTogether' | 'watchedAlone';

type SerializedItem = {
  id: number;
  providerName: string;
  providerId: number | null;
  mediaType: 'movie' | 'tv';
  title: string;
  translatedTitle: string;
  year: number | null;
  posterUrl: string;
  summary: string;
  overview: string;
  genres: string[];
  originalLanguage: string;
  rating: number;
  status: WatchStatus;
  watchedAt: string | null;
  runtimeInMinutes?: number | null;
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
  totalRuntimeInMinutes?: number | null;
};

type RuntimeData = {
  runtimeInMinutes?: number | null;
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
  totalRuntimeInMinutes?: number | null;
};

@Injectable()
export class WatchListService {
  constructor(
    @InjectRepository(WatchList)
    private readonly watchListRepo: Repository<WatchList>,
    @InjectRepository(WatchListMember)
    private readonly memberRepo: Repository<WatchListMember>,
    @InjectRepository(WatchEvent)
    private readonly watchEventRepo: Repository<WatchEvent>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(TvSerie)
    private readonly tvSerieRepo: Repository<TvSerie>,
    @InjectRepository(EpisodeProgress)
    private readonly episodeProgressRepo: Repository<EpisodeProgress>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(userId: number, dto: CreateWatchListDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const list = await this.watchListRepo.save(
      this.watchListRepo.create({
        name: dto.name.trim(),
        description: dto.description?.trim() ?? '',
        items: [],
      }),
    );

    await this.memberRepo.save(
      this.memberRepo.create({ watchListId: list.id, userId, role: 'owner' }),
    );

    return this.findOne(userId, list.id);
  }

  async findAll(userId: number) {
    const memberships = await this.findMembershipsWithListData(userId);

    return Promise.all(
      memberships.map((membership) =>
        this.serializeList(membership.watchList, userId, true),
      ),
    );
  }

  async summary(userId: number) {
    const memberships = await this.findMembershipsWithListData(userId);
    const rawLists = memberships.map((membership) => membership.watchList);
    const lists = await Promise.all(
      rawLists.map((list) => this.serializeList(list, userId, true)),
    );
    const itemCount = lists.reduce((sum, list) => sum + list.itemCount, 0);
    const watchedCount = lists.reduce(
      (sum, list) => sum + list.watchedCount,
      0,
    );

    return {
      listCount: lists.length,
      itemCount,
      watchedCount,
      pendingCount: Math.max(0, itemCount - watchedCount),
      lists,
      highlightedItems: rawLists
        .flatMap((list) =>
          (list.items ?? []).map((item) =>
            this.serializeItem(item, list.watchEvents ?? [], userId),
          ),
        )
        .filter((item) => item.status === 'pending')
        .slice(0, 6),
      // Every pending item across all the user's lists, each tagged with the
      // list it belongs to. Unlike `lists[].items` (truncated to a 4-item
      // preview), this is the full set so the home "Para ver" suggestions can
      // sample from titles deep in a list, not just the first four.
      pendingSuggestions: rawLists.flatMap((list) =>
        (list.items ?? [])
          .map((item) =>
            this.serializeItem(item, list.watchEvents ?? [], userId),
          )
          .filter((item) => item.status === 'pending')
          .map((item) => ({
            ...item,
            listId: list.id,
            listName: list.name,
          })),
      ),
    };
  }

  async findOne(userId: number, id: number) {
    const list = await this.getAuthorizedList(userId, id);
    return this.serializeList(list, userId, false);
  }

  async update(userId: number, id: number, dto: UpdateWatchListDto) {
    const list = await this.getAuthorizedList(userId, id, true);
    if (dto.name != null) {
      list.name = dto.name.trim();
    }
    if (dto.description != null) {
      list.description = dto.description.trim();
    }
    await this.watchListRepo.save(list);
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number) {
    const list = await this.getAuthorizedList(userId, id, true);
    await this.watchListRepo.remove(list);
    return { ok: true };
  }

  async addItem(userId: number, listId: number, dto: AddListItemDto) {
    const list = await this.getAuthorizedList(userId, listId);
    const providerName = dto.providerName ?? 'tmdb';

    if (
      list.items.some(
        (item) =>
          item.providerName === providerName &&
          item.providerId === dto.providerId,
      )
    ) {
      throw new ConflictException('Este titulo ya esta en la lista');
    }

    const media = await this.findOrCreateMedia(providerName, dto);
    list.items.push(media);
    await this.watchListRepo.save(list);

    return this.findOne(userId, listId);
  }

  async removeItem(userId: number, listId: number, itemId: number) {
    const list = await this.getAuthorizedList(userId, listId);
    const nextItems = list.items.filter((item) => item.id !== itemId);
    if (nextItems.length === list.items.length) {
      throw new NotFoundException('Titulo no encontrado en esta lista');
    }
    list.items = nextItems;
    await this.watchListRepo.save(list);
    return this.findOne(userId, listId);
  }

  async markWatched(userId: number, listId: number, itemId: number) {
    const list = await this.getAuthorizedList(userId, listId);
    const media = list.items.find((item) => item.id === itemId);
    if (!media) {
      throw new NotFoundException('Titulo no encontrado en esta lista');
    }

    await this.watchEventRepo.save(
      this.watchEventRepo.create({
        userId,
        mediaId: media.id,
        watchListId: list.id,
      }),
    );

    return this.findOne(userId, listId);
  }

  async undoLatestWatch(userId: number, listId: number, itemId: number) {
    const list = await this.getAuthorizedList(userId, listId);
    const media = list.items.find((item) => item.id === itemId);
    if (!media) {
      throw new NotFoundException('Titulo no encontrado en esta lista');
    }

    const latest = await this.watchEventRepo.findOne({
      where: { watchListId: listId, mediaId: itemId },
      order: { watchedAt: 'DESC' },
    });

    if (!latest) {
      throw new NotFoundException('No hay vista reciente para deshacer');
    }

    await this.watchEventRepo.remove(latest);
    return this.findOne(userId, listId);
  }

  async removeMember(userId: number, listId: number, memberUserId: number) {
    const list = await this.getAuthorizedList(userId, listId, true);
    if (memberUserId === userId) {
      throw new ConflictException(
        'El owner no puede eliminarse a si mismo de la lista',
      );
    }

    const membership = list.watchListMembers.find(
      (member) => member.userId === memberUserId,
    );
    if (!membership) {
      throw new NotFoundException('Miembro no encontrado en esta lista');
    }

    await this.memberRepo.remove(membership);
    return this.findOne(userId, listId);
  }

  async getEpisodeProgress(userId: number, listId: number, itemId: number) {
    const list = await this.getAuthorizedList(userId, listId);
    const media = (list.items ?? []).find((item) => item.id === itemId);
    if (!media) {
      throw new NotFoundException('Titulo no encontrado en esta lista');
    }

    const progress = await this.episodeProgressRepo.findOneBy({
      watchListId: listId,
      mediaId: itemId,
    });
    const totals = await this.loadSeriesTotals(media);

    return {
      watchListId: listId,
      mediaId: itemId,
      watchedEpisodes: progress?.watchedEpisodes ?? 0,
      watchedSeasons: progress?.watchedSeasons ?? 0,
      ...totals,
    };
  }

  async updateEpisodeProgress(
    userId: number,
    listId: number,
    itemId: number,
    dto: UpdateEpisodeProgressDto,
  ) {
    const list = await this.getAuthorizedList(userId, listId);
    const media = (list.items ?? []).find((item) => item.id === itemId);
    if (!media) {
      throw new NotFoundException('Titulo no encontrado en esta lista');
    }

    // Upsert so a concurrent first-write can't violate the (watchListId,
    // mediaId) unique constraint and surface an unhandled 500. watchedSeasons
    // is omitted: it defaults to 0 on insert and is left untouched on update.
    await this.episodeProgressRepo.upsert(
      {
        watchListId: listId,
        mediaId: itemId,
        watchedEpisodes: dto.watchedEpisodes,
      },
      ['watchListId', 'mediaId'],
    );

    const progress = await this.episodeProgressRepo.findOneBy({
      watchListId: listId,
      mediaId: itemId,
    });
    const totals = await this.loadSeriesTotals(media);

    return {
      watchListId: listId,
      mediaId: itemId,
      watchedEpisodes: progress?.watchedEpisodes ?? dto.watchedEpisodes,
      watchedSeasons: progress?.watchedSeasons ?? 0,
      ...totals,
    };
  }

  /**
   * Load the persisted season/episode/runtime totals for a TV series Media
   * item from the typed tv_series table. Returns an empty object for movies or
   * when no data is persisted yet, so callers can spread it conditionally.
   */
  private async loadSeriesTotals(media: Media): Promise<RuntimeData> {
    if (media.mediaType !== 'tv' || !media.tmdbId) return {};
    const tv = await this.tvSerieRepo.findOneBy({ tmdbId: media.tmdbId });
    if (!tv) return {};
    return {
      numberOfSeasons: tv.numberOfSeasons ?? null,
      numberOfEpisodes: tv.numberOfEpisodes ?? null,
      totalRuntimeInMinutes: tv.totalRuntimeInMinutes ?? null,
    };
  }

  async leave(userId: number, listId: number) {
    const list = await this.getAuthorizedList(userId, listId);
    const membership = list.watchListMembers.find(
      (member) => member.userId === userId,
    );
    if (!membership) {
      throw new ForbiddenException('No tienes acceso a esta lista');
    }
    if (membership.role === 'owner') {
      throw new ForbiddenException(
        'El owner no puede abandonar su propia lista',
      );
    }

    await this.memberRepo.remove(membership);
    return { ok: true };
  }

  private async getAuthorizedList(
    userId: number,
    id: number,
    ownerOnly = false,
  ) {
    const list = await this.watchListRepo.findOne({
      where: { id },
      relations: {
        watchListMembers: { user: true },
        items: { genres: true },
        watchEvents: true,
      },
      order: {
        items: { id: 'ASC' },
        watchEvents: { watchedAt: 'DESC' },
      },
    });

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    const membership = list.watchListMembers.find(
      (member) => member.userId === userId,
    );
    if (!membership) {
      throw new ForbiddenException('No tienes acceso a esta lista');
    }
    if (ownerOnly && membership.role !== 'owner') {
      throw new ForbiddenException('Solo el owner puede modificar esta lista');
    }

    return list;
  }

  private findMembershipsWithListData(userId: number) {
    return this.memberRepo.find({
      where: { userId },
      relations: {
        watchList: {
          watchListMembers: { user: true },
          items: { genres: true },
          watchEvents: true,
        },
      },
      order: {
        id: 'ASC',
        watchList: {
          items: { id: 'ASC' },
          watchEvents: { watchedAt: 'DESC' },
        },
      },
    });
  }

  private async findOrCreateMedia(providerName: 'tmdb', dto: AddListItemDto) {
    const existing = await this.mediaRepo.findOneBy({
      providerName,
      providerId: dto.providerId,
    });
    if (existing) {
      return existing;
    }

    return this.mediaRepo.save(
      this.mediaRepo.create({
        title: dto.title.trim(),
        translatedTitle: dto.translatedTitle?.trim() || dto.title.trim(),
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : new Date(0),
        posterUrl: dto.posterUrl ?? '',
        overview: dto.overview ?? '',
        originalLanguage: dto.originalLanguage ?? '',
        rating: dto.rating ?? 0,
        tmdbId: dto.providerId,
        providerName,
        providerId: dto.providerId,
        mediaType: dto.mediaType,
      }),
    );
  }

  private async serializeList(
    list: WatchList,
    userId: number,
    previewOnly: boolean,
  ) {
    // Batch-load runtime data from typed entities so we can include it in
    // each item without N+1 queries or extra TMDB calls.
    const runtimeMap = await this.loadRuntimeData(list.items ?? []);

    const items = (list.items ?? []).map((item) =>
      this.serializeItem(item, list.watchEvents ?? [], userId, runtimeMap),
    );
    const watchedCount = items.filter(
      (item) => item.status !== 'pending',
    ).length;
    const previewItems = previewOnly ? items.slice(0, 4) : items;

    return {
      id: list.id,
      name: list.name,
      description: list.description,
      members: (list.watchListMembers ?? []).map((member) => ({
        id: member.userId,
        name: member.user?.name ?? 'Usuario',
        email: member.user?.email ?? '',
        role: member.role,
        initials: this.initials(member.user?.name ?? member.user?.email ?? '?'),
      })),
      itemCount: items.length,
      pendingCount: Math.max(0, items.length - watchedCount),
      watchedCount,
      items: previewItems,
    };
  }

  private serializeItem(
    item: Media,
    events: WatchEvent[],
    userId: number,
    runtimeMap?: Map<number, RuntimeData>,
  ): SerializedItem {
    const itemEvents = events
      .filter((event) => event.mediaId === item.id)
      .sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime());
    const latest = itemEvents[0];
    const status: WatchStatus = latest
      ? latest.watchListId != null
        ? 'watchedTogether'
        : latest.userId === userId
          ? 'watchedAlone'
          : 'pending'
      : 'pending';

    const runtime = runtimeMap?.get(item.id);

    return {
      id: item.id,
      providerName: item.providerName,
      providerId: item.providerId ?? item.tmdbId ?? null,
      mediaType: item.mediaType,
      title: item.title,
      translatedTitle: item.translatedTitle,
      year: this.yearFromDate(item.releaseDate),
      posterUrl: item.posterUrl,
      summary: item.overview,
      overview: item.overview,
      genres: (item.genres ?? []).map((genre) => genre.name),
      originalLanguage: item.originalLanguage ?? '',
      rating: item.rating ?? 0,
      status,
      watchedAt: latest?.watchedAt.toISOString() ?? null,
      runtimeInMinutes: runtime?.runtimeInMinutes ?? null,
      numberOfSeasons: runtime?.numberOfSeasons ?? null,
      numberOfEpisodes: runtime?.numberOfEpisodes ?? null,
      totalRuntimeInMinutes: runtime?.totalRuntimeInMinutes ?? null,
    };
  }

  /**
   * Batch-load runtime metadata from the typed Movie/TvSerie tables for a set
   * of Media items. Returns a map keyed by Media.id so the caller can attach
   * runtime fields during serialization without N+1 queries.
   */
  private async loadRuntimeData(
    items: Media[],
  ): Promise<Map<number, RuntimeData>> {
    const map = new Map<number, RuntimeData>();
    if (items.length === 0) return map;

    const movieTmdbIds = items
      .filter((i) => i.mediaType === 'movie' && i.tmdbId)
      .map((i) => i.tmdbId!);
    const tvTmdbIds = items
      .filter((i) => i.mediaType === 'tv' && i.tmdbId)
      .map((i) => i.tmdbId!);

    const [movies, tvSeries]: [Movie[], TvSerie[]] = await Promise.all([
      movieTmdbIds.length > 0
        ? this.movieRepo.find({ where: { tmdbId: In(movieTmdbIds) } })
        : Promise.resolve<Movie[]>([]),
      tvTmdbIds.length > 0
        ? this.tvSerieRepo.find({ where: { tmdbId: In(tvTmdbIds) } })
        : Promise.resolve<TvSerie[]>([]),
    ]);

    const movieByTmdb = new Map<number, Movie>(
      movies.map((m): [number, Movie] => [m.tmdbId as number, m]),
    );
    const tvByTmdb = new Map<number, TvSerie>(
      tvSeries.map((t): [number, TvSerie] => [t.tmdbId as number, t]),
    );

    for (const item of items) {
      if (item.tmdbId == null) continue;
      if (item.mediaType === 'movie') {
        const movie = movieByTmdb.get(item.tmdbId);
        if (movie?.runtimeInMinutes) {
          map.set(item.id, { runtimeInMinutes: movie.runtimeInMinutes });
        }
      } else if (item.mediaType === 'tv') {
        const tv = tvByTmdb.get(item.tmdbId);
        if (tv) {
          map.set(item.id, {
            numberOfSeasons: tv.numberOfSeasons ?? null,
            numberOfEpisodes: tv.numberOfEpisodes ?? null,
            totalRuntimeInMinutes: tv.totalRuntimeInMinutes ?? null,
          });
        }
      }
    }

    return map;
  }

  private yearFromDate(date: Date | string | null | undefined) {
    if (!date) return null;
    const parsed = date instanceof Date ? date : new Date(date);
    const year = parsed.getUTCFullYear();
    return Number.isFinite(year) && year > 1900 ? year : null;
  }

  private initials(value: string) {
    return value
      .split(/\s+|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
}
