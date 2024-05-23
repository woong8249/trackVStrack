/* eslint-disable no-undef */
const API_BASE_URL = 'http://localhost:3000';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function filterChartData(chartData, startDate, endDate) {
  const filteredLabels = [];
  const filteredDatasets = chartData.datasets.map(dataset => {
    const filteredData = dataset.data.filter(point => {
      const date = new Date(point.x.replace('w', ''));
      return date >= startDate && date <= endDate;
    });
    filteredData.forEach(point => {
      if (!filteredLabels.includes(point.x)) {
        filteredLabels.push(point.x);
      }
    });
    return { ...dataset, data: filteredData };
  });
  return { labels: filteredLabels, datasets: filteredDatasets };
}

function prepareChartData(platforms) {
  const labels = [];
  const datasets = [];

  const addChartData = (platform, label, color) => {
    if (platform && platform.chartInfos) {
      const data = [];
      platform.chartInfos.forEach(info => {
        const dateLabel = `${info.weekOfMonth.year}-${info.weekOfMonth.month}-${info.weekOfMonth.week}w`;
        if (!labels.includes(dateLabel)) {
          labels.push(dateLabel);
        }
        data.push({
          x: dateLabel,
          y: parseInt(info.rank, 10),
        });
      });
      datasets.push({
        label,
        data,
        borderColor: color,
        fill: false,
      });
    }
  };

  addChartData(platforms.melon, 'Melon', '#00C73C');
  addChartData(platforms.genie, 'Genie', '#3498DB');
  addChartData(platforms.bugs, 'Bugs', '#E44C29');

  labels.sort((a, b) => new Date(a.split('-').join('/').replace('w', '')) - new Date(b.split('-').join('/').replace('w', '')));

  return { labels, datasets };
}

function displayTrackDetails(trackDetails, track, chartInstanceRef, func) {
  if (track) {
    const { platforms } = track;
    const chartData = prepareChartData(platforms);
    Object.assign(trackDetails, { textContent: '' });

    const title = document.createElement('h2');
    title.textContent = track.titleName;

    const img = document.createElement('img');
    img.src = track.trackImage;
    img.alt = track.titleName;
    img.style.width = '200px';
    img.style.height = '200px';

    const releaseDate = document.createElement('p');
    releaseDate.textContent = `Release Date: ${new Date(track.releaseDate).toLocaleDateString()}`;

    const canvas = document.createElement('canvas');
    canvas.id = 'comparison-chart';

    trackDetails.append(title, img, releaseDate, canvas);

    const ctx = canvas.getContext('2d');
    Object.assign(chartInstanceRef, {
      instance: new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          scales: {
            x: {
              type: 'category',
              labels: chartData.labels,
              title: {
                display: true,
                text: 'Date (Year-Month-Week)',
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: true,
                maxTicksLimit: 20, // 적절한 최대 틱 수 설정
              },
            },
            y: {
              reverse: true,
              min: 1,
              max: 100,
              title: {
                display: true,
                text: 'Rank',
              },
            },
          },
        },
      }),
    });

    func(platforms);
  }
}

async function getTrackById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/track/${id}`);
    const data = await response.json();
    console.log('Track details:', data);
    return data.track;
  } catch (error) {
    console.error('Error fetching track details:', error);
    return null;
  }
}

function initializeDateInputs(platforms, startDateInput, endDateInput) {
  const dates = [];

  Object.values(platforms).forEach(platform => {
    if (platform && platform.chartInfos) {
      platform.chartInfos.forEach(info => {
        const date = new Date(info.startDate);
        dates.push(date);
      });
    }
  });

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  Object.assign(startDateInput, { min: formatDate(minDate), max: formatDate(maxDate), value: formatDate(minDate) });
  Object.assign(endDateInput, { min: formatDate(minDate), max: formatDate(maxDate), value: formatDate(maxDate) });
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', async () => {
  const trackDetails = document.getElementById('track-details');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const updateChartButton = document.getElementById('update-chart');
  const chartInstance = { instance: null };
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get('id');

  if (trackId) {
    const track = await getTrackById(trackId);
    displayTrackDetails(trackDetails, track, chartInstance, platforms => initializeDateInputs(platforms, startDateInput, endDateInput));
  }

  updateChartButton.addEventListener('click', () => {
    if (chartInstance.instance) {
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);

      if (startDate <= endDate) {
        const filteredChartData = filterChartData(chartInstance.instance.data, startDate, endDate);
        Object.assign(chartInstance.instance.data, filteredChartData);
        chartInstance.instance.update();
      } else {
        alert('End date must be after start date');
      }
    } else {
      alert('Chart is not initialized');
    }
  });
});
