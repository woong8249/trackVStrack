import { Module } from '@nestjs/common';
import { Track } from '../tracks/track.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksArtistsController } from './tracks-artists.controller';
import { TracksArtistsService } from './tracks-artists.service';
import { TracksModule } from 'src/tracks/tracks.module';
import { ArtistsModule } from 'src/artists/artists.module';

@Module({
  imports: [TracksModule, ArtistsModule, TypeOrmModule.forFeature([Track])],
  providers: [TracksArtistsService],
  exports: [TracksArtistsService],
  controllers: [TracksArtistsController],
})
export class TracksArtistsModule {}
