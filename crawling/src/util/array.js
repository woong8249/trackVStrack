/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
export function removeDuplicates(Array) {
  const seen = new Set();
  const uniqueItems = [];

  for (const item of Array) {
    // 객체를 문자열로 변환하여 비교
    const itemString = JSON.stringify(item);
    if (!seen.has(itemString)) {
      seen.add(itemString);
      uniqueItems.push(item);
    }
  }
  return uniqueItems;
}
