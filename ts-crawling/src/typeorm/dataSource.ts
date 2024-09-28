import winLogger from '../logger/winston';
import { DataSource } from 'typeorm';
import config from '../config/config';
const { typeorm } = config;

export default async function createDataSource() {
  const dataSource = new DataSource(typeorm);
  await dataSource.initialize()
    .then(() => {
      winLogger.info('DB connection successful!');
    })
    .catch((error:unknown) => { winLogger.error(error); });

  return dataSource;
}
