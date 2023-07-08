import { cellsInColumn, cellsInRow } from '~/components/Board/settings';

export enum TipType {
  NOTHING,
  TRY_THINKING,
  MISTAKE,
  EASY_NAKED_SINGLE,
  NAKED_SINGLE,
  BOARD_FINISHED,
}

type Cell = number | null;
type Cells = Cell[];

let lastAttempt = Date.now();
let attempts = 0;

const checkAttempts = () => {
  const ts = Date.now();
  attempts++;

  if (attempts >= 4 && ts - lastAttempt < 5000) {
    attempts = 0;
    return [];
  }

  lastAttempt = ts;

  return null;
};

const checkMistakes = (cells: Cells) => {
  const seen = new Map();

  for (let i = 0; i < cellsInColumn; i++) {
    seen.clear();

    for (let j = 0; j < cellsInRow; j++) {
      const index = i + j * cellsInRow;

      if (cells[index] === null) {
        continue;
      }

      if (seen.has(cells[index])) {
        return [seen.get(cells[index]), { col: i, row: j }];
      }

      seen.set(cells[index], { col: i, row: j });
    }
  }

  for (let j = 0; j < cellsInRow; j++) {
    seen.clear();

    for (let i = 0; i < cellsInColumn; i++) {
      const index = i + j * cellsInColumn;

      if (cells[index] === null) {
        continue;
      }

      if (seen.has(cells[index])) {
        return [seen.get(cells[index]), { col: i, row: j }];
      }

      seen.set(cells[index], { col: i, row: j });
    }
  }

  for (let i = 0; i < cellsInColumn; i += 3) {
    for (let j = 0; j < cellsInRow; j += 3) {
      seen.clear();

      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          const col = i + k;
          const row = j + l;

          const index = col + row * cellsInRow;

          if (cells[index] === null) {
            continue;
          }

          if (seen.has(cells[index])) {
            return [seen.get(cells[index]), { col, row }];
          }

          seen.set(cells[index], { col, row });
        }
      }
    }
  }

  return null;
};

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

// TODO don't be a mega smooth brain and refactor isValidForEasyNakedSingle and isValid to be one function
// this one need to take row and col as arguments
// but rowIndex !== row check doesn't make sense so it check a cell against itself
const isValidForEasyNakedSingle = (cells: Cells, number: number, col: number, row: number) => {
  // check row and col
  for (let i = 0; i < cellsInRow; i++) {
    const rowIndex = row * cellsInRow + i;
    const colIndex = col + i * cellsInRow;

    if (rowIndex !== row && cells[rowIndex] === number) {
      return false;
    }

    if (colIndex !== col && cells[colIndex] === number) {
      return false;
    }
  }

  // check sudoku area
  // assuming area is 3x3
  const areaStartRow = Math.floor(row / 3) * 3;
  const areaStartCol = Math.floor(col / 3) * 3;
  const areaEndRow = areaStartRow + 3;
  const areaEndCol = areaStartCol + 3;

  const indexInCells = row * cellsInRow + col;

  for (let i = areaStartRow; i < areaEndRow; i++) {
    for (let j = areaStartCol; j < areaEndCol; j++) {
      const areaIndex = i * cellsInRow + j;

      if (areaIndex !== indexInCells && cells[areaIndex] === number) {
        return false;
      }
    }
  }

  return true;
};

export const findEasyNakedSingle = (cells: Cells): CellPosition[] | null => {
  for (let index = 0; index < cells.length; index++) {
    if (cells[index] !== null) {
      continue;
    }

    const col = index % cellsInColumn;
    const row = Math.floor(index / cellsInRow);

    const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const possible = [];

    // find avbaliable in an area
    avLoop: while (available.length) {
      const number = available.pop();

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
            continue avLoop;
          }
        }
      }

      possible.push(number!);
    }

    const avaliavleOnAxis = new Set<number>();

    for (let i = 0; i < cellsInColumn; i++) {
      const colIndex = col + i * cellsInRow;

      if (cells[colIndex] !== null) {
        continue;
      }

      for (const number of possible) {
        if (!isValidForEasyNakedSingle(cells, number, i, row)) {
          avaliavleOnAxis.add(number);
        }
      }
    }

    if (possible.filter(avaliavleOnAxis.has, avaliavleOnAxis).length === 1) {
      return [{ col, row }];
    }

    avaliavleOnAxis.clear();

    for (let i = 0; i < cellsInRow; i++) {
      const rowIndex = row * cellsInRow + i;

      if (cells[rowIndex] !== null) {
        continue;
      }

      for (const number of possible) {
        if (!isValidForEasyNakedSingle(cells, number, col, i)) {
          avaliavleOnAxis.add(number);
        }
      }
    }

    if (possible.filter(avaliavleOnAxis.has, avaliavleOnAxis).length === 1) {
      return [{ col, row }];
    }
  }

  return null;
};

const findNakedSingle = (cells: Cells): CellPosition[] | null => {
  for (let index = 0; index < cells.length; index++) {
    if (cells[index] !== null) {
      continue;
    }

    const col = index % cellsInColumn;
    const row = Math.floor(index / cellsInRow);

    const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const possible = [];

    avLoop: while (available.length) {
      const number = available.pop();

      // check row and col
      for (let i = 0; i < cellsInRow; i++) {
        const rowIndex = row * cellsInRow + i;
        const colIndex = col + i * cellsInRow;

        if (rowIndex !== index && cells[rowIndex] === number) {
          continue avLoop;
        }

        if (colIndex !== index && cells[colIndex] === number) {
          continue avLoop;
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
            continue avLoop;
          }
        }
      }

      possible.push(number);
    }

    if (possible.length === 1) {
      return [{ col, row }];
    }
  }

  return null;
};

export const isBoardFinished = (cells: Cells): CellPosition[] | null => {
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];

    if (cell === null) {
      return null;
    }

    if (!isValid(cells, cell, i)) {
      return null;
    }
  }

  return [];
};

type UsefullTips = Exclude<TipType, TipType.NOTHING>;
type TipFiner = (cells: Cells) => CellPosition[] | null;

const tipCallbackMap: Record<UsefullTips, TipFiner> = {
  [TipType.TRY_THINKING]: checkAttempts,
  [TipType.MISTAKE]: checkMistakes,
  [TipType.EASY_NAKED_SINGLE]: findEasyNakedSingle,
  [TipType.NAKED_SINGLE]: findNakedSingle,
  [TipType.BOARD_FINISHED]: isBoardFinished,
};

interface Result {
  type: TipType;
  cells: CellPosition[];
}

export const onMessage = ({ data: { cells } }: { data: { cells: Cells }}) => {
  const numericKeys: TipType[] = Object.keys(TipType).map((x) => parseInt(x, 10)).filter((x) => !Number.isNaN(x));

  for (const tip of numericKeys) {
    if (tip === TipType.NOTHING) {
      continue;
    }

    const result = tipCallbackMap[tip](cells);

    if (result) {
      return {
        type: tip,
        cells: result,
      } satisfies Result;
    }
  }

  return {
    type: TipType.NOTHING,
    cells: [],
  } satisfies Result;
};

onmessage = ({ data: { cells } }: { data: { cells: Cells }}) => {
  const response = onMessage({ data: { cells } });

  postMessage(JSON.stringify(response));
};
