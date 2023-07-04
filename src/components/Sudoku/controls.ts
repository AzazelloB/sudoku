import { colors } from '~/constants/theme';

import {
  checkBoundaries,
  clearSelectedCells,
  deselectCell,
  insertColor,
  insertCorner,
  insertMiddle,
  insertValue,
  moveSelectedCell,
  selectAllCells,
  selectCell,
  selectSimilarCells,
} from '~/components/Sudoku/board';
import { handleRedo, handleUndo, saveSnapshot } from '~/components/Sudoku/history';
import {
  cellsInColumn, cellsInRow, scale,
} from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

// TODO add double click check
// on dbclick select all cells with same value current cell flickers
const handleMouseDown = (e: MouseEvent) => {
  state.mouseDown = true;

  if (state.highlightedCell === null) {
    return;
  }

  const selected = state.selectedCells.find(
    (c) => c.col === state.highlightedCell!.col
        && c.row === state.highlightedCell!.row,
  );

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

interface handleMouseMoveThis {
  canvas: HTMLCanvasElement;
}

function handleMouseMove(this: handleMouseMoveThis, e: MouseEvent) {
  const cellWidth = this.canvas.width / cellsInRow;
  const cellHeight = this.canvas.height / cellsInColumn;

  const rect = this.canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * scale;
  const y = (e.clientY - rect.top) * scale;

  const col = Math.floor(x / cellWidth);
  const row = Math.floor(y / cellHeight);

  if (state.highlightedCell && state.highlightedCell.col === col && state.highlightedCell.row === row) {
    return;
  }

  if (!checkBoundaries(col, row)) {
    return;
  }

  state.highlightedCell = {
    col,
    row,
  };

  if (state.mouseDown) {
    selectCell(state.highlightedCell);
  }
}

const handleMouseLeave = () => {
  state.highlightedCell = null;
  state.mouseDown = false;
};

const handleDoubleClick = () => {
  if (state.highlightedCell == null) {
    return;
  }

  const cell = state.cells.find(
    (c) => c.col === state.highlightedCell!.col
        && c.row === state.highlightedCell!.row,
  )!;

  selectSimilarCells(cell);
};

let pass = '';
let lastKeyTime = 0;

interface handleKeyboardDownThis {
  tool: Tool;
  mode: InsertionMode;
}

function handleKeyboardDown(this: handleKeyboardDownThis, e: KeyboardEvent) {
  const isNumber = e.keyCode >= 48 && e.keyCode <= 57;

  if (isNumber) {
    const number = parseInt(String.fromCharCode(e.keyCode), 10);

    if (this.tool === 'digits') {
      if (e.shiftKey || this.mode === 'normal') {
        insertValue(number);
      } else if (e.altKey || this.mode === 'corner') {
        e.preventDefault();

        insertCorner(number);
      } else {
        insertMiddle(number);
      }
    } else if (this.tool === 'colors') {
      insertColor(Object.values(colors.cell)[number - 1]);
    }

    saveSnapshot();

    return;
  }

  const ctrl = e.ctrlKey || e.metaKey;

  switch (e.code) {
    case 'Delete':
    case 'Backspace':
      clearSelectedCells();
      saveSnapshot();
      break;

    case 'ArrowUp':
      e.preventDefault();
      moveSelectedCell('up', e.shiftKey, ctrl);
      break;

    case 'ArrowDown':
      e.preventDefault();
      moveSelectedCell('down', e.shiftKey, ctrl);
      break;

    case 'ArrowLeft':
      e.preventDefault();
      moveSelectedCell('left', e.shiftKey, ctrl);
      break;

    case 'ArrowRight':
      e.preventDefault();
      moveSelectedCell('right', e.shiftKey, ctrl);
      break;

    case 'ShiftLeft':
    case 'ShiftRight': {
      const now = Date.now();

      if (now - lastKeyTime < 500) {
        const selectedCell = state.selectedCells[state.selectedCells.length - 1];
        const cell = state.cells.find(
          (c) => c.col === selectedCell.col
              && c.row === selectedCell.row,
        );

        if (cell) {
          selectSimilarCells(cell);
        }
      }

      lastKeyTime = now;
      break;
    }

    case 'KeyZ':
      if (ctrl) {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      break;

    case 'KeyA':
      if (ctrl) {
        e.preventDefault();

        selectAllCells();
      }
      break;

    case 'KeyD':
      state.debug = !state.debug;
      break;

    default:
      break;
  }

  switch (e.code) {
    case 'KeyH':
    case 'KeyE':
    case 'KeyL':
    case 'KeyP':
      pass += e.code[3];

      if (pass === 'HELP') {
        state.revealed = !state.revealed;
        pass = '';
      }
      break;

    default:
      pass = '';
      break;
  }
}

interface handleClickOutsideThis {
  canvas: HTMLCanvasElement;
  panel: HTMLElement;
}

function handleClickOutside(this: handleClickOutsideThis, e: MouseEvent) {
  if ((this.canvas && this.canvas.contains(e.target as Node))
   || (this.panel && this.panel.contains(e.target as Node))
  ) {
    return;
  }

  state.selectedCells.length = 0;
}

interface initControlsParams {
  canvas: HTMLCanvasElement;
  panel: HTMLElement;
  mode: InsertionMode;
  tool: Tool;
}

export const initControls = ({
  canvas,
  panel,
  mode,
  tool,
}: initControlsParams) => {
  const mouseMoveHandler = handleMouseMove.bind({ canvas });
  const keyboardDownHandler = handleKeyboardDown.bind({
    mode,
    tool,
  });
  const outiseClickHandler = handleClickOutside.bind({ canvas, panel });

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mousemove', mouseMoveHandler);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('dblclick', handleDoubleClick);

  document.addEventListener('keydown', keyboardDownHandler);
  document.addEventListener('mousedown', outiseClickHandler);

  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mousemove', mouseMoveHandler);
    canvas.removeEventListener('mouseleave', handleMouseLeave);
    canvas.removeEventListener('dblclick', handleDoubleClick);

    document.removeEventListener('keydown', keyboardDownHandler);
    document.removeEventListener('mousedown', outiseClickHandler);
  };
};
