import * as artistData from '../../mysql/artist.js';

// ok
export async function getRelatedArtists(req, res) {
  const { q } = req.query;
  const { isMobile } = req.useragent;
  const fields = isMobile ? ['id', 'artistKeyword'] : ['id', 'artistKeyword', 'artistImage'];
  const artists = await artistData.getRelatedArtists(q, fields);
  res.status(200).json({ artists });
}

// ok
export async function getArtistWithTrack(req, res) {
  const { id } = req.params;
  const artists = await artistData.getTrackWithArtist(id);
  const artist = artists.length > 0 ? artists.reduce((pre, cur) => {
    const {
      id: artistId, artistKeyword, debut, artistImage, // about artist
      trackId, titleKeyword, releaseDate, thumbnails, // about track
    } = cur;
    if (!pre.id) {
      Object.assign(pre, {
        id: artistId,
        artistKeyword,
        debut,
        artistImage,
        tracks: [],
      });
    }
    console.log(pre);
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
