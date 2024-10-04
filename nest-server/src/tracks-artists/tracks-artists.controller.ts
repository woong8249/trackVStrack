import { Controller, Get, Param, Query } from '@nestjs/common';
import { TracksArtistsService } from './tracks-artists.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('TracksArtists')
@Controller('tracks_artists')
export class TracksArtistsController {
  constructor(private trackArtistService: TracksArtistsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get Track info with Artist by track ID',
    description: 'Retrieve a specific track with artist by track ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the track',
    type: Number,
  })
  async findOneByID(@Param('id') id: number) {
    return this.trackArtistService.findById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Find Track info with Artist',
    description: 'Retrieve a list of track info with artist with pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit the number of results',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset the results for pagination',
    example: 0,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search query to filter by keyword',
    example: 'some keyword',
  })
  async find(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('query') query?: string,
  ) {
    return this.trackArtistService.find(limit, offset, sort, query);
  }
}
