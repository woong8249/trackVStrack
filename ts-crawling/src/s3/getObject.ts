import client from './client';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import winLogger from '../logger/winston';
import { Readable } from 'stream';

interface GetParams {
    Key: string;
}

export const getObject = async ({ Key }: GetParams): Promise<Readable> => {
  try {
    const command = new GetObjectCommand({
      Bucket: 'trackvstrack.net',
      Key,
    });

    const response = await client.send(command);
    const stream = response.Body as Readable;
    winLogger.debug('GetObject success:', { Key });
    return stream;
  } catch (err) {
    winLogger.error('GetObject fail', { err });
    throw err;
  }
};

export async function getObjects({ Key }: GetParams): Promise<{key:string, stream:Readable}[]> {
  try {
    const [prefix, wildcard] = Key.split('*');
    winLogger.debug('Searching for objects with prefix:', { prefix });

    // 1. S3에서 접두사로 객체 목록 가져오기
    const listCommand = new ListObjectsV2Command({
      Bucket: 'trackvstrack.net',
      Prefix: prefix, // 접두사만 사용
    });

    const listResponse = await client.send(listCommand);
    const matchingKeys = (listResponse.Contents || [])
      .filter((item) => (
        item.Key
        && item.Size !== undefined // Size가 정의되어 있음
        && item.Size > 0
        && (!wildcard || item.Key.endsWith(wildcard))
      ))
      .map((item) => item.Key as string);

    if (matchingKeys.length === 0) {
      winLogger.warn('No matching objects found for:', { Key });
      throw new Error(`No objects found matching: ${Key}`);
    }

    winLogger.debug('Found matching objects:', { matchingKeys });

    // 3. 병렬로 getObject 호출
    const streams = await Promise.all(
      matchingKeys.map(async (matchingKey) => {
        const stream = await getObject({ Key: matchingKey });
        return { key: matchingKey, stream };
      }),
    );
    // return streams
    winLogger.debug('All objects fetched successfully:', { matchingKeys });
    return streams;
  } catch (err) {
    winLogger.error('Error fetching objects:', { err });
    throw err;
  }
}
