import express from 'express';
import rateLimit from 'express-rate-limit';

import * as artist from '../controller/artist.js';
import * as validator from '../validator/index.js';

const router = express.Router();

// 테스트코드 필요
const getArtistLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: 'Too many requests from this IP, please try again after 10 minutes',
});

const getRelatedArtistsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200, //
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

router.get(
  '/:id',
  validator.validateParmId,
  getArtistLimiter,
  artist.getArtistWithDetail,
);

router.get(
  '/',
  validator.validateGetRelatedQueryOption,
  getRelatedArtistsLimiter,
  artist.getArtistsWithoutDetail,
);

export default router;
