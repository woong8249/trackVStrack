import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Track } from '../tracks/track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MyLogger } from '../logger/logger.service';
import { TrackWithArtistResponse } from 'src/types/responseDTO/track';

@Injectable()
export class TracksArtistsService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
    private myLogger: MyLogger,
  ) {
    this.myLogger.setContext(TracksArtistsService.name);
  }

  async findById(id: number): Promise<Track | null> {
    return this.trackRepo
      .createQueryBuilder('track')
      .leftJoinAndSelect('track.artists', 'artist')
      .where({ id })
      .getOne();
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
      const { artists, platforms, id } = track;
      const { bugs, melon, genie } = platforms;
      const availablePlatform = bugs || melon || genie;

      const mappedTrack: TrackWithArtistResponse = {
        id,
        titleName: availablePlatform.titleName,
        trackImage: availablePlatform.trackImage,
        releaseDate: availablePlatform.releaseDate,
        lyrics: availablePlatform.lyrics,
        platforms: {
          bugs: { weeklyChartScope: bugs?.weeklyChartScope },
          melon: { weeklyChartScope: melon?.weeklyChartScope },
          genie: { weeklyChartScope: genie?.weeklyChartScope },
        },
        artists: artists.map((artist) => {
          const { id, platforms } = artist;
          const { bugs, melon, genie } = platforms;
          const availablePlatform = bugs || melon || genie;

          return {
            id,
            artistName: availablePlatform.artistName,
            artistImage: availablePlatform.artistImage,
            debut: availablePlatform.debut,
          };
        }),
      };
      return mappedTrack;
    });
  }
}
