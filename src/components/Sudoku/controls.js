import { deselectCell, moveSelectedCell, selectCell } from '~/components/Sudoku/board';
import { cellHeight, cellWidth, cellsInRow } from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

const handleMouseDown = (e) => {
  state.mouseDown = true;

  const selected = state.selectedCells.find((c) => c.x === state.highlightedCell.x
                                                && c.y === state.highlightedCell.y);

  if (selected) {
    if (e.ctrlKey) {
      deselectCell(state.highlightedCell);
    } else if (state.selectedCells.length === 1) {
      state.selectedCells.length = 0;
    } else {
      state.selectedCells.length = 0;
      selectCell(state.highlightedCell);
    }
  } else {
    if (!e.ctrlKey) {
      state.selectedCells.length = 0;
    }

    selectCell(state.highlightedCell);
  }
};

const handleMouseUp = () => {
  state.mouseDown = false;
};

function handleMouseMove(e) {
  const rect = this.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const cellX = Math.floor(x / cellWidth);
  const cellY = Math.floor(y / cellHeight);

  state.highlightedCell = {
    x: cellX,
    y: cellY,
  };

  // TODO if you move mouse when trying to deselect, it will select again
  if (state.mouseDown) {
    selectCell(state.highlightedCell);
  }
}

const handleMouseLeave = () => {
  state.highlightedCell = null;
  state.mouseDown = false;
};

function handleKeyboardDown(e) {
  const isLetter = e.keyCode >= 65 && e.keyCode <= 90;
  const isNumber = e.keyCode >= 48 && e.keyCode <= 57;

  if (isLetter || isNumber) {
    const symbol = String.fromCharCode(e.keyCode);

    if (e.shiftKey) {
      state.selectedCells.forEach((cell) => {
        state.cells[cell.y * cellsInRow + cell.x].value = symbol;
      });
    } else if (e.altKey || this.mode === 'corner') {
      e.preventDefault();

      state.selectedCells.forEach((cell) => {
        const cellInGrid = state.cells[cell.y * cellsInRow + cell.x];

        if (cellInGrid.corner.includes(symbol)) {
          cellInGrid.corner = cellInGrid.corner.filter((c) => c !== symbol);
        } else {
          cellInGrid.corner.push(symbol);
          cellInGrid.corner.sort();
        }
      });
    } else {
      state.selectedCells.forEach((cell) => {
        const cellInGrid = state.cells[cell.y * cellsInRow + cell.x];

        if (cellInGrid.middle.includes(symbol)) {
          cellInGrid.middle = cellInGrid.middle.filter((c) => c !== symbol);
        } else {
          cellInGrid.middle.push(symbol);
          cellInGrid.middle.sort();
        }
      });
    }

    return;
  }

  switch (e.key) {
    case 'Delete':
    case 'Backspace':
      state.selectedCells.forEach((cell) => {
        const cellInGrid = state.cells[cell.y * cellsInRow + cell.x];

        cellInGrid.value = null;
        cellInGrid.corner.length = 0;
        cellInGrid.middle.length = 0;
      });
      break;

    case 'ArrowUp':
      e.preventDefault();
      moveSelectedCell('up', e.shiftKey, e.ctrlKey);
      break;

    case 'ArrowDown':
      e.preventDefault();
      moveSelectedCell('down', e.shiftKey, e.ctrlKey);
      break;

    case 'ArrowLeft':
      e.preventDefault();
      moveSelectedCell('left', e.shiftKey, e.ctrlKey);
      break;

    case 'ArrowRight':
      e.preventDefault();
      moveSelectedCell('right', e.shiftKey, e.ctrlKey);
      break;

    case '/':
      state.revealed = !state.revealed;
      break;

    default:
      break;
  }
}

function handleClickOutside(e) {
  if (!this.canvas || this.canvas.contains(e.target)) {
    return;
  }

  state.selectedCells.length = 0;
}

export const initControls = (canvas, mode) => {
  const mouseMoveHandler = handleMouseMove.bind({ canvas });
  const keyboardDownHandler = handleKeyboardDown.bind({ mode });
  const outiseClickHandler = handleClickOutside.bind({ canvas });

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mousemove', mouseMoveHandler);
  canvas.addEventListener('mouseleave', handleMouseLeave);

  document.addEventListener('keydown', keyboardDownHandler);
  document.addEventListener('mousedown', outiseClickHandler);

  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mousemove', mouseMoveHandler);
    canvas.removeEventListener('mouseleave', handleMouseLeave);

    document.removeEventListener('keydown', keyboardDownHandler);
    document.removeEventListener('mousedown', outiseClickHandler);
  };
};
