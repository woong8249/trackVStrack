import type { WeekOfMonth } from 'src/types/platform';

export function createAllDatesBetween(startDate :Date, endDate:Date) {
  const dates = [];
  while (startDate <= endDate) {
    dates.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }
  return dates;
}
export enum DayOfWeek {
  Sunday, // 0
  Monday, // 1
  Tuesday, // 2
  Wednesday, // 3
  Thursday, // 4
  Friday, // 5
  Saturday // 6
}

export function createWeeklyDatesBetween(startDate:Date, endDate:Date, dayOfWeek: DayOfWeek = DayOfWeek.Monday) {
  const allDates = createAllDatesBetween(startDate, endDate);
  const filteredDates = allDates.filter((date) => date.getDay() === dayOfWeek as number);
  return filteredDates;
}

export function createMonthlyFirstDatesBetween(startDate:Date, endDate:Date) {
  const dates = [];
  startDate.setDate(1);
  while (startDate <= endDate) {
    dates.push(new Date(startDate));
    startDate.setMonth(startDate.getMonth() + 1);
  }
  return dates;
}

export function addSixDaysToYYYYMMDD(inputYYYYMMDD: string): string {
  // 입력된 문자열을 년, 월, 일로 분리합니다.
  const year = parseInt(inputYYYYMMDD.substring(0, 4), 10);
  const month = parseInt(inputYYYYMMDD.substring(4, 6), 10) - 1; // getMonth()는 0부터 시작하므로 1을 빼줍니다.
  const day = parseInt(inputYYYYMMDD.substring(6, 8), 10);

  // Date 객체를 생성합니다.
  const date = new Date(year, month, day);

  // 6일을 추가합니다.
  date.setDate(date.getDate() + 6);

  // 결과 날짜를 YYYYMMDD 형식으로 포맷팅합니다.
  const resultYear = date.getFullYear().toString(); // 문자열로 변환
  const resultMonth = (date.getMonth() + 1).toString().padStart(2, '0'); // 1자리일 경우 0을 추가
  const resultDay = date.getDate().toString().padStart(2, '0'); // 1자리일 경우 0을 추가

  return `${resultYear}${resultMonth}${resultDay}`;
}

export function extractYearMonthDay(date: Date): { year: string; month: string; day: string } {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return { year, month, day };
}

export function calculateWeekOfMonth(startDate: Date, endDate: Date): WeekOfMonth {
  const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diff !== 6) {
    throw new Error('The interval between startDate and endDate must be exactly 7 days.');
  }

  // Determine the month and year based on the majority of the week
  const majorityDate = new Date(startDate);
  majorityDate.setDate(startDate.getDate() + 3); // Adding 3 days to get to the majority day of the week
  const month = (majorityDate.getMonth() + 1).toString();
  const year = majorityDate.getFullYear().toString();

  // Calculate the first day of the week's month
  const firstDayOfMonth = new Date(Number(year), Number(month) - 1, 1);
  // Find out the week of the month for the majority date
  let week = Math.ceil(((majorityDate.getTime() - firstDayOfMonth.getTime()) / 86400000 + firstDayOfMonth.getDay() + 1) / 7).toString();

  // Adjust for weeks that might be considered the first week of the next month
  if (majorityDate.getMonth() !== startDate.getMonth()) {
    week = '1'; // If the majority of the week falls into the next month, it's considered the first week
  }

  return { year, month, week };
}

export function validateDate(dateString: string): Date {
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

export function toMysqlFormat(dateString: string): string {
  const date = new Date(dateString);
  if (date.toString() === 'Invalid Date') {
    throw new Error('Invalid date provided');
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
}
export function formatDates(filename: string): [string, string] {
  const dates = filename.split('-w.json')[0] as string;
  const [startDate, endDate] = dates.split('-') as [string, string];
  const formattedStartDate = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
  const formattedEndDate = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;
  return [formattedStartDate, formattedEndDate];
}
