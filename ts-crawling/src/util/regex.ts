/* eslint-disable no-useless-escape */
export default function extractMainKeyword(textOrTextArray: string | string[]): string | string[] {
  // 문자열 배열을 처리하는 경우
  if (Array.isArray(textOrTextArray)) {
    return textOrTextArray.map((item: string) => extractMainKeyword(item) as string); // 재귀 호출 시 string으로 강제 변환
  }
  let keyword = textOrTextArray.toLowerCase().replace(/\s*[\(\[-].*$/, '');
  if (keyword === '') {
    keyword = textOrTextArray.toLowerCase(); // 빈 문자열이면 소문자화된 원본 문자열 반환
  }
  return keyword.trim();
}
