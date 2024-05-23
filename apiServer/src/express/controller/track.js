import * as trackData from '../../mysql/track.js';
import winLogger from '../../util/winston.js';

function sortChartInfos(platforms) {
  const sortFunction = (a, b) => {
    if (a.weekOfMonth.year !== b.weekOfMonth.year) {
      return a.weekOfMonth.year - b.weekOfMonth.year;
    }
    if (a.weekOfMonth.month !== b.weekOfMonth.month) {
      return a.weekOfMonth.month - b.weekOfMonth.month;
    }
    return a.weekOfMonth.week - b.weekOfMonth.week;
  };
  const platformsToSort = Object.keys(platforms);
  const sortedPlatforms = {};
  platformsToSort.forEach(platform => {
    if (platforms[platform] && platforms[platform].chartInfos) {
      sortedPlatforms[platform] = {
        ...platforms[platform],
        chartInfos: [...platforms[platform].chartInfos].sort(sortFunction),
      };
    } else {
      sortedPlatforms[platform] = platforms[platform];
    }
  });
  return sortedPlatforms;
}

function formatTrack(track, includeArtistInfo) {
  const {
    trackId, trackThumbnails, artistId,
    artistNameMelon, artistNameGenie, artistNameBugs,
    trackTitleMelon, trackTitleGenie, trackTitleBugs,
  } = track;

  const titleName = trackTitleMelon || trackTitleGenie || trackTitleBugs;
  const artistName = artistNameMelon || artistNameGenie || artistNameBugs;

  const formattedTrack = {
    id: trackId,
    titleName,
    thumbnail: trackThumbnails ? trackThumbnails[0] : null,
  };

  if (includeArtistInfo) {
    formattedTrack.artists = [{
      id: artistId,
      artistName,
    }];
  }

  return formattedTrack;
}

// ok
export async function getRelatedTracks(req, res) {
  const {
    q, limit, offset, event,
  } = req.query;
  const { isMobile } = req.useragent;
  const options = {
    limit,
    offset,
    includeThumbnails: !isMobile,
    includeArtistInfo: !isMobile || event === 'search',
  };
  const tracks = await trackData.getRelatedTracks(q, options);
  if (tracks.length === 0) {
    return res.status(200).json({ tracks });
  }
  const reducedTracks = tracks.reduce((acc, track) => {
    const existingTrack = acc.find(t => t.id === track.trackId);
    if (existingTrack) {
      existingTrack.artists.push({
        id: track.artistId,
        artistName: track.artistNameMelon || track.artistNameGenie || track.artistNameBugs,
      });
    } else {
      acc.push(formatTrack(track, options.includeArtistInfo));
    }
    return acc;
  }, []);

  if (event !== 'search' && isMobile) {
    const minimalTracks = reducedTracks.map(track => ({
      id: track.id,
      titleKeyword: track.titleKeyword,
    }));
    return res.status(200).json({ tracks: minimalTracks });
  }

  return res.status(200).json({ tracks: reducedTracks });
}

// ok
export async function getTrackWithArtist(req, res) {
  const { id } = req.params;
  const tracks = await trackData.getTrackWithArtist(id);

  if (tracks.length === 0) {
    res.status(200).json({ track: tracks });
    return;
  }
  const track = tracks.reduce((pre, cur) => {
    const {
      id: trackID, trackTitleMelon, trackTitleGenie, trackTitleBugs,
      releaseDate, trackImages, platforms, lyrics,
      artistId, artistNameMelon, artistNameGenie, artistNameBugs,
      artistDebut, artistImage,
    } = cur;
    if (!pre.id) {
      Object.assign(pre, {
        id: trackID,
        titleName: trackTitleMelon || trackTitleGenie || trackTitleBugs,
        releaseDate,
        trackImage: trackImages[0],
        platforms: sortChartInfos(platforms),
        lyrics,
        artists: [],
      });
    }
    pre.artists.push({
      id: artistId,
      artistName: artistNameMelon || artistNameGenie || artistNameBugs,
      artistImage,
      debut: artistDebut,
    });

    return pre;
  }, {});

  res.status(200).json({ track });
}
