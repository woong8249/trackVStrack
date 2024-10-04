import { Injectable } from '@nestjs/common';
import { Artist } from './artist.entity';
import { ArtistResponse } from 'src/artists/artist.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MyLogger } from 'src/logger/logger.service';
@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private artistRepo: Repository<Artist>,
    private myLogger: MyLogger,
  ) {
    this.myLogger.setContext(ArtistsService.name);
  }

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

  async findById(id: number): Promise<ArtistResponse | null> {
    const artist = await this.artistRepo.findOneBy({ id });
    return { id, ...this.mapArtistToResponse(artist) };
  }
  async find(
    limit: number,
    offset: number,
    sort: 'asc' | 'desc',
    query?: string,
  ): Promise<ArtistResponse[] | []> {
    const queryBuilder = this.artistRepo.createQueryBuilder('artist');
    if (query) {
      queryBuilder.andWhere('artist.artistKeyword LIKE :query', {
        query: `%${query}%`,
      });
    }
    const artists = await queryBuilder
      .orderBy('artist.createDate', sort.toUpperCase() as 'ASC' | 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
    return artists.map((artist) => this.mapArtistToResponse(artist));
  }
}
