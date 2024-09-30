import {
  describe,
  expect, test,
} from 'vitest';
import { compareImages } from '../src/util/image';

const sameImageList = [
  ['https://image.bugsm.co.kr/artist/images/200/800696/80069634.jpg?version=20240810002131.0', 'https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/080/145/352/80145352_1723439966398_23_600x600.JPG'],
  ['https://image.bugsm.co.kr/artist/images/200/803473/80347326.jpg?version=20240525002108.0', 'https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/080/957/377/80957377_1716526524390_12_600x600.JPG'],
  ['https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/067/872/918/67872918_1709186664549_22_600x600.JPG', 'https://image.bugsm.co.kr/artist/images/200/800491/80049126.jpg?version=20240301002128.0'],
  ['https://image.bugsm.co.kr/artist/images/200/800291/80029124.jpg?version=20210910002109.0', 'https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/079/946/212/79946212_1631183208798_5_600x600.JPG'],
  ['https://image.bugsm.co.kr/artist/images/200/68/6886.jpg?version=20240223044547.0', 'https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/014/945/137/14945137_1708586411397_21_600x600.JPG'],
];

const diffImageList = [
  ['https://image.bugsm.co.kr/artist/images/200/800696/80069634.jpg?version=20240810002131.0', 'https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/080/957/377/80957377_1716526524390_12_600x600.JPG'],
  ['https://image.bugsm.co.kr/artist/images/200/803473/80347326.jpg?version=20240525002108.0', 'https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/080/145/352/80145352_1723439966398_23_600x600.JPG'],
  ['https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/067/872/918/67872918_1709186664549_22_600x600.JPG', 'https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/079/946/212/79946212_1631183208798_5_600x600.JPG'],
  ['https://image.bugsm.co.kr/artist/images/200/800291/80029124.jpg?version=20210910002109.0', 'https://image.bugsm.co.kr/artist/images/200/800491/80049126.jpg?version=20240301002128.0'],
];

describe('Test func compareImages', () => {
  test.each(sameImageList)('Compare two similar images. The raw MisMatch Percentage will be less than 20.', async (a, b) => {
    const rawMisMatchPercentage = await compareImages(a, b);
    expect(rawMisMatchPercentage < 20).toBe(true);
  });

  test.each(diffImageList)('Compares two dissimilar images. The raw MisMatch Percentage will be above 80.', async (a, b) => {
    const rawMisMatchPercentage = await compareImages(a, b);
    expect(rawMisMatchPercentage > 80).toBe(true);
  });
});
