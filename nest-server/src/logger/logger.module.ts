import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { MyLogger } from './logger.service';

@Global()
@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
