// import fs from 'fs';
// import path from 'path';
// import createDataSource from '../src/typeorm/dataSource';
// // import { Track } from '../src/typeorm/entity/Track';
// import { checkSS } from '../src/service/insert';
// import { Artist } from '../src/typeorm/entity/Artist';

// const dataSource = await createDataSource();
// // const trackRepo = dataSource.getRepository(Track);
// const artistRepo = dataSource.getRepository(Artist);

// const artistKeywords:{artistKeyword:string}[] = await artistRepo
//   .createQueryBuilder('artist')
//   .select('artistKeyword')
//   .groupBy('artistKeyword')
//   .having('COUNT(artistKeyword) >= 2')
//   .getRawMany();

// const artists = await Promise.all(artistKeywords.map((artistKeyword) => artistRepo.find({ where: { artistKeyword: artistKeyword.artistKeyword } })));
// fs.writeFileSync(path.join(__dirname, 'sample.json'), JSON.stringify(artists));

// // SELECT trackKeyword, COUNT(*) AS count
// // FROM Track
// // GROUP BY trackKeyword
// // HAVING COUNT(*) >= 2

// // SELECT artistKeyword, COUNT(*) AS count
// // FROM Artist
// // GROUP BY artistKeyword
// // HAVING COUNT(*) >= 2
