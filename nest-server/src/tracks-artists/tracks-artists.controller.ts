import { Controller, Get, Param, Query } from '@nestjs/common';
import { TracksArtistsService } from './tracks-artists.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FindDto as FindDTO } from 'src/common/find.dto';
import { FindOneByIdDTO as FindOneByIdDTO } from 'src/common/findOneByID.dto';

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
  async findOneByID(@Param() parm: FindOneByIdDTO) {
    return this.trackArtistService.findById(parm.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Find Track info with Artist',
    description: 'Retrieve a list of track info with artist with pagination',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search query to filter by keyword',
    example: 'some keyword',
  })
  async find(@Query() query: FindDTO) {
    return this.trackArtistService.find(
      query.limit,
      query.offset,
      query.sort,
      query.query,
    );
  }
}
