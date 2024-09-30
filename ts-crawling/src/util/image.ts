/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios';
import resemble from 'resemblejs';
import sharp from 'sharp';
import winLogger from 'src/logger/winston';

const imageCache = new Map<string, Buffer>();

async function downloadImageAsBuffer(url: string): Promise<Buffer> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }
  const response = await axios<Buffer>({
    url,
    responseType: 'arraybuffer',
  });
  const imageBuffer = Buffer.from(response.data);
  imageCache.set(url, imageBuffer); // 캐시에 저장
  return imageBuffer;
}

// 이미지 크기를 동일하게 조정하는 함수
async function resizeImageToMatch(imageBuffer: Buffer, width: number, height: number) {
  return sharp(imageBuffer).resize(width, height).toBuffer();
}

export async function compareImages(url1: string, url2: string, info?: unknown): Promise<number> {
  if (url1.includes('missing') || url2.includes('missing')) {
    return 100;
  }
  try {
    const imageBuffer1 = await downloadImageAsBuffer(url1);
    const imageBuffer2 = await downloadImageAsBuffer(url2);

    const metadata1 = await sharp(imageBuffer1).metadata();
    const metadata2 = await sharp(imageBuffer2).metadata();

    const targetWidth = Math.min(metadata1.width!, metadata2.width!);
    const targetHeight = Math.min(metadata1.height!, metadata2.height!);

    const resizedImageBuffer1 = await resizeImageToMatch(imageBuffer1, targetWidth, targetHeight);
    const resizedImageBuffer2 = await resizeImageToMatch(imageBuffer2, targetWidth, targetHeight);
    return await new Promise((resolve) => {
      resemble(resizedImageBuffer1)
        .compareTo(resizedImageBuffer2)
        .onComplete((data) => {
          resolve(Number(data.rawMisMatchPercentage));
        });
    });
  } catch (err: unknown) {
    winLogger.warn('image fetch fail', {
      err, url1, url2, info,
    });
    return 0;
  }
}
