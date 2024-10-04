import { ArtistsService } from './artists.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FindDTO } from 'src/common/find.dto';
import { FindOneByIdDTO } from 'src/common/findOneByID.dto';

@ApiTags('Artists')
@Controller('artists')
export class ArtistsController {
  constructor(private artistsService: ArtistsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get Artist by ID',
    description: 'Retrieve a specific artist by ID',
  })
  @ApiParam({ name: 'id', description: 'ID of the artist', type: Number })
  async findOneByID(@Param() parm: FindOneByIdDTO) {
    return this.artistsService.findById(parm.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Find Artists',
    description:
      'Retrieve a list of artists with pagination and sorting options',
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
    description: 'Search query to filter artists by keyword',
    example: 'some keyword',
  })
  async find(@Query() query: FindDTO) {
    return this.artistsService.find(
      query.limit || 10,
      query.offset || 0,
      query.sort || 'desc',
      query.query,
    );
  }
}
