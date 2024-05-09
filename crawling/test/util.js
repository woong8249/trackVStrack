/**
 * Generates a range of dates within a specified period, starting randomly between given start and end dates.
 * @param {Date} start - The start date of the range within which to generate a random start date.
 * @param {Date} end - The end date of the range.
 * @param {number} period - The number of consecutive days for the date range.
 * @returns {{startDate:Date,endDate:Date}} An object containing the start and end dates of the randomly selected range.
 */
export function getRandomDateRange(start, end, period) {
  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime();
  const adjustedEndTimestamp = endTimestamp - (period - 1) * 24 * 60 * 60 * 1000;
  const randomStartTimestamp = Math.random() * (adjustedEndTimestamp - startTimestamp) + startTimestamp;
  const startDate = new Date(randomStartTimestamp);
  const endDate = new Date(randomStartTimestamp + (period - 1) * 24 * 60 * 60 * 1000);
  return { startDate, endDate };
}

/**
 * Moves a given date to the nearest future day of the week specified by the targetDay parameter.
 * This function creates a new Date object to avoid side effects on the original date.
 *
 * @param {Date} date - The original date from which to find the nearest future day.
 * @param {number} targetDay - The target day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
 * @returns {Date} A new Date object representing the nearest future date that matches the targetDay.
 */
export function moveToNearestFutureDay(date, targetDay) {
  // Create a copy of the date to avoid modifying the original date.
  const newDate = new Date(date.getTime());
  const currentDay = newDate.getDay();
  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Move to the next week's target day
  }
  newDate.setDate(newDate.getDate() + daysToAdd);
  return newDate;
}

export function checkForDuplicates(tracks, platform) {
  const uniqueCombinations = new Set();

  tracks.forEach(track => {
    if (track.platforms[platform]) {
      const key = `${track.titleKeyword}-${track.artistKeyword}`;
      uniqueCombinations.add(key);
    }
  });

  return uniqueCombinations.size === tracks.filter(track => track.platforms[platform]).length;
}

export function convertMultilineToJsonString(text) {
  const lines = text.split('\n');
  return lines.join('\\n');
}
