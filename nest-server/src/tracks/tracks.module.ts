import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Track } from './track.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksController } from './tracks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Track])],
  providers: [TracksService],
  exports: [TracksService],
  controllers: [TracksController],
})
export class TracksModule {}
