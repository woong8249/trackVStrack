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

export function extractYearMonthDay(date) {
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return { year, month, day };
}

export function calculateWeekOfMonth(startDate, endDate) {
  const diff = (endDate - startDate) / (1000 * 60 * 60 * 24);

  if (diff !== 6) {
    throw new Error('The interval between startDate and endDate must be exactly 7 days.');
  }

  // Determine the month and year based on the majority of the week
  const majorityDate = new Date(startDate);
  majorityDate.setDate(startDate.getDate() + 3); // Adding 3 days to get to the majority day of the week
  const month = majorityDate.getMonth() + 1;
  const year = majorityDate.getFullYear();

  // Calculate the first day of the week's month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  // Find out the week of the month for the majority date
  let week = Math.ceil(((majorityDate - firstDayOfMonth) / (86400000) + firstDayOfMonth.getDay() + 1) / 7);

  // Adjust for weeks that might be considered the first week of the next month
  if (majorityDate.getMonth() !== startDate.getMonth()) {
    week = 1; // If the majority of the week falls into the next month, it's considered the first week
  }

  return { year, month, week };
}

export function validateDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD 포맷 검사
  if (!regex.test(dateString)) {
    throw new Error('Date format must be YYYY-MM-DD');
  }
  const date = new Date(dateString);
  if (date.toString() === 'Invalid Date') {
    throw new Error('Invalid date provided');
  }
  return date;
}

export function toMysqlFormat(dateString) {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function formatDates(filename) {
  const dates = filename.split('-w.json')[0];
  const [startDate, endDate] = dates.split('-');
  const formattedStartDate = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
  const formattedEndDate = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;
  return [formattedStartDate, formattedEndDate];
}
