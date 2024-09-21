// eslint-disable-next-line no-undef
export async function getHtml(url:string, opt?:RequestInit) {
  const response = await fetch(url, opt);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}
    statusCode:${response.status.toString()}`);
  }
  return response.text();
}
