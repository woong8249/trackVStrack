import { Controller, Get, Param, Query } from '@nestjs/common';
import { TracksArtistsService } from './tracks-artists.service';

@Controller('tracks_artists')
export class TracksArtistsController {
  constructor(private trackArtistService: TracksArtistsService) {}

  @Get(':id')
  async findOneByID(@Param('id') id: number) {
    return this.trackArtistService.findById(id);
  }

  @Get()
  async find(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('query') query?: string,
  ) {
    return this.trackArtistService.find(limit, offset, sort, query);
  }
}
