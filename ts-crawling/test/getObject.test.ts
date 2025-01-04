import winLogger from '../src/logger/winston';
import { getObject, getObjects } from '../src/s3/getObject';
import {
  describe,
  expect, it,
} from 'vitest';

describe('src/getObject test', () => {
  it('should fetch a stream and parse JSON successfully', async () => {
    const stream = await getObject({ Key: 'data/20241209-20241229-w/melon.json' });
    const result = await new Promise<string>((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      stream.on('end', () => { resolve(Buffer.concat(chunks).toString('utf-8')); });
      stream.on('error', reject);
    });
    try {
      const jsonObject = JSON.parse(result) as unknown;
      expect(jsonObject).toBeInstanceOf(Object);
    } catch (err) {
      winLogger.error('parsing error', { err });
      throw err;
    }
  });
});

describe('src/getObjects test', () => {
  it('should fetch and process objects from S3 successfully', async () => {
    const streams = await getObjects({ Key: 'data/20241209-20241229-w/*' });
    expect(streams).toBeInstanceOf(Array);
    expect(streams.length).toBeGreaterThan(0);

    const results = await Promise.all(
      streams.map(async ({ key, stream }) => {
        winLogger.debug('Processing stream for key', { key });

        const result = await new Promise<string>((resolve, reject) => {
          const chunks: Uint8Array[] = [];
          stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
          stream.on('end', () => { resolve(Buffer.concat(chunks).toString('utf-8')); });
          stream.on('error', reject);
        });
        expect(() => JSON.parse(result) as unknown).not.toThrow();
        const jsonObject = JSON.parse(result) as unknown;
        expect(jsonObject).toBeInstanceOf(Object);
        return { key, result: jsonObject };
      }),
    );

    expect(results).toBeInstanceOf(Array);
    results.forEach(({ key, result }) => {
      expect(key).toMatch(/^data\/20241209-20241229-w\/.*\.json$/); // 키가 예상 패턴과 일치
      expect(result).toBeDefined(); // 결과가 정의되어 있음
    });
  });
});
