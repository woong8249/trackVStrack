import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TracksService } from './tracks.service';
import { FindDto } from 'src/common/find.dto';
import { FindOneByIdDTO } from 'src/common/findOneByID.dto';

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
    description: 'Search query to filter tracks by keyword',
    example: 'some keyword',
  })
  async find(@Query() query: FindDto) {
    return this.trackService.find(
      query.limit || 10,
      query.offset || 0,
      query.sort || 'desc',
      query.query,
    );
  }
}
