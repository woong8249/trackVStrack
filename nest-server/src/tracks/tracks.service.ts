import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Track } from './track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MyLogger } from 'src/logger/logger.service';
import { TrackResponse } from 'src/types/responseDTO/track';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
    private myLogger: MyLogger,
  ) {
    this.myLogger.setContext(TracksService.name);
  }

  public mapTrackToResponse(track: Track): Omit<TrackResponse, 'id'> {
    const { bugs, melon, genie } = track.platforms;
    const availablePlatform = bugs || melon || genie;
    const mappedTrack: Omit<TrackResponse, 'id'> = {
      titleName: availablePlatform.titleName,
      trackImage: availablePlatform.trackImage,
      releaseDate: availablePlatform.releaseDate,
      lyrics: availablePlatform.lyrics,
      platforms: {
        bugs: bugs && { weeklyChartScope: bugs?.weeklyChartScope },
        melon: melon && { weeklyChartScope: melon?.weeklyChartScope },
        genie: genie && { weeklyChartScope: genie?.weeklyChartScope },
      },
    };
    return mappedTrack;
  }

  async findById(id: number): Promise<TrackResponse | null> {
    const track = await this.trackRepo.findOneBy({ id });
    return { id, ...this.mapTrackToResponse(track) };
  }

  async find(
    limit: number,
    offset: number,
    sort: 'asc' | 'desc',
    query?: string,
  ): Promise<TrackResponse[] | []> {
    const queryBuilder = this.trackRepo.createQueryBuilder('track');
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
    return tracks.map((track) => ({
      id: track.id,
      ...this.mapTrackToResponse(track),
    }));
  }
}
