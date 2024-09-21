// /* eslint-disable no-restricted-syntax */
// /* eslint-disable no-empty */
// /* eslint-disable no-param-reassign */
// import fs from 'fs';
// import path from 'path';

// export function parseJSONProperties(obj) {
//   Object.keys(obj).forEach(key => {
//     try {
//       const parsed = JSON.parse(obj[key]);
//       obj[key] = parsed;
//     } catch (e) {}
//   });
//   return obj;
// }

// export function stringifyMembers(input) {
//   if (Array.isArray(input)) {
//     return input.map(item => Object.fromEntries(Object.entries(item)
//       .map(([key, value]) => [key, typeof value !== 'string' ? JSON.stringify(value) : value])));
//   }
//   return Object.fromEntries(Object.entries(input)
//     .map(([key, value]) => [key, typeof value !== 'string' ? JSON.stringify(value) : value]));
// }

// export function loadJSONFiles(directoryPath) {
//   const files = fs.readdirSync(directoryPath);
//   const result = [];
//   for (const file of files) {
//     if (path.extname(file) === '.json') {
//       const filePath = path.join(directoryPath, file);
//       const data = fs.readFileSync(filePath, 'utf-8');
//       result.push(JSON.parse(data));
//     }
//   }
//   return result;
// }
