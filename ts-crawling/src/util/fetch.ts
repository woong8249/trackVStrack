import axios, { type AxiosRequestConfig } from 'axios';
import winLogger from '../logger/winston';

export async function getHtml(url: string, opt: AxiosRequestConfig = {
  timeout: 60_000,
}) {
  try {
    // axios로 요청 전송
    const response = await axios.get(url, opt);
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
