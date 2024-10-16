import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './logger/logger.module';
import { TracksModule } from './tracks/tracks.module';
import { ArtistsModule } from './artists/artists.module';
import { DatabasesModule } from './database/databases.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    TracksModule,
    ArtistsModule,
    DatabasesModule,
  ],
})
export class AppModule {}
