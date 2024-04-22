/* eslint-disable no-useless-escape */
export default function extractKeyword(textOrTextArray) {
  // 문자열 배열을 처리하는 경우
  if (Array.isArray(textOrTextArray)) {
    return textOrTextArray.map(item => extractKeyword(item));
  }
  let keyword = textOrTextArray.replace(/\s*[\(\[-].*$/, '');
  if (keyword === '') {
    keyword = textOrTextArray;
  }
  return keyword;
}
