import { cellsInColumn, cellsInRow } from '~/components/Sudoku/settings';

enum TipType {
  NOTHING,
  EASY_NAKED_SINGLE,
  NAKED_SINGLE,
}

type Cell = number | null;
type Cells = Cell[];

const isValid = (cells: Cells, number: number, col: number, row: number) => {
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

const findEasyNakedSingle = (cells: Cells): CellPosition[] | null => {
  for (let index = 0; index < cells.length; index++) {
    if (cells[index] !== null) {
      continue;
    }

    const col = index % cellsInColumn;
    const row = Math.floor(index / cellsInRow);

    const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const possible = [];

    // find avbaliable in an area
    av_loop: while (available.length) {
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
            continue av_loop;
          }
        }
      }

      possible.push(number!);
    }

    const avaliavleOnAxis = new Set<number>();

    for (let i = 0; i < cellsInColumn; i++) {
      const colIndex = col + i * cellsInRow;

      if (colIndex === index) {
        continue;
      }

      if (cells[colIndex] !== null) {
        continue;
      }

      for (const number of possible) {
        if (!isValid(cells, number, i, row)) {
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

      if (rowIndex === index) {
        continue;
      }

      if (cells[rowIndex] !== null) {
        continue;
      }

      for (const number of possible) {
        if (!isValid(cells, number, col, i)) {
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

    av_loop: while (available.length) {
      const number = available.pop();

      // check row and col
      for (let i = 0; i < cellsInRow; i++) {
        const rowIndex = row * cellsInRow + i;
        const colIndex = col + i * cellsInRow;

        if (rowIndex !== index && cells[rowIndex] === number) {
          continue av_loop;
        }

        if (colIndex !== index && cells[colIndex] === number) {
          continue av_loop;
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
            continue av_loop;
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

type UsefullTips = Exclude<TipType, TipType.NOTHING>;
type TipFiner = (cells: Cells) => CellPosition[] | null;

const tipCallbackMap: Record<UsefullTips, TipFiner> = {
  [TipType.EASY_NAKED_SINGLE]: findEasyNakedSingle,
  [TipType.NAKED_SINGLE]: findNakedSingle,
};

interface Result {
  type: TipType;
  cells: CellPosition[];
}

onmessage = ({ data: { cells } }: { data: { cells: Cells }}) => {
  const numericKeys: TipType[] = Object.keys(TipType).map(x => parseInt(x)).filter(x => !isNaN(x));
  
  for (const tip of numericKeys) {
    if (tip === TipType.NOTHING) {
      continue;
    }

    const result = tipCallbackMap[tip](cells);

    if (result) {
      postMessage(JSON.stringify({
        type: tip,
        cells: result,
      } satisfies Result));

      return;
    }
  }

  postMessage(JSON.stringify({
    type: TipType.NOTHING,
    cells: [],
  } satisfies Result));
};
