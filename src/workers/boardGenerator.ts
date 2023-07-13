/* eslint-disable no-param-reassign */
import { DifficultyLevel, difficultyLevels, ruleWeights } from '~/constants/difficulty';
import { RuleType } from '~/constants/rules';
import { isValid } from '~/utils/validation';
import { shuffleArray } from '~/utils/array';

import { cellsInColumn, cellsInRow } from '~/components/Board/settings';

type Cells = (number | null)[];

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
