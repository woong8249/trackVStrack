import express from 'express';

import * as trackController from '../controller/track.js';
import * as validator from '../validator/index.js';

const router = express.Router();

router.get('/:id', validator.validateParmId, trackController.getTrackWithArtist);
router.get('/', validator.validateQueryQ, trackController.getRelatedTracks);

export default router;
