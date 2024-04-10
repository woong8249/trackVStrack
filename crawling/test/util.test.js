import {
  describe,
  expect, it,
} from 'vitest';

import { calculateWeekOfMonth } from '../src/util/time';

describe('calculateWeekOfMonth', () => {
  it('Given a start date and an end date, the week number can be calculated based on the majority day, which is determined with respect to the start date.', () => {
    const testInput = [
      { startDate: new Date('2024-04-11'), endDate: new Date('2024-04-17') },
      { startDate: new Date('2024-04-12'), endDate: new Date('2024-04-18') },
      { startDate: new Date('2024-01-29'), endDate: new Date('2024-02-04') },
      { startDate: new Date('2024-02-05'), endDate: new Date('2024-02-11') },
      { startDate: new Date('2024-02-12'), endDate: new Date('2024-02-18') },
      { startDate: new Date('2024-02-19'), endDate: new Date('2024-02-25') },
      { startDate: new Date('2024-02-26'), endDate: new Date('2024-03-03') },
      { startDate: new Date('2024-03-04'), endDate: new Date('2024-03-10') },
    ];
    const expects = [
      { year: 2024, month: 4, week: 3 },
      { year: 2024, month: 4, week: 3 },
      { year: 2024, month: 2, week: 1 },
      { year: 2024, month: 2, week: 2 },
      { year: 2024, month: 2, week: 3 },
      { year: 2024, month: 2, week: 4 },
      { year: 2024, month: 2, week: 5 },
      { year: 2024, month: 3, week: 2 },
    ];

    testInput.forEach(({ startDate, endDate }, index) => {
      const result = calculateWeekOfMonth(startDate, endDate);
      const { month, week } = result;
      expect(month).toBe(expects[index].month);
      expect(week).toBe(expects[index].week);
    });
    expect.assertions(testInput.length * 2);
  });

  it('The interval between startDate and endDate must be exactly 7 days.', () => {
    expect(() => calculateWeekOfMonth(new Date('2024-03-08'), new Date('2024-03-15'))).toThrowError();
  });
});
