import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import loadDatabaseConfig from './database.load-config';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: loadDatabaseConfig,
      inject: [ConfigService],
      dataSourceFactory: async (options) => {
        // 초기화 작업에서 비동기 작업이 필요하다면 이와같이도 사용할 수 있음
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabasesModule {}
