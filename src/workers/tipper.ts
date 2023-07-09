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

  // check sudoku box
  // assuming box is 3x3
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  const boxEndRow = boxStartRow + 3;
  const boxEndCol = boxStartCol + 3;

  for (let i = boxStartRow; i < boxEndRow; i++) {
    for (let j = boxStartCol; j < boxEndCol; j++) {
      const boxIndex = i * cellsInRow + j;

      if (boxIndex !== index && cells[boxIndex] === number) {
        return false;
      }
    }
  }

  return true;
};

export const findEasyNakedSingle = (cells: Cells): CellPosition[] | null => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const number of numbers) {
    const seenInCol: number[] = [];
    const seenInRow: number[] = [];

    for (let i = 0; i < cellsInColumn; i++) {
      for (let j = 0; j < cellsInRow; j++) {
        const index = i + j * cellsInColumn;

        if (cells[index] === number) {
          seenInCol.push(i);
          seenInRow.push(j);
        }
      }
    }

    const avaliableInCol = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !seenInCol.includes(i));
    const avaliableInRow = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !seenInRow.includes(i));
    const seenInBox = new Map();

    for (let i = 0; i < avaliableInCol.length; i++) {
      loop: for (let j = 0; j < avaliableInRow.length; j++) {
        const col = avaliableInCol[i];
        const row = avaliableInRow[j];
        const index = col + row * cellsInColumn;

        if (cells[index] !== null) {
          continue;
        }

        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;
        const boxEndRow = boxStartRow + 3;
        const boxEndCol = boxStartCol + 3;

        for (let i = boxStartRow; i < boxEndRow; i++) {
          for (let j = boxStartCol; j < boxEndCol; j++) {
            const boxIndex = i * cellsInRow + j;

            if (cells[boxIndex] === number) {
              continue loop;
            }
          }
        }

        const key = `${boxStartCol}x${boxStartRow}`;

        if (seenInBox.has(key)) {
          seenInBox.set(key, {
            count: seenInBox.get(key).count + 1,
            col,
            row,
          });
        } else {
          seenInBox.set(key, {
            count: 1,
            col,
            row,
          });
        }
      }
    }

    const boxWithOne = [...seenInBox.entries()].find(([, value]) => value.count === 1);

    if (boxWithOne) {
      const { col, row } = boxWithOne[1];
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

      // check sudoku box
      // assuming box is 3x3
      const boxStartRow = Math.floor(row / 3) * 3;
      const boxStartCol = Math.floor(col / 3) * 3;
      const boxEndRow = boxStartRow + 3;
      const boxEndCol = boxStartCol + 3;

      for (let i = boxStartRow; i < boxEndRow; i++) {
        for (let j = boxStartCol; j < boxEndCol; j++) {
          const boxIndex = i * cellsInRow + j;

          if (boxIndex !== index && cells[boxIndex] === number) {
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
