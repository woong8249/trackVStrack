import * as bugs from '../platforms/domestic/bugs.js';
import * as genie from '../platforms/domestic/genie.js';
import * as melon from '../platforms/domestic/melon.js';

const modules = { melon, bugs, genie };

export default function fetchRealTimeCharts() {
  const charts = Object.entries(modules).map(async module => {
    const [key, value] = module;
    const result = await value.fetchRealTimeChart();
    return { [key]: result };
  });
  return Promise.all(charts);
}
