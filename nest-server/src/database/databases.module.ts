import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import loadDatabaseConfig from './database.load-config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: loadDatabaseConfig,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabasesModule {}
