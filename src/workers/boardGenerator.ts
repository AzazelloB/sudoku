/* eslint-disable no-param-reassign */
import { DifficultyLevel, difficultyLevels } from '~/constants/difficulty';
import { shuffleArray } from '~/utils/array';

import { cellsInColumn, cellsInRow } from '~/components/Board/settings';

type Cells = (number | null)[];

const isValid = (cells: Cells, number: number, index: number) => {
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

// expects an array filled with nulls only
const solve = (cells: Cells, i = 0) => {
  if (i === cells.length) {
    return true;
  }

  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (available.length) {
    const [value] = available.splice(
      Math.floor(Math.random() * available.length),
      1,
    );

    if (isValid(cells, value, i)) {
      cells[i] = value;

      if (solve(cells, i + 1)) {
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

const createSolutionCounter = () => {
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
        if (isValid(cells, num, i)) {
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

const mask = (cells: Cells, difficulty: DifficultyLevel): Cells => {
  try {
    const countSolutions = createSolutionCounter();

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
    return mask(cells, difficulty);
  }
};

export const onMessage = ({ data: { difficulty } }: { data: { difficulty: DifficultyLevel } }) => {
  const solved = new Array(cellsInRow * cellsInColumn).fill(null);
  solve(solved);

  const masked = mask(solved, difficulty);

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

onmessage = ({ data: { difficulty } }) => {
  const cells = onMessage({ data: { difficulty } });

  postMessage(cells);
};
