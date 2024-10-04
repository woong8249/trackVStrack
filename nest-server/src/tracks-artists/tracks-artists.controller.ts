import { Controller, Get, Param, Query } from '@nestjs/common';
import { TracksArtistsService } from './tracks-artists.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

import { FindOneByIdDTO } from 'src/common/findOneByID.dto';
import { FindWithChartDurationDTO } from 'src/common/findWIthChartDuration.doto';

@ApiTags('TracksArtists')
@Controller('tracks-artists')
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
  async findOneByID(@Param() parm: FindOneByIdDTO) {
    return this.trackArtistService.findById(parm.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Find Tracks joined Artist',
    description: 'Retrieve a list of track info with artist with pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Limit the number of results. default is 10',
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
    description: 'Offset the results for pagination. default is 0',
  })
  @ApiQuery({
    name: 'sort',
    enum: ['asc', 'desc', 'random'],
    required: false,
    description: 'Sort order.default is desc',
    example: 'desc',
  })
  @ApiQuery({
    name: 'query',
    type: 'string',
    required: false,
    description: 'Search query to filter tracks by keyword',
  })
  @ApiQuery({
    name: 'minWeeksOnChart',
    type: 'number',
    required: false,
    description:
      'Filter tracks that have been on the chart for at least the specified number of weeks.',
  })
  async find(@Query() query: FindWithChartDurationDTO) {
    return this.trackArtistService.find(
      query.limit || 10,
      query.offset || 0,
      query.sort || 'desc',
      query.query,
      query.minWeeksOnChart || 0,
    );
  }
}
