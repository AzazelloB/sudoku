/* eslint-disable import/no-extraneous-dependencies */
import { expect, it } from 'vitest';
import { RuleType } from '~/constants/rules';
import {
  TipType,
  checkMistakes,
  findEasyNakedSingle,
  findNakedSingle,
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

const board2 = [
  9, 2, null, null, null, null, null, null, 3,
  null, null, null, 2, 3, null, null, null, null,
  null, null, 6, null, 8, 7, 5, null, null,
  4, null, 1, 5, null, null, null, null, 8,
  6, 5, 9, 8, null, 3, null, 1, 4,
  2, 8, null, 4, 9, 1, 6, null, 5,
  8, null, null, null, null, 2, 4, null, null,
  null, null, 2, null, null, null, null, null, null,
  null, 6, null, 7, null, 8, 1, null, null,
];

const board3 = [
  9, 2, null, null, null, null, 2, null, 3,
  null, null, null, 2, 3, null, null, null, null,
  null, null, 6, null, 8, 7, 5, null, null,
  4, null, 1, 5, null, null, null, null, 8,
  6, 5, 9, 8, null, 3, null, 1, 4,
  2, 8, null, 4, 9, 1, 6, null, 5,
  8, null, null, null, null, 2, 4, null, null,
  null, null, 2, null, null, null, null, null, null,
  null, 6, null, 7, null, 8, 1, null, null,
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

const rules = [RuleType.NORMAL_SUDOKU];

it('tipper tests', async () => {
  expect(findEasyNakedSingle(rules, {} as Meta, board)).toEqual([{ col: 0, row: 3 }]);
  expect(onMessage({ cells: board, rules, meta: {} as Meta })).toEqual({
    type: TipType.EASY_NAKED_SINGLE,
    cells: [{ col: 0, row: 3 }],
  });

  expect(findNakedSingle(rules, {} as Meta, board2)).toEqual([{ col: 5, row: 3 }]);
  expect(onMessage({ cells: board2, rules, meta: {} as Meta })).toEqual({
    type: TipType.NAKED_SINGLE,
    cells: [{ col: 5, row: 3 }],
  });

  expect(checkMistakes(rules, {} as Meta, board3)).toEqual([
    { col: 1, row: 0 },
    { col: 6, row: 0 },
  ]);
  expect(onMessage({ cells: board3, rules, meta: {} as Meta })).toEqual({
    type: TipType.MISTAKE,
    cells: [
      { col: 1, row: 0 },
      { col: 6, row: 0 },
    ],
  });

  // has to be called forth or whatever max attemts is
  expect(onMessage({ cells: [], rules, meta: {} as Meta })).toEqual({
    type: TipType.TRY_THINKING,
    cells: [],
  });

  expect(isBoardFinished(rules, {} as Meta, board)).toBeNull();
  expect(isBoardFinished(rules, {} as Meta, solvedBoard)).toEqual([]);
  expect(onMessage({ cells: solvedBoard, rules, meta: {} as Meta })).toEqual({
    type: TipType.BOARD_FINISHED,
    cells: [],
  });
});
