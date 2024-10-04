import { ArtistsService } from './artists.service';
import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('artists')
export class ArtistsController {
  constructor(private artistsService: ArtistsService) {}
  @Get(':id')
  async findOneByID(@Param('id') id: number) {
    return this.artistsService.findById(id);
  }

  @Get()
  async find(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('query') query?: string,
  ) {
    return this.artistsService.find(limit, offset, sort, query);
  }
}
