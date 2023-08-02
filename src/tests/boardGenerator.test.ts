/* eslint-disable import/no-extraneous-dependencies */
import {
  expect,
  it,
} from 'vitest';
import { RuleType } from '~/constants/rules';
import { onMessage } from '~/workers/boardGenerator';

it('board generator generation time tests', async () => {
  const ts = Date.now();
  onMessage({ difficulty: 'hard', rules: [RuleType.NORMAL_SUDOKU] });

  expect(Date.now() - ts).toBeLessThan(8000);
});
