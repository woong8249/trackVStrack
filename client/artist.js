// artist.js
/* eslint-disable no-undef */

const API_BASE_URL = 'http://localhost:3000';

async function getArtistById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/artist/${id}`);
    const data = await response.json();
    console.log('Artist details:', data);
    return data.artist;
  } catch (error) {
    console.error('Error fetching artist details:', error);
    return null;
  }
}

function displayArtistDetails(artist, artistDetails) {
  Object.assign(artistDetails, { innerHTML: '' });

  const artistInfo = document.createElement('div');
  artistInfo.classList.add('artist-info');

  const artistImage = document.createElement('img');
  artistImage.src = artist.artistImage;
  artistImage.alt = artist.artistKeyword;
  artistImage.classList.add('artist-image');

  const artistMeta = document.createElement('div');
  artistMeta.classList.add('artist-meta');

  const artistKeyword = document.createElement('h2');
  artistKeyword.textContent = artist.artistKeyword;

  const debut = document.createElement('p');
  debut.textContent = `Debut: ${artist.debut}`;

  artistMeta.appendChild(artistKeyword);
  artistMeta.appendChild(debut);
  artistInfo.appendChild(artistImage);
  artistInfo.appendChild(artistMeta);
  artistDetails.appendChild(artistInfo);
}

function displayArtistTracks(tracks, artistTracks) {
  Object.assign(artistTracks, { innerHTML: '' });

  const tracksHeader = document.createElement('h3');
  tracksHeader.textContent = 'Tracks';
  artistTracks.appendChild(tracksHeader);

  tracks.forEach(track => {
    const trackElement = document.createElement('a');
    trackElement.classList.add('track-item');
    trackElement.href = `track.html?id=${track.id}`; // 클릭 시 이동할 링크

    const trackThumbnail = document.createElement('img');
    trackThumbnail.src = track.thumbnail;
    trackThumbnail.alt = track.titleKeyword;
    trackThumbnail.classList.add('track-thumbnail');

    const trackMeta = document.createElement('div');
    trackMeta.classList.add('track-meta');

    const trackTitle = document.createElement('h4');
    trackTitle.textContent = track.titleKeyword;

    const releaseDate = document.createElement('p');
    releaseDate.textContent = `Release Date: ${new Date(track.releaseDate).toLocaleDateString()}`;

    trackMeta.appendChild(trackTitle);
    trackMeta.appendChild(releaseDate);
    trackElement.appendChild(trackThumbnail);
    trackElement.appendChild(trackMeta);
    artistTracks.appendChild(trackElement);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const artistDetails = document.getElementById('artist-details');
  const artistTracks = document.getElementById('artist-tracks');

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get('id');

  if (artistId) {
    const artist = await getArtistById(artistId);
    if (artist) {
      displayArtistDetails(artist, artistDetails);
      displayArtistTracks(artist.tracks, artistTracks);
    }
  }
});
