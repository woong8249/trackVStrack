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
    sort: 'asc' | 'desc',
    query?: string,
  ): Promise<TrackWithArtistResponse[] | []> {
    const queryBuilder = this.trackRepo
      .createQueryBuilder('track')
      .leftJoinAndSelect('track.artists', 'artist'); // Artist와 조인

    if (query) {
      queryBuilder.andWhere('track.trackKeyword LIKE :query', {
        query: `%${query}%`,
      });
    }
    const tracks = await queryBuilder
      .orderBy('track.createDate', sort.toUpperCase() as 'DESC' | 'ASC')
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
