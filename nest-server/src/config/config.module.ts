import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { getConfig } from './configuration';
import { Module } from '@nestjs/common';
import { MyLogger } from 'src/logger/logger.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.APP_ENV}`,
      load: [getConfig],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {
  constructor(private logger: MyLogger) {
    logger.setContext(ConfigModule.name);
    this.logger.log(getConfig());
  }
}
