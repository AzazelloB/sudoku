import { cellsInColumn, cellsInRow } from '~/components/Board/settings';
import { RuleType } from '~/constants/rules';

type Cells = (number | null)[];

export const isValidNormalSudoku: Validator = (meta, cells, number, index) => {
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

export const isValidKingsMove: Validator = (meta, cells, number, index) => {
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

export const isValidKnightsMove: Validator = (meta, cells, number, index) => {
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

export const isValidKillerSudoku: Validator = (meta, cells, number, index) => {
  const { cages } = meta;
  const col = index % cellsInRow;
  const row = Math.floor(index / cellsInRow);

  for (const cage of cages) {
    const cell = cage.path.find((c) => c.col === col && c.row === row);

    if (!cell) {
      continue;
    }

    const inCage = cage.path.find((c) => cells[c.col + c.row * cellsInColumn] === number);

    if (inCage) {
      return false;
    }
  }

  return true;
};

export const isValidThermo: Validator = (meta, cells, number, index) => {
  const { thermos } = meta;
  const col = index % cellsInRow;
  const row = Math.floor(index / cellsInRow);

  for (const thermo of thermos) {
    const indexInThermo = thermo.path.findIndex((c) => c.col === col && c.row === row);

    if (indexInThermo === -1) {
      continue;
    }

    if (number <= indexInThermo) {
      return false;
    }

    if (cellsInRow - number < thermo.path.length - indexInThermo) {
      return false;
    }

    for (let i = 0; i < thermo.path.length; i++) {
      if (i === indexInThermo) {
        continue;
      }

      const cell = thermo.path[i];
      const cellIndex = cell.col + cell.row * cellsInRow;
      const cellValue = cells[cellIndex];

      if (cellValue === null) {
        continue;
      }

      if (i < indexInThermo && cellValue >= number) {
        return false;
      }

      if (i > indexInThermo && cellValue <= number) {
        return false;
      }
    }
  }

  return true;
};

export const isValidArrowSum: Validator = (meta, cells, number, index) => {
  const { sumArrows } = meta;
  const col = index % cellsInRow;
  const row = Math.floor(index / cellsInRow);

  for (const arrow of sumArrows) {
    const indexOnArrow = arrow.path.findIndex((c) => c.col === col && c.row === row);

    if (indexOnArrow === -1) {
      continue;
    }

    const sum = arrow.path.slice(1).reduce((acc, cell) => {
      const cellIndex = cell.col + cell.row * cellsInRow;
      const cellValue = cells[cellIndex];

      if (cellValue === null) {
        return acc;
      }

      return acc + cellValue;
    }, 0);

    const isSumCell = indexOnArrow === 0;

    if (isSumCell) {
      if (sum > number) {
        return false;
      }

      const arrowFilled = arrow.path.slice(1).every((cell) => {
        const cellIndex = cell.col + cell.row * cellsInRow;
        const cellValue = cells[cellIndex];

        return cellValue !== null;
      });

      if (arrowFilled && sum !== number) {
        return false;
      }
    } else {
      const sumCell = arrow.path[0];
      const sumCellIndex = sumCell.col + sumCell.row * cellsInRow;
      const sumCellValue = cells[sumCellIndex];

      if (sumCellValue === null) {
        continue;
      }

      if (sumCellValue < number) {
        return false;
      }

      if (sum + number > sumCellValue) {
        return false;
      }

      const isLastCellOnArrow = arrow.path.slice(1).filter((cell) => {
        const cellIndex = cell.col + cell.row * cellsInRow;
        const cellValue = cells[cellIndex];

        return cellValue === null;
      }).length === 1;

      if (isLastCellOnArrow && sum + number !== sumCellValue) {
        return false;
      }
    }
  }

  return true;
};

type Validator = (meta: Meta, cells: Cells, number: number, index: number) => boolean

const ruleValidaroMap: Record<RuleType, Validator> = {
  [RuleType.NORMAL_SUDOKU]: isValidNormalSudoku,
  [RuleType.KINGS_MOVE]: isValidKingsMove,
  [RuleType.KNIGHTS_MOVE]: isValidKnightsMove,
  [RuleType.KILLER_SUDOKU]: isValidKillerSudoku,
  [RuleType.THERMO]: isValidThermo,
  [RuleType.SUM_ARROW]: isValidArrowSum,
};

export const isValid = (rules: RuleType[], meta: Meta, cells: Cells, number: number, index: number) => {
  for (const rule of rules) {
    if (!ruleValidaroMap[rule](meta, cells, number, index)) {
      return false;
    }
  }

  return true;
};
