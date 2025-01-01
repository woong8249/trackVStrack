import client from './client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { StreamingBlobPayloadInputTypes } from 'node_modules/.pnpm/@smithy+types@3.7.2/node_modules/@smithy/types/dist-types/streaming-payload/streaming-blob-payload-input-types.d.ts';
import winLogger from '../logger/winston';

interface UploadParams {
    Key: string;
    Body: StreamingBlobPayloadInputTypes;
}

export const uploadFileToS3 = async ({ Key, Body }: UploadParams): Promise<void> => {
  try {
    const command = new PutObjectCommand({
      Bucket: 'trackvstrack.net',
      Key,
      Body,
      ServerSideEncryption: 'AES256', // 서버 측 암호화
      StorageClass: 'STANDARD_IA', // 덜 자주 접근하는 데이터 저장
    });
    const response = await client.send(command);
    winLogger.info('Upload success:', { response });
  } catch (err) {
    winLogger.error('Upload fail:', err);
  }
};
