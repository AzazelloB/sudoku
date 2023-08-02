/* eslint-disable import/no-extraneous-dependencies */
import {
  expect,
  it,
} from 'vitest';
import {
  isValidNormalSudoku,
  isValidKingsMove,
  isValidKnightsMove,
  isValidKillerSudoku,
  isValidThermo,
  isValidArrowSum,
} from '~/utils/validation';

const normalSudokuBoard = [
  7, 4, 5, null, 6, 3, 9, 8, 2,
  null, null, 3, null, null, null, 4, null, null,
  2, 9, null, 5, null, 7, 1, null, null,
  null, null, 9, 6, 7, null, 8, null, 4,
  null, null, null, 2, null, null, null, null, null,
  8, null, 6, null, 1, 4, 7, null, 3,
  1, null, 2, null, null, null, 3, null, 9,
  9, null, null, 3, 2, null, null, 4, null,
  null, null, null, null, null, 9, null, 6, 1,
];

const kingsMoveBoard = [
  null, null, 5, 9, null, 3, null, null, null,
  null, null, null, 8, 2, null, null, null, null,
  null, 7, null, null, null, 4, null, null, null,
  null, null, 4, null, 3, null, 7, 5, null,
  null, null, null, 1, 7, null, 3, null, 4,
  null, null, null, null, 4, 5, null, null, 9,
  null, 5, null, null, 8, 6, null, null, null,
  8, null, null, null, 5, null, 9, 3, 1,
  7, null, 2, 4, 9, 1, 8, 6, 5,
];

const knightsMoveBoard = [
  null, 5, null, null, null, 9, 7, null, 1,
  9, null, 8, null, null, null, null, 2, null,
  2, null, null, null, null, 4, null, null, null,
  1, null, null, 2, null, null, 9, null, null,
  null, null, 7, 9, null, null, null, null, 2,
  null, 2, null, 1, 5, null, null, 4, 7,
  null, 8, null, 3, 6, null, 4, null, null,
  null, null, null, 4, 9, null, 2, null, null,
  4, null, null, null, null, null, 6, 3, 8,
];

const killerSudokuBoard = [
  null, 4, 7, 9, null, null, 6, null, null,
  5, null, null, 6, 3, null, null, 7, 4,
  null, 6, null, 4, null, null, 8, null, 3,
  1, 3, null, 8, 4, 2, null, null, 9,
  null, 2, null, 1, null, null, null, 3, null,
  null, null, null, null, 6, null, null, null, null,
  2, 1, null, 7, 9, null, 3, 6, null,
  6, 7, null, null, null, null, null, 9, 1,
  8, null, 3, 2, null, null, 5, null, 7,
];

const thermoBoard = [
  null, null, 4, 6, null, null, 9, 3, 7,
  6, 7, null, null, 1, null, null, null, null,
  null, 8, 5, 3, 7, null, null, null, null,
  null, null, 6, null, null, null, null, 9, 5,
  null, null, 9, null, 6, null, null, null, null,
  8, null, null, null, 9, null, null, 7, null,
  2, null, 7, null, 3, 6, 4, 5, 1,
  null, 6, null, 9, null, 5, null, 8, 3,
  null, null, null, null, null, null, 2, null, 9,
];

const sumArrowsBoard = [
  3, 6, 9, 1, null, null, null, 2, null,
  7, null, null, null, 2, 5, 3, 6, null,
  4, null, null, null, 3, null, null, 8, 9,
  8, 7, 3, 5, null, 1, null, 9, null,
  5, null, 2, 7, 6, 8, 4, 1, null,
  6, null, 4, null, 9, null, null, null, 5,
  null, null, null, 4, null, 6, null, null, null,
  null, null, 6, null, null, 3, 9, null, null,
  null, null, 7, null, null, null, 6, null, 8,
];

it('validation tests', async () => {
  expect(isValidNormalSudoku(
    meta,
    normalSudokuBoard,
    1,
    3,
  )).toBe(true);
  expect(isValidNormalSudoku(
    meta,
    normalSudokuBoard,
    2,
    3,
  )).toBe(false);

  expect(isValidKingsMove(
    meta,
    kingsMoveBoard,
    3,
    10,
  )).toBe(true);
  expect(isValidKingsMove(
    meta,
    kingsMoveBoard,
    5,
    10,
  )).toBe(false);

  expect(isValidKnightsMove(
    meta,
    knightsMoveBoard,
    1,
    12,
  )).toBe(true);
  expect(isValidKnightsMove(
    meta,
    knightsMoveBoard,
    5,
    12,
  )).toBe(false);

  expect(isValidKillerSudoku(
    meta,
    killerSudokuBoard,
    1,
    18,
  )).toBe(true);
  expect(isValidKillerSudoku(
    meta,
    killerSudokuBoard,
    6,
    18,
  )).toBe(false);

  expect(isValidThermo(
    meta,
    thermoBoard,
    1,
    27,
  )).toBe(true);
  expect(isValidThermo(
    meta,
    thermoBoard,
    9,
    27,
  )).toBe(false);

  expect(isValidArrowSum(
    meta,
    sumArrowsBoard,
    4,
    31,
  )).toBe(true);
  expect(isValidArrowSum(
    meta,
    sumArrowsBoard,
    6,
    31,
  )).toBe(false);
});

const meta = {
  cages: [
    {
      path: [
        {
          col: 3,
          row: 8,
        },
        {
          col: 3,
          row: 7,
        },
      ],
      total: 7,
    },
    {
      path: [
        {
          col: 5,
          row: 3,
        },
        {
          col: 4,
          row: 3,
        },
        {
          col: 4,
          row: 4,
        },
      ],
      total: 11,
    },
    {
      path: [
        {
          col: 8,
          row: 4,
        },
        {
          col: 8,
          row: 5,
        },
        {
          col: 8,
          row: 6,
        },
      ],
      total: 16,
    },
    {
      path: [
        {
          col: 2,
          row: 2,
        },
        {
          col: 1,
          row: 2,
        },
        {
          col: 0,
          row: 2,
        },
      ],
      total: 16,
    },
  ],
  thermos: [
    {
      path: [
        {
          col: 6,
          row: 5,
        },
        {
          col: 6,
          row: 6,
        },
        {
          col: 7,
          row: 6,
        },
      ],
    },
    {
      path: [
        {
          col: 0,
          row: 3,
        },
        {
          col: 1,
          row: 3,
        },
        {
          col: 1,
          row: 4,
        },
        {
          col: 0,
          row: 4,
        },
        {
          col: 0,
          row: 5,
        },
      ],
    },
    {
      path: [
        {
          col: 3,
          row: 4,
        },
        {
          col: 3,
          row: 3,
        },
        {
          col: 3,
          row: 2,
        },
        {
          col: 2,
          row: 2,
        },
        {
          col: 2,
          row: 3,
        },
      ],
    },
  ],
  sumArrows: [
    {
      path: [
        {
          col: 1,
          row: 4,
        },
        {
          col: 1,
          row: 5,
        },
        {
          col: 1,
          row: 6,
        },
        {
          col: 1,
          row: 7,
        },
      ],
    },
    {
      path: [
        {
          col: 7,
          row: 5,
        },
        {
          col: 8,
          row: 5,
        },
        {
          col: 8,
          row: 6,
        },
      ],
    },
    {
      path: [
        {
          col: 6,
          row: 5,
        },
        {
          col: 5,
          row: 5,
        },
        {
          col: 5,
          row: 6,
        },
      ],
    },
    {
      path: [
        {
          col: 7,
          row: 6,
        },
        {
          col: 7,
          row: 7,
        },
        {
          col: 8,
          row: 7,
        },
      ],
    },
    {
      path: [
        {
          col: 3,
          row: 3,
        },
        {
          col: 4,
          row: 3,
        },
        {
          col: 5,
          row: 3,
        },
      ],
    },
  ],
} as unknown as Meta;
