import puppeteer from 'puppeteer';

export async function getHtml(url, opt = undefined) {
  const response = await fetch(url, opt);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}
    statusCode:${response.status}`);
  }
  return response.text();
}

// URL을 인자로 받아 해당 페이지의 HTML을 반환하는 함수
export async function fetchPageContent(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  const content = await page.content();
  await browser.close();
  return content;
}

/**
* @param {Date} startDate - new Date()
* @param {Date} endDate - new Date()
* @returns {Date[]}
*/
export function createAllDatesBetween(startDate, endDate) {
  const dates = [];
  while (startDate <= endDate) {
    dates.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }
  return dates;
}

/**
  * @param {Date} startDate - new Date()
  * @param {Date} endDate - new Date()
  * @param {number} dayOfWeek - dayOfWeek (0=sun, 1=mon, ..., 6=sat),,default is 1
  * @returns {Date[]}
  */
export function createWeeklyDatesBetween(startDate, endDate, dayOfWeek = 1) {
  const allDates = createAllDatesBetween(startDate, endDate);
  const filteredDates = allDates.filter(date => date.getDay() === dayOfWeek);
  return filteredDates;
}

/**
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Date[]}
 */
export function createMonthlyFirstDatesBetween(startDate, endDate) {
  const dates = [];
  startDate.setDate(1);
  while (startDate <= endDate) {
    dates.push(new Date(startDate));
    startDate.setMonth(startDate.getMonth() + 1);
  }
  return dates;
}

export function addSixDaysToYYYYMMDD(inputYYYYMMDD) {
  // 입력된 문자열을 년, 월, 일로 분리합니다.
  const year = parseInt(inputYYYYMMDD.substring(0, 4), 10);
  const month = parseInt(inputYYYYMMDD.substring(4, 6), 10) - 1; // getMonth()는 0부터 시작하므로 1을 빼줍니다.
  const day = parseInt(inputYYYYMMDD.substring(6, 8), 10);

  // Date 객체를 생성합니다.
  const date = new Date(year, month, day);

  // 6일을 추가합니다.
  date.setDate(date.getDate() + 6);

  // 결과 날짜를 YYYYMMDD 형식으로 포맷팅합니다.
  const resultYear = date.getFullYear();
  let resultMonth = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 출력을 위해 1을 더해줍니다.
  let resultDay = date.getDate();

  // 월과 일이 한 자리수일 경우 앞에 '0'을 붙여 두 자리수로 만듭니다.
  resultMonth = resultMonth < 10 ? `0${resultMonth}` : `${resultMonth}`;
  resultDay = resultDay < 10 ? `0${resultDay}` : `${resultDay}`;

  return `${resultYear}${resultMonth}${resultDay}`;
}

export function arrayToChunk(array, size) {
  return Array.from(
    { length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size),
  );
}

export function extractYearMonthDay(date) {
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return { year, month, day };
}
