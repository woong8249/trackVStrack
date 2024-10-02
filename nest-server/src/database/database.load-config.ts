import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default async (configService: ConfigService) =>
  ({
    type: 'mysql',
    host: configService.get<string>('typeorm.host'),
    port: configService.get<number>('typeorm.port'),
    username: configService.get<string>('typeorm.username'),
    password: configService.get<string>('typeorm.password'),
    database: configService.get<string>('typeorm.database'),
    logging: true,
    autoLoadEntities: true,
  }) as Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
