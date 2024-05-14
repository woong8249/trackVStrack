const data = {
  context: {
    client: {
      clientName: 'WEB_MUSIC_ANALYTICS',
      clientVersion: '2.0',
      hl: 'ko',
      gl: 'KR',
      experimentIds: [],
      experimentsToken: '',
      theme: 'MUSIC',
    },
    capabilities: {},
    request: {
      internalExperimentFlags: [],
    },
  },
  browseId: 'FEmusic_analytics_charts_home',
  query: 'perspective=CHART_DETAILS&chart_params_country_code=kr&chart_params_chart_type=TRACKS&chart_params_period_type=WEEKLY&chart_params_end_date=20240307',
};
const url = 'https://charts.youtube.com/youtubei/v1/browse?alt=json&key=AIzaSyCzEW7JUJdSql0-2V4tHUb6laYm4iAE_dM';
const requestOption = { method: 'post', body: JSON.stringify(data) };
const result1 = await fetch(url, requestOption).then(re => re.json());
console.dir(result1, { depth: 100 });
