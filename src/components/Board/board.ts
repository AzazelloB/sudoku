import { DifficultyLevel } from '~/constants/difficulty';
import { RuleType } from '~/constants/rules';

import { cellsInColumn, cellsInRow } from '~/components/Board/settings';
import { state } from '~/components/Board/state';

import { delegateTaskTo } from '~/utils/humanResources';

export const generateGrid = async (difficulty: DifficultyLevel, rules: RuleType[]) => {
  const response: { meta: Meta, cells: Cell[] } = await delegateTaskTo('boardGenerator', {
    difficulty,
    rules,
  });

  state.meta = response.meta;
  state.cells = response.cells;
};

export const checkIfSolved = (cells: Cell[]) => {
  for (const cell of cells) {
    if (cell.revealed) {
      continue;
    }

    if (cell.answer !== cell.value) {
      return false;
    }
  }

  return true;
};

export const selectCell = (cell: CellPosition) => {
  if (state.selectedCells.find((c) => c.col === cell.col && c.row === cell.row)) {
    return;
  }

  state.selectedCells.push({ ...cell });
};

export const selectAllCells = () => {
  for (let i = 0; i < state.cells.length; i += 1) {
    const cell = state.cells[i];

    selectCell(cell);
  }
};

export const selectSimilarCells = (cell: Cell) => {
  if (cell.revealed || (!cell.revealed && cell.value)) {
    const valueToLookFor = cell.revealed ? cell.answer : cell.value;

    for (let i = 0; i < state.cells.length; i += 1) {
      const c = state.cells[i];

      const valueToCompateTo = c.revealed ? c.answer : c.value;

      if (valueToCompateTo === valueToLookFor) {
        selectCell(c);
      }
    }
  } else if (cell.colors.length > 0) {
    const colorsToLookFor = cell.colors.join('');

    for (let i = 0; i < state.cells.length; i += 1) {
      const c = state.cells[i];

      if (c.colors.join('') === colorsToLookFor) {
        selectCell(c);
      }
    }
  }

  // put current cell on top of the stack to move away from it first
  deselectCell(cell);
  selectCell(cell);
};

export const deselectCell = (cell: CellPosition) => {
  const index = state.selectedCells.findIndex(
    (c) => c.col === cell.col && c.row === cell.row,
  );

  if (index === -1) {
    return;
  }

  state.selectedCells.splice(index, 1);
};

export const checkBoundaries = (x: number, y: number) => {
  if (x < 0 || x > cellsInRow - 1 || y < 0 || y > cellsInColumn - 1) {
    return false;
  }

  return true;
};

type Direction = 'up' | 'down' | 'left' | 'right';

export const moveSelectedCell = (direction: Direction, shiftPressed: boolean, ctrlPressed: boolean) => {
  if (state.selectedCells.length === 0) {
    selectCell({ col: 0, row: 0 });
  }

  let currentCell = state.selectedCells[state.selectedCells.length - 1];

  let dx = 0;
  let dy = 0;

  switch (direction) {
    case 'up':
      if (ctrlPressed) {
        if (currentCell.row % 3 === 0) {
          dy = -3;
        } else {
          dy = -currentCell.row % 3;
        }
      } else {
        dy = -1;
      }
      break;

    case 'down':
      if (ctrlPressed) {
        if (currentCell.row % 3 === 2) {
          dy = 3;
        } else {
          dy = 3 - (currentCell.row % 3) - 1;
        }
      } else {
        dy = 1;
      }
      break;

    case 'left':
      if (ctrlPressed) {
        if (currentCell.col % 3 === 0) {
          dx = -3;
        } else {
          dx = -currentCell.col % 3;
        }
      } else {
        dx = -1;
      }
      break;

    case 'right':
      if (ctrlPressed) {
        if (currentCell.col % 3 === 2) {
          dx = 3;
        } else {
          dx = 3 - (currentCell.col % 3) - 1;
        }
      } else {
        dx = 1;
      }
      break;

    default:
      break;
  }

  const lastCell = { ...currentCell };

  if (checkBoundaries(currentCell.col + dx, currentCell.row + dy)) {
    currentCell = {
      col: currentCell.col + dx,
      row: currentCell.row + dy,
    };
  }

  if (shiftPressed) {
    const minX = Math.min(lastCell.col, currentCell.col);
    const maxX = Math.max(lastCell.col, currentCell.col);
    const minY = Math.min(lastCell.row, currentCell.row);
    const maxY = Math.max(lastCell.row, currentCell.row);

    if (dx < 0 || dy < 0) {
      for (let i = maxX; i >= minX; i -= 1) {
        for (let j = maxY; j >= minY; j -= 1) {
          selectCell({ col: i, row: j });
        }
      }
    } else {
      for (let i = minX; i <= maxX; i += 1) {
        for (let j = minY; j <= maxY; j += 1) {
          selectCell({ col: i, row: j });
        }
      }
    }
  } else {
    state.selectedCells.length = 0;
    selectCell(currentCell);
  }
};

export const clearSelectedCells = () => {
  state.selectedCells.forEach((cell) => {
    const cellInGrid = state.cells[cell.row * cellsInRow + cell.col];

    cellInGrid.value = null;
    cellInGrid.corner.length = 0;
    cellInGrid.middle.length = 0;
  });
};

export const insertValue = (value: number) => {
  state.selectedCells.forEach((cell) => {
    state.cells[cell.row * cellsInRow + cell.col].value = value;
  });
};

export const insertCorner = (value: number) => {
  let areWeRemoving: boolean | null = null;

  state.selectedCells.forEach((cell) => {
    const cellInGrid = state.cells[cell.row * cellsInRow + cell.col];

    if (areWeRemoving === null) {
      areWeRemoving = cellInGrid.corner.includes(value);
    }

    if (!areWeRemoving && cellInGrid.corner.includes(value)) {
      return;
    }

    if (areWeRemoving) {
      cellInGrid.corner = cellInGrid.corner.filter((c) => c !== value);
    } else {
      if (cellInGrid.corner.length === 4) {
        return;
      }

      cellInGrid.corner.push(value);
      cellInGrid.corner.sort();
    }
  });
};

export const insertMiddle = (value: number) => {
  let areWeRemoving: boolean | null = null;

  state.selectedCells.forEach((cell) => {
    const cellInGrid = state.cells[cell.row * cellsInRow + cell.col];

    if (areWeRemoving === null) {
      areWeRemoving = cellInGrid.middle.includes(value);
    }

    if (!areWeRemoving && cellInGrid.middle.includes(value)) {
      return;
    }

    if (areWeRemoving) {
      cellInGrid.middle = cellInGrid.middle.filter((c) => c !== value);
    } else {
      cellInGrid.middle.push(value);
      cellInGrid.middle.sort();
    }
  });
};

export const insertColor = (colorIndex: number) => {
  let areWeRemoving: boolean | null = null;

  state.selectedCells.forEach((cell) => {
    const cellInGrid = state.cells[cell.row * cellsInRow + cell.col];

    if (areWeRemoving === null) {
      areWeRemoving = cellInGrid.colors.includes(colorIndex);
    }

    if (!areWeRemoving && cellInGrid.colors.includes(colorIndex)) {
      return;
    }

    if (areWeRemoving) {
      cellInGrid.colors = cellInGrid.colors.filter((c) => c !== colorIndex);
    } else {
      cellInGrid.colors.push(colorIndex);
      cellInGrid.colors.sort();
    }
  });
};
