import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TracksService } from './tracks.service';

import { FindOneByIdDTO } from 'src/common/findOneByID.dto';
import { FindWithChartDurationDTO } from 'src/common/findWIthChartDuration.doto';

@ApiTags('Tracks') // Swagger 태그 설정
@Controller('tracks')
export class TracksController {
  constructor(private trackService: TracksService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get Track by ID',
    description: 'Retrieve a specific track by ID',
  })
  @ApiParam({ name: 'id', description: 'ID of the track', type: Number })
  async findOneByID(@Param() parm: FindOneByIdDTO) {
    return this.trackService.findById(parm.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Find Tracks',
    description:
      'Retrieve a list of tracks with pagination and sorting options',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit the number of results. default is 10',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset the results for pagination',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort order.default is desc',
    enum: ['asc', 'desc', 'random'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search query to filter tracks by keyword',
  })
  @ApiQuery({
    name: 'minWeeksOnChart',
    required: false,
    description:
      'Filter tracks that have been on the chart for at least the specified number of weeks. default is 10',
  })
  async find(@Query() query: FindWithChartDurationDTO) {
    return this.trackService.find(
      query.limit || 10,
      query.offset || 0,
      query.sort || 'desc',
      query.query,
      query.minWeeksOnChart || 0,
    );
  }
}
