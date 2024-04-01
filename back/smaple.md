# sample data

```js
let data = {
  uuid: 'adlkgmwrkmkfm',
  songName: 'sample',
  releaseDate: '2024-02-20',
  platforms: {
    youtubeMusic: {
      weeklyChart: [{
        startDate: '2024-02-19',
        endDate: '2024-02-25',
        rank: 70,
      }],
    },
    appleMusic: {
      dailyChart: [{
        date: '2024-02-19',
        rank: 70,
      },
      {
        date: '2024-02-20',
        rank: 97,
      }],
    },
    genie: {
      dailyChart: [{
        date: '2024-02-19',
        rank: 72,
      },
      {
        date: '2024-02-20',
        rank: 89,
      }],
      weeklyChart: [{
        startDate: '2024-02-19',
        endDate: '2024-02-25',
        rank: 67,
      }],
    },
    melon: {
      dailyChart: [{
        date: '2024-02-19',
        rank: 72,
      },
      {
        date: '2024-02-20',
        rank: 89,
      }],
      weeklyChart: [{
        startDate: '2024-02-19',
        endDate: '2024-02-25',
        rank: 67,
      }],
    },
    bugs: {
      dailyChart: [{
        date: '2024-02-19',
        rank: 72,
      },
      {
        date: '2024-02-20',
        rank: 89,
      }],
      weeklyChart: [{
        startDate: '2024-02-19',
        endDate: '2024-02-25',
        rank: 67,
      }],
    },
  },
  charts: {
    dailyChart: {},
    weeklyChart: {},
    monthlyChart: {},
  },
};

// 플랫폼과 차트 유형에 따라 charts 객체 채우기
Object.keys(data.platforms).forEach(platform => {
  Object.keys(data.platforms[platform]).forEach(chartType => {
    if (data.platforms[platform][chartType].length > 0) {
      if (!data.charts[chartType]) {
        data.charts[chartType] = {};
      }
      data.charts[chartType][platform] = data.platforms[platform][chartType];
    }
  });
});

console.log(data.charts);

```
