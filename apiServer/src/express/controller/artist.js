import * as artistData from '../../mysql/artist.js';

// ok
export async function getRelatedArtists(req, res) {
  const {
    q, limit, offset, event,
  } = req.query;
  const { isMobile } = req.useragent;
  const options = {
    limit,
    offset,
    includeArtistInfo: !isMobile || event === 'search',
  };
  const artists = await artistData.getRelatedArtists(q, options);
  const mapped = artists.map(({
    id, debut, artistImage, artistNameMelon, artistNameGenie, artistNameBugs,
  }) => ({
    id, debut, artistImage, artistName: artistNameMelon || artistNameGenie || artistNameBugs,
  }));
  res.status(200).json({ artists: mapped });
}

// ok
export async function getArtistWithTrack(req, res) {
  const { id } = req.params;
  const artists = await artistData.getTrackWithArtist(id);
  const artist = artists.length > 0 ? artists.reduce((pre, cur) => {
    const {
      id: artistId, debut, artistImage, artistNameMelon, artistNameGenie, artistNameBugs, // about artist
      trackId, titleKeyword, releaseDate, thumbnails, // about track
    } = cur;
    if (!pre.id) {
      Object.assign(pre, {
        id: artistId,
        artistName: artistNameMelon || artistNameGenie || artistNameBugs,
        debut,
        artistImage,
        tracks: [],
      });
    }
    pre.tracks.push({
      id: trackId,
      titleKeyword,
      releaseDate,
      thumbnail: thumbnails[0],
    });
    return pre;
  }, {}) : null;
  res.status(200).json({ artist });
}
