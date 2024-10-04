import { Module } from '@nestjs/common';
import { Track } from '../tracks/track.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksArtistsController } from './tracks-artists.controller';
import { TracksArtistsService } from './tracks-artists.service';

@Module({
  imports: [TypeOrmModule.forFeature([Track])],
  providers: [TracksArtistsService],
  exports: [TracksArtistsService],
  controllers: [TracksArtistsController],
})
export class TracksArtistsModule {}
