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
} from '~/components/Board/board';
import { handleRedo, handleUndo, saveSnapshot } from '~/components/Board/history';
import {
  cellsInColumn, cellsInRow, scale,
} from '~/components/Board/settings';
import { state } from '~/components/Board/state';
import { onShortcut } from '~/utils/controls';

const handleMouseDown = (e: MouseEvent) => {
  if (state.highlightedCell === null) {
    return;
  }

  const selected = state.selectedCells.find(
    (c) => c.col === state.highlightedCell!.col
        && c.row === state.highlightedCell!.row,
  );
  const ctrl = e.ctrlKey || e.metaKey;

  if (selected && e.detail === 1) {
    if (ctrl) {
      deselectCell(state.highlightedCell);
    } else if (state.selectedCells.length === 1) {
      state.selectedCells.length = 0;
    } else {
      state.selectedCells.length = 0;
      selectCell(state.highlightedCell);
    }
  } else {
    if (!ctrl) {
      state.selectedCells.length = 0;
    }

    selectCell(state.highlightedCell);
  }
};

const handleTouchStart = () => {
  state.selectedCells.length = 0;
};

function handleMove(col: number, row: number, selecting: boolean) {
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

  if (selecting) {
    selectCell(state.highlightedCell);
  }
}

interface MouseMoveThis {
  canvas: HTMLCanvasElement;
}

function handleMouseMove(this: MouseMoveThis, e: MouseEvent) {
  const cellWidth = this.canvas.width / cellsInRow;
  const cellHeight = this.canvas.height / cellsInColumn;

  const rect = this.canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * scale;
  const y = (e.clientY - rect.top) * scale;

  const col = Math.floor(x / cellWidth);
  const row = Math.floor(y / cellHeight);

  handleMove(col, row, e.buttons === 1);
}

function handleTouchMove(this: MouseMoveThis, e: TouchEvent) {
  const cellWidth = this.canvas.width / cellsInRow;
  const cellHeight = this.canvas.height / cellsInColumn;

  const rect = this.canvas.getBoundingClientRect();
  const x = (e.touches[0].clientX - rect.left) * scale;
  const y = (e.touches[0].clientY - rect.top) * scale;

  const col = Math.floor(x / cellWidth);
  const row = Math.floor(y / cellHeight);

  handleMove(col, row, true);
}

const handleMouseLeave = () => {
  state.highlightedCell = null;
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

let lastKeyTime = 0;

interface KeyboardDownThis {
  tool: Tool;
  mode: InsertionMode;
}

function handleKeyboardDown(this: KeyboardDownThis, e: KeyboardEvent) {
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
      insertColor(number);
    }

    saveSnapshot();

    return;
  }

  onShortcut(e, () => {
    clearSelectedCells();
    saveSnapshot();
  }, {
    code: 'Delete',
  });

  onShortcut(e, () => {
    clearSelectedCells();
    saveSnapshot();
  }, {
    code: 'Backspace',
  });

  const onDoubleShift = () => {
    const now = Date.now();

    if (now - lastKeyTime < 500) {
      const selectedCell = state.selectedCells[state.selectedCells.length - 1];

      if (selectedCell) {
        const cell = state.cells.find(
          (c) => c.col === selectedCell.col
              && c.row === selectedCell.row,
        );

        if (cell) {
          selectSimilarCells(cell);
        }
      }
    }

    lastKeyTime = now;
  };

  onShortcut(e, onDoubleShift, {
    code: 'ShiftLeft',
  });

  onShortcut(e, onDoubleShift, {
    code: 'ShiftRight',
  });

  onShortcut(e, handleUndo, {
    code: 'KeyZ',
    ctrl: true,
  });

  onShortcut(e, handleRedo, {
    code: 'KeyZ',
    ctrl: true,
    shift: true,
  });

  onShortcut(e, selectAllCells, {
    code: 'KeyA',
    ctrl: true,
  });

  onShortcut(e, () => {
    state.debug = !state.debug;
  }, {
    code: 'KeyD',
  });

  const ctrl = e.ctrlKey || e.metaKey;

  switch (e.code) {
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

    default:
      break;
  }
}

interface ClickOutsideThis {
  canvas: HTMLCanvasElement;
  exceptions: (HTMLElement | null)[];
}

function handleClickOutside(this: ClickOutsideThis, e: MouseEvent) {
  if ((this.canvas && this.canvas.contains(e.target as Node))
   || this.exceptions.some((el) => el && el.contains(e.target as Node))
  ) {
    return;
  }

  if (state.selectedCells.length) {
    state.selectedCells.length = 0;
  }
}

interface initControlsParams {
  canvas: HTMLCanvasElement;
  mode: InsertionMode;
  tool: Tool;
  clickOutsideExceptions: (HTMLElement | null)[];
}

export const initControls = ({
  canvas,
  mode,
  tool,
  clickOutsideExceptions,
}: initControlsParams) => {
  const mouseMoveHandler = handleMouseMove.bind({ canvas });
  const touchMoveHandler = handleTouchMove.bind({ canvas });
  const keyboardDownHandler = handleKeyboardDown.bind({
    mode,
    tool,
  });
  const outiseClickHandler = handleClickOutside.bind({ canvas, exceptions: clickOutsideExceptions });

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', mouseMoveHandler);
  // passive promises bworser to not preventDefault. Do not disappoint it
  canvas.addEventListener('touchmove', touchMoveHandler, { passive: true });
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('dblclick', handleDoubleClick);

  document.addEventListener('keydown', keyboardDownHandler);
  document.addEventListener('mousedown', outiseClickHandler);

  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', mouseMoveHandler);
    canvas.removeEventListener('touchmove', touchMoveHandler);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('mouseleave', handleMouseLeave);
    canvas.removeEventListener('dblclick', handleDoubleClick);

    document.removeEventListener('keydown', keyboardDownHandler);
    document.removeEventListener('mousedown', outiseClickHandler);
  };
};
