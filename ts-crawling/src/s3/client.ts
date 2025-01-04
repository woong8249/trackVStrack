import { S3Client } from '@aws-sdk/client-s3';
import config, { required } from '../config/config';

// NODE_ENV 환경 변수를 사용하여 프로덕션 여부를 확인
const { app } = config;
const isProduction = app.env.includes('production');

const s3Client = new S3Client(
  isProduction
    ? {
      region: required('VITE_S3_REGION', undefined) as string,
      credentials: {
        accessKeyId: required('VITE_S3_ACCESS_KEY_ID', undefined) as string,
        secretAccessKey: required('VITE_S3_SECRET_ACCESS_KEY', undefined) as string,
      },
    } : {},
);

export default s3Client;
