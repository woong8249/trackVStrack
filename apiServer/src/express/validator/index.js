import { param, query, validationResult } from 'express-validator';

export default function validator(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const { msg } = errors.array()[0];
    const status = 400;
    return res.status(status).json({ message: msg });
  }
  return next();
}

export function isNumeric(item) {
  if (typeof item === 'number') {
    return true;
  }
  if (typeof item === 'string') {
    // eslint-disable-next-line no-restricted-globals
    return !isNaN(Number(item));
  }
  return false;
}

export function isPositiveInteger(item) {
  const number = Number(item);
  if (!Number.isInteger(number)) {
    return false;
  }
  if (number <= 0) {
    return false;
  }
  return true;
}

export const validateParmId = [
  param('id').custom(isNumeric).withMessage('Please, provide number type.'),
  param('id').custom(isPositiveInteger).withMessage('Please, provide positiveInteger.'),
  validator,
];

export const validateQueryQ = [
  query('q').isString().withMessage('Please, provide string type.'),
  query('q').notEmpty().withMessage('Please, provide query.'),
  validator,
];
