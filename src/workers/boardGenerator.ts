/* eslint-disable no-param-reassign */
import { DifficultyLevel, difficultyLevels, ruleWeights } from '~/constants/difficulty';
import { RuleType } from '~/constants/rules';
import { isValid } from '~/utils/validation';
import { shuffleArray } from '~/utils/array';

import { cellsInColumn, cellsInRow } from '~/components/Board/settings';

type Cells = (number | null)[];

// expects an array filled with nulls only
const solve = (rules: RuleType[], meta: Meta, cells: Cells, i = 0) => {
  if (i === cells.length) {
    return true;
  }

  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (available.length) {
    const [value] = available.splice(
      Math.floor(Math.random() * available.length),
      1,
    );

    if (isValid(rules, meta, cells, value, i)) {
      cells[i] = value;

      if (solve(rules, meta, cells, i + 1)) {
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

const createSolutionCounter = (rules: RuleType[], meta: Meta) => {
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
        if (isValid(rules, meta, cells, num, i)) {
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

// optimization reference:
// https://en.wikipedia.org/wiki/Sudoku_solving_algorithms#Stochastic_search_/_optimization_methods
const mask = (cells: Cells, difficulty: DifficultyLevel, rules: RuleType[], meta: Meta): Cells => {
  try {
    const countSolutions = createSolutionCounter(rules, meta);

    const masked = cells.slice();
    const indexes = [...masked.keys()];

    shuffleArray(indexes);

    let maskedMax = masked.length - 1 - difficultyLevels[difficulty];

    for (const rule of rules) {
      maskedMax += ruleWeights[rule];
    }

    for (let maskedCount = 0; maskedCount <= maskedMax;) {
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
    return mask(cells, difficulty, rules, meta);
  }
};

const generateCages = () => {
  const cages: Cage[] = [];

  const cageSizeRange = {
    min: 2,
    max: 4,
  };
  const cageCountRange = {
    min: 3,
    max: 6,
  };

  const cageCount = Math.floor(Math.random() * (cageCountRange.max - cageCountRange.min + 1)) + cageCountRange.min;

  const occupiedCells: number[] = [];
  const freeCellIndexes = [...Array(cellsInColumn * cellsInRow).keys()];
  shuffleArray(freeCellIndexes);

  outer: for (let i = 0; i < cageCount; i++) {
    let iter = 0;

    const size = Math.floor(Math.random() * (cageSizeRange.max - cageSizeRange.min + 1)) + cageSizeRange.min;
    const path: CellPosition[] = [];

    const index = freeCellIndexes.pop()!;
    let col = index % cellsInColumn;
    let row = Math.floor(index / cellsInColumn);

    while (path.length < size) {
      iter++;

      if (iter > 100) {
        i--;
        continue outer;
      }

      const prevCol = col;
      const prevRow = row;

      if (Math.random() > 0.5) {
        const newCol = col + (Math.random() > 0.5 ? 1 : -1);
        const newIndex = newCol + row * cellsInColumn;

        if (newCol < 0 || newCol >= cellsInColumn) {
          continue;
        }

        if (occupiedCells.includes(newIndex)) {
          continue;
        }

        col = newCol;
      } else {
        const newRow = row + (Math.random() > 0.5 ? 1 : -1);
        const newIndex = col + newRow * cellsInColumn;

        if (newRow < 0 || newRow >= cellsInRow) {
          continue;
        }

        if (occupiedCells.includes(newIndex)) {
          continue;
        }

        row = newRow;
      }

      // the TipButton overlaps the sum clue for a cages that has a cell in the top left corner
      if (col === 0 && row === 0) {
        col = prevCol;
        row = prevRow;
        continue;
      }

      const newIndex = col + row * cellsInColumn;
      occupiedCells.push(newIndex);

      path.push({ col, row });
    }

    cages[i] = {
      size,
      path,
      total: 0,
    };
  }

  return cages;
};

const countTotals = (cages: Cage[], cells: Cell[]) => {
  for (const cage of cages) {
    cage.total = 0;

    for (const { col, row } of cage.path) {
      cage.total += cells[col + row * cellsInColumn].answer;
    }
  }
};

const generateMeta = (rules: RuleType[]): Meta => {
  const meta: any = {};

  for (const rule of rules) {
    switch (rule) {
      case RuleType.KILLER_SUDOKU:
        meta.cages = generateCages();
        break;

      default:
        break;
    }
  }

  return meta;
};

const updateMeta = (rules: RuleType[], meta: Meta, cells: Cell[]) => {
  const updatedMeta: any = { ...meta };

  for (const rule of rules) {
    switch (rule) {
      case RuleType.KILLER_SUDOKU:
        countTotals(updatedMeta.cages, cells);
        break;

      default:
        break;
    }
  }

  return updatedMeta;
};

interface Params {
  difficulty: DifficultyLevel;
  rules: RuleType[];
}

type Request = {
  data: string;
}

export const onMessage = ({ difficulty, rules }: Params) => {
  const meta = generateMeta(rules);

  const solved = new Array(cellsInRow * cellsInColumn).fill(null);
  solve(rules, meta, solved);

  const masked = mask(solved, difficulty, rules, meta);

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

  return {
    cells,
    meta: updateMeta(rules, meta, cells),
  };
};

onmessage = ({ data }: Request) => {
  postMessage(onMessage(JSON.parse(data)));
};
