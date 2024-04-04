function getJaccardIndexByWords(str1, str2) {
  const words1 = new Set(str1.toLowerCase().match(/\b\w+\b/g));
  const words2 = new Set(str2.toLowerCase().match(/\b\w+\b/g));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size; // Jaccard Index 계산
}

function integrateSongs(melon, genie) {
  const titleJaccardIndex = getJaccardIndexByWords(melon.title, genie.title);
  const artistJaccardIndex = getJaccardIndexByWords(melon.artist, genie.artist);

  console.log(`Title Jaccard Index: ${titleJaccardIndex}, Artist Jaccard Index: ${artistJaccardIndex}`);

  // 임계값 설정 (이 값은 조정이 가능합니다)
  const threshold = 0.5; // 단어 기반 유사도를 고려하여 임계값 조정

  if (titleJaccardIndex > threshold && artistJaccardIndex > threshold) {
    // 유사도가 임계값을 초과하는 경우, 같은 곡으로 간주하고 통합
    return {
      title: melon.title, // Melon의 타이틀을 기준으로 선택
      artist: melon.artist,
      melonRank: melon.rank,
      genieRank: genie.rank,
    };
  }
  console.log('The songs do not match.');
  return null;
}

const melon = { rank: '94', title: '벚꽃 엔딩(Cherry Blossom Ending)', artist: '버스커 버스커' };
const genie = { rank: '99', title: '벚꽃 엔딩', artist: '버스커 버스커 (Busker Busker)' };

const integratedSong = integrateSongs(melon, genie);
if (integratedSong) {
  console.log('Integrated Song:', integratedSong);
}
