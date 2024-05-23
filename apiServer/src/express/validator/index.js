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
  param('id').custom(isPositiveInteger).withMessage('Please, provide positiveInteger.'),
  validator,
];

export const validateQueryQ = [
  query('q').notEmpty().withMessage('Please, provide query.'),
  validator,
];
