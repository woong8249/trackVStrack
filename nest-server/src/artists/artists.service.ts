import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Artist } from './artist.entity';
import {
  ArtistResponse,
  ArtistWithTracksResponse,
} from 'src/artists/artist.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TracksService } from 'src/tracks/tracks.service';
@Injectable()
export class ArtistsService {
  private readonly logger = new Logger(TracksService.name);
  constructor(
    @InjectRepository(Artist)
    private artistRepo: Repository<Artist>,
    @Inject(forwardRef(() => TracksService))
    private readonly tracksService: TracksService,
  ) {}

  public mapArtistToResponse(artist: Artist): ArtistResponse {
    const { bugs, melon, genie } = artist.platforms;
    const availablePlatform = bugs || melon || genie;
    return {
      id: artist.id,
      artistName: availablePlatform.artistName,
      artistImage: availablePlatform.artistImage,
      debut: availablePlatform.debut,
    };
  }

  async findById(
    id: number,
    withTracks: boolean,
  ): Promise<ArtistResponse | ArtistWithTracksResponse | null> {
    if (withTracks) {
      const artistWithTracks = await this.artistRepo
        .createQueryBuilder('artist')
        .leftJoinAndSelect('artist.tracks', 'track') // leftJoinAndSelect로 수정
        .where('artist.id = :id', { id })
        .getOne();

      const mappedArtist = this.mapArtistToResponse(artistWithTracks);
      const mappedTracks = artistWithTracks.tracks.map((track) =>
        this.tracksService.mapTrackToResponse(track),
      );
      return {
        ...mappedArtist,
        tracks: mappedTracks,
      };
    }

    const artist = await this.artistRepo.findOneBy({ id });
    return { ...this.mapArtistToResponse(artist) };
  }

  async find(
    limit: number,
    offset: number,
    sort: 'asc' | 'desc' | 'random',
    withTracks?: boolean,
    query?: string,
  ): Promise<ArtistResponse[] | []> {
    const queryBuilder = this.artistRepo.createQueryBuilder('artist');
    if (query) {
      queryBuilder.andWhere('artist.artistKeyword LIKE :query', {
        query: `%${query}%`,
      });
    }

    if (withTracks) {
      // tracks를 artist와 함께 조인하여 조회
      queryBuilder.leftJoinAndSelect('artist.tracks', 'track');
    }

    if (sort === 'random') {
      queryBuilder.orderBy('RAND()');
    } else {
      queryBuilder.orderBy(
        'artist.createDate',
        sort.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    const artists = await queryBuilder.skip(offset).take(limit).getMany();

    if (withTracks) {
      // 트랙이 포함된 아티스트 데이터를 반환
      return artists.map((artist) => ({
        ...this.mapArtistToResponse(artist),
        tracks: artist.tracks.map((track) =>
          this.tracksService.mapTrackToResponse(track),
        ),
      }));
    }

    // 트랙이 없는 기본 아티스트 데이터를 반환
    return artists.map((artist) => this.mapArtistToResponse(artist));
  }
}
