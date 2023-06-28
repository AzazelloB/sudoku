/* eslint-disable no-param-reassign */
import { difficultyLevels } from '~/constants/difficulty';

import { cellsInColumn, cellsInRow } from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

// import BoardGenerator from '~/workers/boardGenerator?worker';

// TODO factor out
const deepCopy = (array) => {
  return JSON.parse(JSON.stringify(array));
};

const isValid = (cells, number, index) => {
  const col = index % cellsInRow;
  const row = Math.floor(index / cellsInRow);

  // check row and col
  for (let i = 0; i < cellsInRow; i++) {
    const rowIndex = row * cellsInRow + i;
    const colIndex = col + i * cellsInRow;

    if (rowIndex !== index && cells[rowIndex].answer === number) {
      return false;
    }

    if (colIndex !== index && cells[colIndex].answer === number) {
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

      if (areaIndex !== index && cells[areaIndex].answer === number) {
        return false;
      }
    }
  }

  return true;
};

export const solve = (cells, i = 0) => {
  if (i === cells.length) {
    return true;
  }

  if (cells[i].answer !== null) {
    if (isValid(cells, cells[i].answer, i)) {
      if (solve(cells, i + 1)) {
        return true;
      }
    }

    return false;
  }

  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (available.length) {
    const [value] = available.splice(
      Math.floor(Math.random() * available.length),
      1,
    );

    if (isValid(cells, value, i)) {
      cells[i].answer = value;

      if (solve(cells, i + 1)) {
        return true;
      }
    }
  }

  cells[i].answer = null;
  return false;
};

const countSolutions = (cells, i = 0, count = 0) => {
  // stop at two since we use this function as a sudoku validator
  if (count > 1) {
    return count;
  }

  if (i === cells.length) {
    return 1 + count;
  }

  if (cells[i].answer !== null) {
    return countSolutions(cells, i + 1, count);
  }

  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (available.length) {
    const value = available.pop();

    if (isValid(cells, value, i)) {
      cells[i].answer = value;

      count = countSolutions(cells, i + 1, count);
    }
  }

  cells[i].answer = null;
  return count;
};

export const reveal = (cells, difficulty) => {
  const indexes = [...cells.keys()];
  const masked = deepCopy(cells);

  const max = masked.length - 1 - difficultyLevels[difficulty];
  for (let revealed = 0; revealed <= max;) {
    const randomIndexOfIndex = Math.floor(Math.random() * indexes.length);
    const [randomIndex] = indexes.slice(randomIndexOfIndex, randomIndexOfIndex + 1);

    if (masked[randomIndex].answer === null) {
      continue;
    }

    const value = masked[randomIndex].answer;

    masked[randomIndex].answer = null;

    if (countSolutions(deepCopy(masked)) === 1) {
      revealed++;
    } else {
      masked[randomIndex].answer = value;
    }
  }

  return masked;
};

// let worker;

export const generateGrid = async (difficulty) => {
  // return new Promise((resolve, reject) => {
  //   if (window.Worker) {
  //     worker = worker instanceof Worker ? worker : new BoardGenerator();

  //     worker.postMessage({
  //       difficulty,
  //     });

  //     worker.addEventListener('message', (message) => {
  //       state.cells = message.data;
  //       resolve();
  //     });
  //   } else {
  //     reject(new Error('No worker object'));
  //   }
  // });
  return new Promise((resolve) => {
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
        colors: [],
      });
    }

    solve(state.cells);

    const masked = reveal(state.cells, difficulty);

    for (let i = 0; i < cellsInRow * cellsInColumn; i += 1) {
      const cell = masked[i];

      if (cell.answer !== null) {
        state.cells[i].revealed = true;
      }
    }

    resolve();
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

export const selectCell = (cell) => {
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

export const deselectCell = (cell) => {
  const index = state.selectedCells.findIndex(
    (c) => c.x === cell.x && c.y === cell.y,
  );

  if (index === -1) {
    return;
  }

  state.selectedCells.splice(index, 1);
};

export const checkBoundaries = (x, y) => {
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

export const clearSelectedCells = () => {
  state.selectedCells.forEach((cell) => {
    const cellInGrid = state.cells[cell.y * cellsInRow + cell.x];

    cellInGrid.value = null;
    cellInGrid.corner.length = 0;
    cellInGrid.middle.length = 0;
  });
};

export const insertValue = (value) => {
  state.selectedCells.forEach((cell) => {
    state.cells[cell.y * cellsInRow + cell.x].value = value;
  });
};

export const insertCorner = (value) => {
  let areWeRemoving = null;

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

export const insertMiddle = (value) => {
  let areWeRemoving = null;

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

export const insertColor = (color) => {
  let areWeRemoving = null;

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
