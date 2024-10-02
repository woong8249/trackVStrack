import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService, getConfig } from './config.service';
import { Module } from '@nestjs/common';

const nodeENV = process.env['APP_ENV'] || 'production';
const envFilePath =
  nodeENV === 'development'
    ? '.development.env'
    : nodeENV === 'test'
      ? '.test.env'
      : '.production.env';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      load: [getConfig],
    }),
  ],
  providers: [ConfigService],
  exports: [NestConfigModule],
})
export class ConfigModule {}
