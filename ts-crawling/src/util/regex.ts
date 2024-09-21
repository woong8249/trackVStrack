/* eslint-disable no-useless-escape */

export default function extractMainKeyword(textOrTextArray: string | string[]): string | string[] {
  // 문자열 배열을 처리하는 경우
  if (Array.isArray(textOrTextArray)) {
    return textOrTextArray.map((item: string) => extractMainKeyword(item) as string); // 재귀 호출 시 string으로 강제 변환
  }

  let keyword = textOrTextArray.replace(/\s*[\(\[-].*$/, '');

  if (keyword === '') {
    keyword = textOrTextArray;
  }

  return keyword.trim();
}
