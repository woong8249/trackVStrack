import winLogger from '../logger/winston';
import { DataSource } from 'typeorm';
import config from '../config/config';
import { Artist } from './entity/Artist';
import { Track } from './entity/Track';

const { typeorm } = config;

let dataSourceInstance: DataSource | null = null;

export default async function createDataSource(): Promise<DataSource> {
  // 이미 데이터소스가 초기화되었으면 기존 인스턴스를 반환
  if (dataSourceInstance) {
    return dataSourceInstance;
  }

  const option = { ...typeorm, synchronize: false, entities: [Artist, Track] };
  const dataSource = new DataSource(option);

  try {
    await dataSource.initialize();
    winLogger.info('DB connection successful!');
    dataSourceInstance = dataSource; // 성공적으로 초기화되면 인스턴스를 저장
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    winLogger.error(`DB connection failed: ${error}`);
    throw error; // 에러 발생 시 예외를 던져줍니다.
  }

  return dataSourceInstance;
}
