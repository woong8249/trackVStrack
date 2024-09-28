import axios, { type AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import winLogger from '../logger/winston';
import * as cheerio from 'cheerio';

// 2분
const MAX_DELAY = 120_000;
const customRetryDelay = (retryNumber: number) => {
  const delay = axiosRetry.exponentialDelay(retryNumber);
  return Math.min(delay, MAX_DELAY);
};

axiosRetry(axios, {
  retries: 30,
  retryDelay: customRetryDelay,
  onRetry: (retryCount, error, requestConfig) => {
    winLogger.warn(`Retry attempt ${retryCount.toString()} for ${String(requestConfig.url)}`, { error: error.message });
  },
});

const delay = (ms: number) => new Promise((resolve) => { setTimeout(resolve, ms); });

export async function getHtml(
  url: string,
  opt: AxiosRequestConfig = { timeout: 300_000 },
  retries: number = 20, // Number of manual retries
  delayFactor: number = 3000, // default delay time
) {
  try {
    const response = await axios.get(url, opt);
    const $ = cheerio.load(response.data as string);
    const h2Text = $('h2').text();

    if (h2Text.includes('blocked')) {
      if (retries > 0) {
        const retryDelay = customRetryDelay(20 - retries);
        winLogger.warn(`Blocked response detected in genie. Retrying in ${retryDelay.toString()} ms... (Remaining retries: ${(retries - 1).toString()})`);
        await delay(retryDelay);
        return await getHtml(url, opt, retries - 1, delayFactor);
      }
      throw new Error('Max retries reached: Blocked response not resolved.');
    }
    return response.data as string;
  } catch (err: unknown) {
    let errorMessage = 'Unknown error';
    if (err instanceof Error) {
      errorMessage = err.message;
    }

    winLogger.error('Fetch Fail', { url, opt, error: errorMessage });
    throw new Error(errorMessage);
  }
}
