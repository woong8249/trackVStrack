import * as trackData from '../../mysql/track.js';

// ok
export async function getRelatedTracks(req, res) {
  const { q } = req.query;
  const { isMobile } = req.useragent;
  const fields = isMobile ? ['id', 'titleKeyword'] : ['id', 'titleKeyword', 'thumbnails'];
  const tracks = await trackData.getRelatedTracks(q, fields);
  const mappedTracks = tracks.length > 0 ? tracks.map(track => {
    const { id, titleKeyword, thumbnails } = track;
    const mapped = { id, titleKeyword, thumbnail: thumbnails[0] };
    return mapped;
  }) : tracks;
  res.status(200).json({ tracks: mappedTracks });
}

// ok
export async function getTrackWithArtist(req, res) {
  const { id } = req.params;
  const tracks = await trackData.getTrackWithArtist(id);
  const track = tracks.length > 0 ? tracks.reduce((pre, cur) => {
    const {
      id: trackID, titleKeyword, releaseDate, trackImages, platforms, lyrics, // about track
      artistId, artistKeyword, artistDebut, artistImage, // about artist
    } = cur;
    if (!pre.id) {
      Object.assign(pre, {
        id: trackID,
        titleKeyword,
        releaseDate,
        trackImage: trackImages[0],
        platforms,
        lyrics,
        artists: [],
      });
    }
    pre.artists.push({
      id: artistId,
      artistKeyword,
      artistImage,
      debut: artistDebut,
    });

    return pre;
  }, {}) : null;
  res.status(200).json({ track });
}
