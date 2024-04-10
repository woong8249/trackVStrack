import fs from 'fs';

import {
  describe,
  expect, it,
} from 'vitest';

import * as bugs from '../src/dataCollecting/bugs.js';
import * as genie from '../src/dataCollecting/genie.js';
import * as melon from '../src/dataCollecting/melon.js';

const modules = [melon, genie, bugs];
describe('정규표현식 으로 전부다얼마나 묶이는지 테스트할꺼임', () => {
  it('asfnjadnfjk', async () => {
    const promises = modules.map(ite => ite.fetchChart('2024', '01', '01', 'w'));
    const result = await Promise.all(promises);
    result.forEach(item => {
      const path = `./test/tmp/${item.platform}.json`;
      fs.writeFileSync(path, JSON.stringify(item));
    });
    expect(1).toBe(1);
  });
});
