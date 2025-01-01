import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import winLogger from '../logger/winston';
import { Readable } from 'stream'; // Node.js Readable 스트림 타입
import { uploadFileToS3 } from '../s3/uploadFileToS3';
import config from '../config/config';

const { app, typeorm } = config;
const { env } = app;
const {
  host, port, database, password,
} = typeorm;

export function createDumpStream(): Readable {
  const args = ['-h', host, '-P', port.toString(), '-u', 'root', `-p${password}`, database];
  const mysqldump = spawn('mysqldump', args);

  mysqldump.stderr.on('data', (chunk: Buffer) => {
    const message = chunk.toString();
    if (message.includes('Warning')) {
      winLogger.warn('Warn chunk:', { chunk: message });
    } else {
      winLogger.error('Error chunk:', { chunk: message });
      throw new Error(`mysqldump error: ${message}`); // 호출자에게 에러 전달
    }
  });

  mysqldump.on('close', (code) => {
    if (code !== 0) {
      winLogger.error('mysqldump process exited', { code });
    }
  });

  return mysqldump.stdout; // stdout을 스트림으로 반환
}

export function saveDumpToLocal(dumpStream: Readable, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);

    dumpStream.pipe(writeStream);

    writeStream.on('finish', () => {
      winLogger.info('Dump saved to local file', { filePath });
      resolve();
    });

    writeStream.on('error', (error) => {
      winLogger.error('Error writing dump to file:', { error });
      reject(error);
    });
  });
}

export async function dumpAndBackup(): Promise<void> {
  try {
    // 현재 시점을 기반으로 고유한 파일명 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // 파일 시스템에 안전한 형식
    const prefix = 'backups';
    const fileName = `${timestamp}.sql`;
    const baseDir = path.join(process.cwd(), prefix);
    const filePath = path.join(baseDir, fileName);

    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 덤프 스트림 생성
    const dumpStream = createDumpStream();
    if (env.includes('development')) {
      await saveDumpToLocal(dumpStream, filePath);

      await uploadFileToS3({
        Key: path.posix.join(prefix, fileName),
        Body: fs.createReadStream(filePath), // 로컬 파일 스트림 사용
      });
    } else {
      await uploadFileToS3({
        Key: path.posix.join(prefix, fileName),
        Body: dumpStream, // 로컬 파일 스트림 사용
      });
    }
  } catch (error) {
    winLogger.error('Error during dump and upload process', { error });
    throw error;
  }
}
