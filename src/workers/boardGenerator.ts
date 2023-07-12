/* eslint-disable no-param-reassign */
import { DifficultyLevel, difficultyLevels } from '~/constants/difficulty';
import { RuleType } from '~/constants/rules';
import { shuffleArray } from '~/utils/array';

import { cellsInColumn, cellsInRow } from '~/components/Board/settings';

type Cells = (number | null)[];

const isValidNormalSudoku = (cells: Cells, number: number, index: number) => {
  const col = index % cellsInRow;
  const row = Math.floor(index / cellsInRow);

  // check row and col
  for (let i = 0; i < cellsInRow; i++) {
    const rowIndex = row * cellsInRow + i;
    const colIndex = col + i * cellsInRow;

    if (rowIndex !== index && cells[rowIndex] === number) {
      return false;
    }

    if (colIndex !== index && cells[colIndex] === number) {
      return false;
    }
  }

  // check sudoku area
  // assuming area is 3x3
  const areaStartRow = Math.floor(row / 3) * 3;
  const areaStartCol = Math.floor(col / 3) * 3;
  const areaEndRow = areaStartRow + 3;
  const areaEndCol = areaStartCol + 3;

  for (let i = areaStartRow; i < areaEndRow; i++) {
    for (let j = areaStartCol; j < areaEndCol; j++) {
      const areaIndex = i * cellsInRow + j;

      if (areaIndex !== index && cells[areaIndex] === number) {
        return false;
      }
    }
  }

  return true;
};

const isValidKingsMove = (cells: Cells, number: number, index: number) => {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const kingIndex = index + (i * cellsInRow) + j;

      if (kingIndex !== index && cells[kingIndex] === number) {
        return false;
      }
    }
  }

  return true;
};

const isValidKnightsMove = (cells: Cells, number: number, index: number) => {
  const col = index % cellsInRow;
  const row = Math.floor(index / cellsInRow);

  const moves = [
    { col: col - 2, row: row - 1 },
    { col: col - 2, row: row + 1 },
    { col: col - 1, row: row - 2 },
    { col: col - 1, row: row + 2 },
    { col: col + 1, row: row - 2 },
    { col: col + 1, row: row + 2 },
    { col: col + 2, row: row - 1 },
    { col: col + 2, row: row + 1 },
  ];

  for (const move of moves) {
    if (move.col >= 0 && move.col < cellsInRow && move.row >= 0 && move.row < cellsInRow) {
      const moveIndex = move.row * cellsInRow + move.col;

      if (cells[moveIndex] === number) {
        return false;
      }
    }
  }

  return true;
};

type Validator = (cells: Cells, number: number, index: number) => boolean

const ruleValidaroMap: Record<RuleType, Validator> = {
  [RuleType.NORMAL_SUDOKU]: isValidNormalSudoku,
  [RuleType.KINGS_MOVE]: isValidKingsMove,
  [RuleType.KNIGHTS_MOVE]: isValidKnightsMove,
};

const isValid = (rules: RuleType[], cells: Cells, number: number, index: number) => {
  for (const rule of rules) {
    if (!ruleValidaroMap[rule](cells, number, index)) {
      return false;
    }
  }

  return true;
};

// expects an array filled with nulls only
const solve = (rules: RuleType[], cells: Cells, i = 0) => {
  if (i === cells.length) {
    return true;
  }

  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (available.length) {
    const [value] = available.splice(
      Math.floor(Math.random() * available.length),
      1,
    );

    if (isValid(rules, cells, value, i)) {
      cells[i] = value;

      if (solve(rules, cells, i + 1)) {
        return true;
      }
    }
  }

  cells[i] = null;
  return false;
};

const getEmptyCellIndex = (cells: Cells) => {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === null) {
      return i;
    }
  }

  return null;
};

const createSolutionCounter = (rules: RuleType[]) => {
  let iter = 0;

  return function countSolutions(cells: Cells, count = 0) {
    iter++;

    if (iter > 100_000) {
      throw new Error('enough');
    }

    // stop at two since we use this function as a sudoku validator
    if (count > 1) {
      return count;
    }

    const i = getEmptyCellIndex(cells);

    if (i !== null) {
      for (let num = 1; num <= 9; num++) {
        if (isValid(rules, cells, num, i)) {
          cells[i] = num;
          count = countSolutions(cells, count);
          cells[i] = null;
        }
      }
    } else {
      count++;
    }

    return count;
  };
};

const mask = (cells: Cells, difficulty: DifficultyLevel, rules: RuleType[]): Cells => {
  try {
    const countSolutions = createSolutionCounter(rules);

    const masked = cells.slice();
    const indexes = [...masked.keys()];
    shuffleArray(indexes);

    const max = masked.length - 1 - difficultyLevels[difficulty];
    for (let maskedCount = 0; maskedCount <= max;) {
      const randomIndex = indexes.pop()!;

      const value = masked[randomIndex];

      masked[randomIndex] = null;

      if (countSolutions(masked.slice()) === 1) {
        maskedCount++;
      } else {
        masked[randomIndex] = value;
        indexes.unshift(randomIndex);
      }
    }

    return masked;
  } catch (e) {
    return mask(cells, difficulty, rules);
  }
};

type Params = {
  data: {
    difficulty: DifficultyLevel;
    rules: RuleType[];
  }
}

export const onMessage = ({ difficulty, rules }: Params['data']) => {
  const solved = new Array(cellsInRow * cellsInColumn).fill(null);
  solve(rules, solved);

  const masked = mask(solved, difficulty, rules);

  const cells: Cell[] = [];

  for (let i = 0; i < solved.length; i += 1) {
    cells.push({
      value: null,
      answer: solved[i],
      revealed: masked[i] !== null,
      corner: [],
      middle: [],
      col: i % cellsInRow,
      row: Math.floor(i / cellsInRow),
      colors: [],
    });
  }

  return cells;
};

onmessage = ({ data: { difficulty, rules } }: Params) => {
  const cells = onMessage({
    difficulty,
    rules,
  });

  postMessage(cells);
};
