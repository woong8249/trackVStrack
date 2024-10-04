import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Track } from '../tracks/track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MyLogger } from '../logger/logger.service';
import { TrackWithArtistResponse } from './track-artist.interface';
import { TracksService } from 'src/tracks/tracks.service';
import { ArtistsService } from 'src/artists/artists.service';

@Injectable()
export class TracksArtistsService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
    private tracksService: TracksService,
    private artistsService: ArtistsService,
    private myLogger: MyLogger,
  ) {
    this.myLogger.setContext(TracksArtistsService.name);
  }

  async findById(id: number): Promise<TrackWithArtistResponse | null> {
    const track = await this.trackRepo
      .createQueryBuilder('track')
      .leftJoinAndSelect('track.artists', 'artist')
      .where('track.id = :id', { id })
      .getOne();
    const mappedArtists = track.artists.map((artist) =>
      this.artistsService.mapArtistToResponse(artist),
    );
    const mappedTrack = this.tracksService.mapTrackToResponse(track);
    return { id: track.id, ...mappedTrack, artists: mappedArtists };
  }

  async find(
    limit: number,
    offset: number,
    sort: 'asc' | 'desc' | 'random',
    query?: string,
    minWeeksOnChart?: number,
  ): Promise<TrackWithArtistResponse[] | []> {
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

    // 랜덤 정렬 처리
    if (sort === 'random') {
      queryBuilder.orderBy('RAND()');
    } else {
      queryBuilder.orderBy(
        'track.createDate',
        sort.toUpperCase() as 'DESC' | 'ASC',
      );
    }

    const tracks = await queryBuilder
      .leftJoinAndSelect('track.artists', 'artist')
      .skip(offset)
      .take(limit)
      .getMany();

    return tracks.map<TrackWithArtistResponse>((track) => {
      const mappedArtists = track.artists.map((artist) =>
        this.artistsService.mapArtistToResponse(artist),
      );
      const mappedTrack = this.tracksService.mapTrackToResponse(track);
      return { id: track.id, ...mappedTrack, artists: mappedArtists };
    });
  }
}
