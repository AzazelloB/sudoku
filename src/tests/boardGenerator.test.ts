/* eslint-disable import/no-extraneous-dependencies */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
// import { onMessage } from '~/workers/boardGenerator';

function executeAfterSeconds(seconds: number, func: CallableFunction) {
  setTimeout(func, 1000 * seconds);
}

const mock = vi.fn(() => console.log('executed'));

describe('board generator tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('test time of execution', async () => {
    executeAfterSeconds(10, mock);
    // TODO needs to be called as a worker in a separate thread
    // onMessage({ data: { difficulty: 'hard' } });

    vi.advanceTimersByTime(5000);

    expect(mock).not.toHaveBeenCalled();
  });
});
