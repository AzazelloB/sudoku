import { DifficultyLevel } from '~/constants/difficulty';

import { cellsInColumn, cellsInRow } from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

import BoardGenerator from '~/workers/boardGenerator?worker';

let worker: Worker;

export const generateGrid = async (difficulty: DifficultyLevel) => {
  return new Promise((resolve, reject) => {
    if (window.Worker) {
      worker = worker instanceof Worker ? worker : new BoardGenerator();

      worker.postMessage({
        difficulty,
      });

      worker.addEventListener('message', (message) => {
        state.cells = message.data;
        resolve(message.data);
      });
    } else {
      reject(new Error('No worker object'));
    }
  });
};

export const checkIfSolved = () => {
  for (let i = 0; i < state.cells.length; i += 1) {
    const cell = state.cells[i];

    if (cell.revealed) {
      continue;
    }

    if (cell.answer !== cell.value) {
      return false;
    }
  }

  return true;
};

export const selectCell = (cell: Point) => {
  if (state.selectedCells.find((c) => c.x === cell.x && c.y === cell.y)) {
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

export const deselectCell = (cell: Point) => {
  const index = state.selectedCells.findIndex(
    (c) => c.x === cell.x && c.y === cell.y,
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
    selectCell({ x: 0, y: 0 });
  }

  let currentCell = state.selectedCells[state.selectedCells.length - 1];

  let dx = 0;
  let dy = 0;

  switch (direction) {
    case 'up':
      if (ctrlPressed) {
        if (currentCell.y % 3 === 0) {
          dy = -3;
        } else {
          dy = -currentCell.y % 3;
        }
      } else {
        dy = -1;
      }
      break;

    case 'down':
      if (ctrlPressed) {
        if (currentCell.y % 3 === 2) {
          dy = 3;
        } else {
          dy = 3 - (currentCell.y % 3) - 1;
        }
      } else {
        dy = 1;
      }
      break;

    case 'left':
      if (ctrlPressed) {
        if (currentCell.x % 3 === 0) {
          dx = -3;
        } else {
          dx = -currentCell.x % 3;
        }
      } else {
        dx = -1;
      }
      break;

    case 'right':
      if (ctrlPressed) {
        if (currentCell.x % 3 === 2) {
          dx = 3;
        } else {
          dx = 3 - (currentCell.x % 3) - 1;
        }
      } else {
        dx = 1;
      }
      break;

    default:
      break;
  }

  const lastCell = { ...currentCell };

  if (checkBoundaries(currentCell.x + dx, currentCell.y + dy)) {
    currentCell = {
      x: currentCell.x + dx,
      y: currentCell.y + dy,
    };
  }

  if (shiftPressed) {
    const minX = Math.min(lastCell.x, currentCell.x);
    const maxX = Math.max(lastCell.x, currentCell.x);
    const minY = Math.min(lastCell.y, currentCell.y);
    const maxY = Math.max(lastCell.y, currentCell.y);

    if (dx < 0 || dy < 0) {
      for (let i = maxX; i >= minX; i -= 1) {
        for (let j = maxY; j >= minY; j -= 1) {
          selectCell({ x: i, y: j });
        }
      }
    } else {
      for (let i = minX; i <= maxX; i += 1) {
        for (let j = minY; j <= maxY; j += 1) {
          selectCell({ x: i, y: j });
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
    const cellInGrid = state.cells[cell.y * cellsInRow + cell.x];

    cellInGrid.value = null;
    cellInGrid.corner.length = 0;
    cellInGrid.middle.length = 0;
  });
};

export const insertValue = (value: number) => {
  state.selectedCells.forEach((cell) => {
    state.cells[cell.y * cellsInRow + cell.x].value = value;
  });
};

export const insertCorner = (value: number) => {
  let areWeRemoving: boolean | null = null;

  state.selectedCells.forEach((cell) => {
    const cellInGrid = state.cells[cell.y * cellsInRow + cell.x];

    if (areWeRemoving === null) {
      areWeRemoving = cellInGrid.corner.includes(value);
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
    const cellInGrid = state.cells[cell.y * cellsInRow + cell.x];

    if (areWeRemoving === null) {
      areWeRemoving = cellInGrid.middle.includes(value);
    }

    if (areWeRemoving) {
      cellInGrid.middle = cellInGrid.middle.filter((c) => c !== value);
    } else {
      cellInGrid.middle.push(value);
      cellInGrid.middle.sort();
    }
  });
};

export const insertColor = (color: string) => {
  let areWeRemoving: boolean | null = null;

  state.selectedCells.forEach((cell) => {
    const cellInGrid = state.cells[cell.y * cellsInRow + cell.x];

    if (areWeRemoving === null) {
      areWeRemoving = cellInGrid.colors.includes(color);
    }

    if (areWeRemoving) {
      cellInGrid.colors = cellInGrid.colors.filter((c) => c !== color);
    } else {
      cellInGrid.colors.push(color);
      cellInGrid.colors.sort();
    }
  });
};
