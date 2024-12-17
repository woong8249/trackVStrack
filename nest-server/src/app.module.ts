import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';

import { TracksModule } from './tracks/tracks.module';
import { ArtistsModule } from './artists/artists.module';
import { DatabasesModule } from './database/databases.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { getConfig } from './config/configuration';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TracksModule,
    ArtistsModule,
    DatabasesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.APP_ENV}`,
      load: [getConfig],
    }),
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
  constructor() {
    this.logger.log(getConfig());
  }
}
