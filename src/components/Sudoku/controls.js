import { getNextTool } from '~/components/Sudoku/Panel';
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
} from '~/components/Sudoku/board';
import { handleRedo, handleUndo, saveSnapshot } from '~/components/Sudoku/history';
import {
  cellsInColumn, cellsInRow, scale,
} from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';
import { colors } from '~/constants/theme';

const handleMouseDown = (e) => {
  state.mouseDown = true;

  const selected = state.selectedCells.find(
    (c) => c.x === state.highlightedCell.x
        && c.y === state.highlightedCell.y,
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

function handleMouseMove(e) {
  const cellWidth = this.canvas.width / cellsInRow;
  const cellHeight = this.canvas.height / cellsInColumn;

  const rect = this.canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * scale;
  const y = (e.clientY - rect.top) * scale;

  const cellX = Math.floor(x / cellWidth);
  const cellY = Math.floor(y / cellHeight);

  if (state.highlightedCell && state.highlightedCell.x === cellX && state.highlightedCell.y === cellY) {
    return;
  }

  if (!checkBoundaries(cellX, cellY)) {
    return;
  }

  state.highlightedCell = {
    x: cellX,
    y: cellY,
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
  const cell = state.cells.find((c) => c.x === state.highlightedCell.x
                                    && c.y === state.highlightedCell.y);

  if (cell.revealed || (!cell.revealed && cell.value)) {
    const valueToLookFor = cell.revealed ? cell.answer : cell.value;

    for (let i = 0; i < state.cells.length; i += 1) {
      const c = state.cells[i];

      const valueToCompateTo = c.revealed ? c.answer : c.value;

      if (valueToCompateTo === valueToLookFor) {
        selectCell(c);
      }
    }
  } else if (cell.colors.length === 1) {
    const colorToLookFor = cell.colors[0];

    for (let i = 0; i < state.cells.length; i += 1) {
      const c = state.cells[i];

      if (c.colors.length === 1 && c.colors.includes(colorToLookFor)) {
        selectCell(c);
      }
    }
  }
};

function handleKeyboardDown(e) {
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

    case 'KeyZ':
      if (ctrl) {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else {
        this.setMode('normal');
      }
      break;

    case 'KeyX':
      this.setMode('middle');
      break;

    case 'KeyC':
      this.setMode('corner');
      break;

    case 'KeyM':
      this.setTool(getNextTool(this.tool));
      break;

    case 'KeyA':
      if (ctrl) {
        e.preventDefault();

        selectAllCells();
      }
      break;

    case 'Slash':
      state.revealed = !state.revealed;
      break;

    default:
      break;
  }
}

function handleClickOutside(e) {
  if ((this.canvas && this.canvas.contains(e.target))
   || (this.panel && this.panel.contains(e.target))
  ) {
    return;
  }

  state.selectedCells.length = 0;
}

export const initControls = ({
  canvas,
  panel,
  mode,
  setMode,
  tool,
  setTool,
}) => {
  const mouseMoveHandler = handleMouseMove.bind({ canvas });
  const keyboardDownHandler = handleKeyboardDown.bind({
    mode,
    setMode,
    tool,
    setTool,
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
