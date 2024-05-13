/* eslint-disable no-restricted-syntax */
import winLogger from '../util/winston.js';

import pool from './pool.js';

const queries = [
  `CREATE TABLE IF NOT EXISTS \`artists\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`artistKey\` VARCHAR(50) UNIQUE,
  \`artistKeyword\` VARCHAR(50),
  \`platforms\` JSON
);`,
  `CREATE TABLE IF NOT EXISTS \`tracks\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`trackKey\` VARCHAR(100) UNIQUE,
  \`titleKeyword\` VARCHAR(100),
  \`releaseDate\` DATETIME,
  \`platforms\` JSON,
  \`trackImages\` VARCHAR(512),
  \`thumbnails\` VARCHAR(512),
  \`lyrics\` VARCHAR(5000)
);`,
  `CREATE TABLE IF NOT EXISTS \`trackDetails\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`artistId\` INT,
  \`trackId\` INT
);`,
  'ALTER TABLE `trackDetails` ADD FOREIGN KEY (`artistId`) REFERENCES `artists` (`id`);',
  'ALTER TABLE `trackDetails` ADD FOREIGN KEY (`trackId`) REFERENCES `tracks` (`id`);',
];

export default async function createTable() {
  for await (const query of queries) {
    const connection = await pool.getConnection();
    await connection.query(query).then(result => {
      winLogger.info('Query executed successfully', { query, result });
    });
    connection.release();
  }
}
