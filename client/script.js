/* eslint-disable no-undef */
const API_BASE_URL = 'http://localhost:3000';

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function handleSelect(type, id) {
  if (type === 'track') {
    window.location.href = `track.html?id=${id}`;
  } else if (type === 'artist') {
    window.location.href = `artist.html?id=${id}`;
  }
}

function displaySearchResults(searchResultsPopup, results) {
  Object.assign(searchResultsPopup, { innerHTML: '' });
  const { tracks, artists } = results;
  if (tracks.length > 0) {
    const trackSection = document.createElement('div');
    trackSection.classList.add('result-section');
    const trackTitle = document.createElement('h3');
    trackTitle.textContent = 'tracks';
    trackSection.append(trackTitle);

    tracks.forEach(track => {
      const div = document.createElement('div');
      div.classList.add('result-item');

      const img = document.createElement('img');
      img.src = track.thumbnail;
      img.alt = 'Track Thumbnail';

      const titleSpan = document.createElement('span');
      titleSpan.classList.add('track-title');
      titleSpan.textContent = track.titleName;

      const artistsSpan = document.createElement('span');
      artistsSpan.classList.add('track-artists');
      artistsSpan.textContent = ` - ${track.artists.map(artist => artist.artistName).join(', ')}`;

      div.append(img, titleSpan, artistsSpan);
      div.addEventListener('click', () => handleSelect('track', track.id));
      trackSection.append(div);
    });

    searchResultsPopup.append(trackSection);
  }
  if (artists.length > 0) {
    const artistSection = document.createElement('div');
    artistSection.classList.add('result-section');
    const artistTitle = document.createElement('h3');
    artistTitle.textContent = 'Artists';
    artistSection.append(artistTitle);

    artists.forEach(artist => {
      const div = document.createElement('div');
      div.classList.add('result-item');

      const img = document.createElement('img');
      img.src = artist.artistImage;
      img.alt = 'Artist Image';

      const span = document.createElement('span');
      span.textContent = artist.artistKeyword;

      div.append(img, span);
      div.addEventListener('click', () => handleSelect('artist', artist.id));
      artistSection.append(div);
    });

    searchResultsPopup.append(artistSection);
  }

  Object.assign(searchResultsPopup.style, { display: (tracks.length > 0 || artists.length > 0) ? 'block' : 'none' });
}

async function searchTracks(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/track?q=${query}`);
    const data = await response.json();
    console.log('Track results:', data);
    return data.tracks;
  } catch (error) {
    console.error('Error fetching track results:', error);
    return [];
  }
}

async function searchArtists(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/artist?q=${query}`);
    const data = await response.json();
    console.log('Artist results:', data);
    return data.artists;
  } catch (error) {
    console.error('Error fetching artist results:', error);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.getElementById('search-bar');
  const searchResultsPopup = document.getElementById('search-results-popup');

  // 디바운싱 적용된 함수 생성
  const debouncedSearch = debounce(async query => {
    if (query) {
      console.log(`Searching for: ${query}`);
      const trackResults = await searchTracks(query);
      const artistResults = await searchArtists(query);
      console.log(trackResults, artistResults);
      const results = {
        tracks: trackResults,
        artists: artistResults,
      };
      console.log('Search results:', results);
      displaySearchResults(searchResultsPopup, results);
    } else {
      searchResultsPopup.style.display = 'none';
    }
  }, 300);

  searchBar.addEventListener('input', () => {
    const query = searchBar.value.trim();
    debouncedSearch(query);
  });
});
