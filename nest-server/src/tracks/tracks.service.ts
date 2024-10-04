import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Track } from './track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MyLogger } from 'src/logger/logger.service';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
    private myLogger: MyLogger,
  ) {
    this.myLogger.setContext(TracksService.name);
  }

  async findById(id: number): Promise<Track | null> {
    return await this.trackRepo.findOneBy({ id });
  }

  async find(
    limit: number,
    offset: number,
    sort: 'asc' | 'desc',
    query?: string,
  ): Promise<Track[] | []> {
    const queryBuilder = this.trackRepo.createQueryBuilder('track');
    if (query) {
      queryBuilder.andWhere('track.trackKeyword LIKE :query', {
        query: `%${query}%`,
      });
    }
    return queryBuilder
      .orderBy('track.createDate', sort.toUpperCase() as 'DESC' | 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();
  }
}
