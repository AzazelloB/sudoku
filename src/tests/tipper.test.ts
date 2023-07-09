/* eslint-disable import/no-extraneous-dependencies */
import { expect, it } from 'vitest';
import {
  TipType,
  findEasyNakedSingle,
  isBoardFinished,
  onMessage,
} from '~/workers/tipper';

const board = [
  8, 3, 1, 6, 4, 5, 2, 9, 7,
  9, null, null, 3, 1, 8, 4, null, 6,
  6, 5, 4, 7, 9, 2, 1, null, 8,
  null, 9, 5, 2, 6, null, 8, 1, null,
  7, null, null, 9, 5, 1, null, null, null,
  null, 1, null, null, null, 3, null, 7, 5,
  null, null, null, null, null, null, 7, 4, null,
  null, null, 3, null, 2, null, null, 6, null,
  5, null, null, 1, null, null, null, null, 9,
];

const solvedBoard = [
  8, 3, 1, 6, 4, 5, 2, 9, 7,
  9, 2, 7, 3, 1, 8, 4, 5, 6,
  6, 5, 4, 7, 9, 2, 1, 3, 8,
  3, 9, 5, 2, 6, 7, 8, 1, 4,
  7, 4, 8, 9, 5, 1, 6, 2, 3,
  2, 1, 6, 4, 8, 3, 9, 7, 5,
  1, 8, 9, 5, 3, 6, 7, 4, 2,
  4, 7, 3, 8, 2, 9, 5, 6, 1,
  5, 6, 2, 1, 7, 4, 3, 8, 9,
];

it('tipper tests', async () => {
  expect(findEasyNakedSingle(board)).toEqual([{ col: 0, row: 3 }]);
  expect(onMessage({ data: { cells: board } })).toEqual({
    type: TipType.EASY_NAKED_SINGLE,
    cells: [{ col: 0, row: 3 }],
  });

  expect(isBoardFinished(board)).toBeNull();
  expect(isBoardFinished(solvedBoard)).toEqual([]);
  expect(onMessage({ data: { cells: solvedBoard } })).toEqual({
    type: TipType.BOARD_FINISHED,
    cells: [],
  });
});
