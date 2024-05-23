import { param, query } from 'express-validator';

import validator, { isPositiveInteger } from './index.js';

export const validateGetRelatedTracksQueryOption = [
  query('q').notEmpty().withMessage('Please, provide query.'),
  query('limit').optional().custom(isPositiveInteger).withMessage('Please, provide a positive integer.'),
  query('offset').optional().custom(isPositiveInteger).withMessage('Please, provide a positive integer.'),
  query('event').optional().isIn(['search']).withMessage('Invalid value for event. Only "search" is allowed.'),
  validator,
];

export const validateParmId = [
  param('id').custom(isPositiveInteger).withMessage('Please, provide positiveInteger.'),
  validator,
];
