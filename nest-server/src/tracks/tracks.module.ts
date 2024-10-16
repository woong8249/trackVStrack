import { Module, forwardRef } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Track } from './track.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksController } from './tracks.controller';
import { ArtistsModule } from 'src/artists/artists.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Track]),
    forwardRef(() => ArtistsModule), // forwardRef로 ArtistsModule을 참조
  ],
  providers: [TracksService],
  exports: [TracksService],
  controllers: [TracksController],
})
export class TracksModule {}
