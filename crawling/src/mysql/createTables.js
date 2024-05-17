/* eslint-disable no-restricted-syntax */
import winLogger from '../util/winston.js';

import pool, { ping } from './pool.js';

const tableNames = ['tracks', 'trackDetails', 'artists'];
const queries = [
  'DROP TABLE IF EXISTS `trackDetails`;',
  'DROP TABLE IF EXISTS `artists`;',
  'DROP TABLE IF EXISTS `tracks`;',
  `CREATE TABLE  \`artists\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`artistKey\` VARCHAR(50) UNIQUE,
  \`artistKeyword\` VARCHAR(50),
  \`artistImage\` VARCHAR(512) NULL,
  \`debut\` VARCHAR(50) NULL,
  \`platforms\` JSON
);`,
  `CREATE TABLE  \`tracks\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`trackKey\` VARCHAR(100) UNIQUE,
  \`titleKeyword\` VARCHAR(100),
  \`releaseDate\` DATETIME,
  \`platforms\` JSON,
  \`trackImages\` VARCHAR(800),
  \`thumbnails\` VARCHAR(800),
  \`lyrics\` VARCHAR(5000)
);`,
  `CREATE TABLE  \`trackDetails\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`artistId\` INT,
  \`trackId\` INT
);`,
  'ALTER TABLE `trackDetails` ADD FOREIGN KEY (`artistId`) REFERENCES `artists` (`id`);',
  'ALTER TABLE `trackDetails` ADD FOREIGN KEY (`trackId`) REFERENCES `tracks` (`id`);',
  'ALTER TABLE `trackDetails` ADD UNIQUE INDEX `idx_artist_track` (`artistId`, `trackId`);',
];

export default async function createTable() {
  await ping();
  for await (const query of queries) {
    const connection = await pool.getConnection();
    await connection.query(query).then(result => {
      winLogger.info('Query executed successfully', { query, result });
    });
    connection.release();
  }
}

export async function doesTableHaveData() {
  await ping();
  let result = false;
  const tasks = tableNames.map(async tableName => {
    const conn = await pool.getConnection();
    const queryResult = (await conn.query(`select * from ${tableName}`))[0];
    if (queryResult.length !== 0) {
      result = true;
      winLogger.debug('Table have Data', { tableName });
    }
    conn.release();
  });
  await Promise.all(tasks);
  return result;
}
