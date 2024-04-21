/* eslint-disable no-empty */
/* eslint-disable no-param-reassign */
export function parseJSONProperties(obj) {
  Object.keys(obj).forEach(key => {
    try {
      const parsed = JSON.parse(obj[key]);
      obj[key] = parsed;
    } catch (e) {}
  });
  return obj;
}

export function stringifyMembers(input) {
  if (Array.isArray(input)) {
    return input.map(item => Object.fromEntries(Object.entries(item)
      .map(([key, value]) => [key, typeof value !== 'string' ? JSON.stringify(value) : value])));
  }
  return Object.fromEntries(Object.entries(input)
    .map(([key, value]) => [key, typeof value !== 'string' ? JSON.stringify(value) : value]));
}
