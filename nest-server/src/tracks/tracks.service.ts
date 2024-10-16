import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Track } from './track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MyLogger } from 'src/logger/logger.service';
import { TrackResponse, TrackWithArtistResponse } from './track.interface';
import { ArtistsService } from 'src/artists/artists.service';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
    private myLogger: MyLogger,
    @Inject(forwardRef(() => ArtistsService))
    private readonly artistsService: ArtistsService, //
  ) {
    this.myLogger.setContext(TracksService.name);
  }

  public mapTrackToResponse(track: Track): TrackResponse {
    const { bugs, melon, genie } = track.platforms;
    const availablePlatform = bugs || melon || genie;
    const mappedTrack: TrackResponse = {
      id: track.id,
      titleName: availablePlatform.titleName,
      trackImage: availablePlatform.trackImage,
      releaseDate: availablePlatform.releaseDate,
      lyrics: availablePlatform.lyrics,
      platforms: {
        bugs: bugs && { weeklyChartScope: bugs.weeklyChartScope },
        melon: melon && { weeklyChartScope: melon.weeklyChartScope },
        genie: genie && { weeklyChartScope: genie.weeklyChartScope },
      },
    };
    return mappedTrack;
  }

  async findById(
    id: number,
    withArtists?: boolean,
  ): Promise<TrackResponse | TrackWithArtistResponse | null> {
    if (withArtists) {
      const track = await this.trackRepo
        .createQueryBuilder('track')
        .leftJoinAndSelect('track.artists', 'artist')
        .where('track.id = :id', { id })
        .getOne();
      const mappedArtists = track.artists.map((artist) =>
        this.artistsService.mapArtistToResponse(artist),
      );
      const mappedTrack = this.mapTrackToResponse(track);
      return { ...mappedTrack, artists: mappedArtists };
    }
    const track = await this.trackRepo.findOneBy({ id });
    return { id, ...this.mapTrackToResponse(track) };
  }

  async find(
    limit: number,
    offset: number,
    sort: 'asc' | 'desc' | 'random',
    withArtists?: boolean,
    query?: string,
    minWeeksOnChart?: number,
  ): Promise<TrackResponse[] | []> {
    const queryBuilder = this.trackRepo.createQueryBuilder('track');

    if (query) {
      queryBuilder.andWhere('track.trackKeyword LIKE :query', {
        query: `%${query}%`,
      });
    }

    if (minWeeksOnChart) {
      queryBuilder.andWhere(
        `COALESCE(JSON_LENGTH(JSON_UNQUOTE(JSON_EXTRACT(track.platforms, '$.melon.weeklyChartScope'))), 0) > :minWeeksOnChart`,
        { minWeeksOnChart },
      );
    }

    if (withArtists) {
      queryBuilder.leftJoinAndSelect('track.artists', 'artist');
    }

    if (sort === 'random') {
      queryBuilder.orderBy('RAND()');
    } else {
      queryBuilder.orderBy(
        'track.createDate',
        sort.toUpperCase() as 'DESC' | 'ASC',
      );
    }

    const tracks = await queryBuilder.skip(offset).take(limit).getMany();

    if (withArtists) {
      // artists가 포함된 트랙 데이터를 반환
      return tracks.map((track) => ({
        ...this.mapTrackToResponse(track),
        artists: track.artists.map((artist) =>
          this.artistsService.mapArtistToResponse(artist),
        ),
      }));
    }

    // artists가 없는 기본 트랙 데이터를 반환
    return tracks.map((track) => ({
      ...this.mapTrackToResponse(track),
    }));
  }
}
