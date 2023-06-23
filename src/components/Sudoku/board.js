import { cellsInColumn, cellsInRow } from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

const populateSudoku = (i) => {
  if (i === state.cells.length) {
    return true;
  }

  const cell = state.cells[i];

  const avaliableValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (avaliableValues.length) {
    const value = avaliableValues.splice(
      Math.floor(Math.random() * avaliableValues.length),
      1,
    )[0];

    cell.answer = value;

    if (isValidSudoku()) {
      if (populateSudoku(i + 1)) {
        return true;
      }
    }
  }

  cell.answer = null;
  return false;
};

const isValidSudoku = () => {
  const rows = [];
  const columns = [];
  const squares = [];

  for (let i = 0; i < cellsInRow; i += 1) {
    rows.push([]);
    columns.push([]);
    squares.push([]);
  }

  for (let i = 0; i < state.cells.length; i += 1) {
    const cell = state.cells[i];

    if (cell.answer) {
      if (rows[cell.y].includes(cell.answer)) {
        return false;
      }

      rows[cell.y].push(cell.answer);

      if (columns[cell.x].includes(cell.answer)) {
        return false;
      }

      columns[cell.x].push(cell.answer);

      const squareIndex = Math.floor(cell.x / 3) + Math.floor(cell.y / 3) * 3;
      if (squares[squareIndex].includes(cell.answer)) {
        return false;
      }

      squares[squareIndex].push(cell.answer);
    }
  }

  return true;
};

export const generateGrid = () => {
  state.cells.length = 0;

  for (let i = 0; i < cellsInRow * cellsInColumn; i += 1) {
    state.cells.push({
      value: null,
      answer: null,
      revealed: false,
      corner: [],
      middle: [],
      x: i % cellsInRow,
      y: Math.floor(i / cellsInRow),
    });
  }

  populateSudoku(0);
};

const difficultyLevels = {
  easy: 38,
  normal: 30,
  hard: 23,
  expert: 17, // 17 is the minimum number of revealed cells for a sudoku to have a unique solution
};

export const revealCells = (difficulty) => {
  const revealedCells = [];

  while (revealedCells.length < difficultyLevels[difficulty]) {
    const cell = state.cells[
      Math.floor(Math.random() * state.cells.length)
    ];

    if (cell.revealed) {
      continue;
    }

    cell.revealed = true;

    if (!isValidSudoku()) {
      cell.revealed = false;
      continue;
    }

    revealedCells.push(cell);
  }
};

export const checkIfSolved = () => {
  for (let i = 0; i < state.cells.length; i += 1) {
    const cell = state.cells[i];

    if (cell.revealed) {
      continue;
    }

    if (cell.answer !== parseInt(cell.value, 10)) {
      return false;
    }
  }

  return true;
};

export const selectCell = (cell) => {
  if (state.selectedCells.find((c) => c.x === cell.x && c.y === cell.y)) {
    return;
  }

  state.selectedCells.push({ ...cell });
};

export const deselectCell = (cell) => {
  const index = state.selectedCells.findIndex(
    (c) => c.x === cell.x && c.y === cell.y,
  );

  if (index === -1) {
    return;
  }

  state.selectedCells.splice(index, 1);
};

const checkBoundaries = (x, y) => {
  if (x < 0 || x > cellsInRow - 1 || y < 0 || y > cellsInColumn - 1) {
    return false;
  }

  return true;
};

export const moveSelectedCell = (direction, shiftPressed, ctrlPressed) => {
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
