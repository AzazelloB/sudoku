/* eslint-disable import/no-extraneous-dependencies */
import {
  expect,
  it,
} from 'vitest';
import { onMessage } from '~/workers/boardGenerator';

it('board generator tests', async () => {
  const ts = Date.now();
  onMessage({ data: { difficulty: 'hard' } });

  expect(Date.now() - ts).toBeLessThan(8000);
});
