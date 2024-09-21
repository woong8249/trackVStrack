// 나중에 파일 삭제

// // const _ = require('lodash');

// // const array = [{ a: 1 }, { a: 1 }, { b: 2 }, 1, 1];

// export function removeDuplicates(Array:unknown[]) {
//   // 객체 배열을 기준으로 중복 제거
// // const result = _.uniqBy(array, JSON.stringify);
//   const seen = new Set();
//   const uniqueItems = [];

//   for (const item of Array) {
//     // 객체를 문자열로 변환하여 비교
//     const itemString = JSON.stringify(item);
//     if (!seen.has(itemString)) {
//       seen.add(itemString);
//       uniqueItems.push(item);
//     }
//   }
//   return uniqueItems;
// }

// export function arrayToChunk(array, size) {
//   // _.chunk(array, 2)

//   return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
// }
