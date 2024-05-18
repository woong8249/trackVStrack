import express from 'express';

import * as artist from '../controller/artist.js';
import * as validator from '../validator/index.js';

const router = express.Router();

router.get('/:id', validator.validateParmId, artist.getArtistWithTrack);
router.get('/', validator.validateQueryQ, artist.getRelatedArtists);

export default router;
