import { resolve } from 'path';

import eslint from 'eslint/use-at-your-own-risk';

const overrideConfigFile = resolve('eslint.config.js');

export class ESLint extends eslint.FlatESLint {
  constructor(params) {
    Object.assign(params, { overrideConfigFile });
    super(params);
  }
}
