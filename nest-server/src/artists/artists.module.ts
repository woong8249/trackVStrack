import { Module, forwardRef } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './artist.entity';
import { TracksModule } from '../tracks/tracks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artist]),
    forwardRef(() => TracksModule), // forwardRef로 TracksModule을 참조
  ],
  providers: [ArtistsService],
  exports: [ArtistsService],
  controllers: [ArtistsController],
})
export class ArtistsModule {}
