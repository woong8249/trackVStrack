/* eslint-disable no-useless-escape */

export default function extractKeyword(text) {
  let keyword = text.replace(/\s*[\(\[-].*$/, '');
  if (keyword === '') {
    keyword = text;
  }
  return keyword;
}
