import { Controller, Get, Param, Query } from '@nestjs/common';
import { TracksService } from './tracks.service';

@Controller('tracks')
export class TracksController {
  constructor(private trackService: TracksService) {}

  @Get(':id')
  async findOneByID(@Param('id') id: number) {
    return this.trackService.findById(id);
  }

  @Get()
  async find(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('query') query?: string,
  ) {
    return this.trackService.find(limit, offset, sort, query);
  }
}
