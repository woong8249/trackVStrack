import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService, getConfig } from './config.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.APP_ENV}`,
      load: [getConfig],
    }),
  ],
  providers: [ConfigService],
  exports: [NestConfigModule],
})
export class ConfigModule {}
