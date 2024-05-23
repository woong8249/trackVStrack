import express from 'express';
import rateLimit from 'express-rate-limit';

import * as trackController from '../controller/track.js';
import * as trackValidator from '../validator/track.js';

const router = express.Router();

// 테스트코드 필요
const getTrackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: 'Too many requests from this IP, please try again after 10 minutes',
});

const getRelatedTracksLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200, //
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

router.get('/:id', trackValidator.validateParmId, getTrackLimiter, trackController.getTrackWithArtist);
router.get('/',
  trackValidator.validateGetRelatedTracksQueryOption,
  getRelatedTracksLimiter,
  trackController.getRelatedTracks);

export default router;
