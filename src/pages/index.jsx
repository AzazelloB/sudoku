import { createEffect, createSignal, onCleanup } from 'solid-js';

import { colors } from '~/constants/theme';
import { useGlobalContext } from '~/context/GlobalContext';

const HomePage = () => {
  const { theme } = useGlobalContext();

  const [insertCorner, setInsertCorner] = createSignal(false);

  let canvas;
  const width = 600;
  const height = 600;
  const cellsInRow = 9;
  const cellsInColumn = 9;
  const cellWidth = width / cellsInRow;
  const cellHeight = height / cellsInColumn;
  let highlightedCell = null;
  let mouseDown = false;
  let revealed = false;
  const selectedCells = [];
  const cells = [];

  const populateSudoku = (i) => {
    if (i === cells.length) {
      return true;
    }

    const cell = cells[i];

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

    for (let i = 0; i < cells.length; i += 1) {
      const cell = cells[i];

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

  const generateGrid = () => {
    for (let i = 0; i < cellsInRow * cellsInColumn; i += 1) {
      cells.push({
        value: null,
        answer: null,
        corner: [],
        middle: [],
        x: i % cellsInRow,
        y: Math.floor(i / cellsInRow),
      });
    }

    populateSudoku(0);
  };

  const draw = (ctx) => {
    ctx.fillStyle = colors.background[theme()];
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = colors.background[theme() === 'dark' ? 'light' : 'dark'];
    for (let i = 0; i < 10; i += 1) {
      if (i % 3 === 0) {
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1;
      }

      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, width);
      ctx.stroke();
      ctx.closePath();
    }

    for (let i = 0; i < 10; i += 1) {
      if (i % 3 === 0) {
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1;
      }

      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
      ctx.closePath();
    }

    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.secondary[theme() === 'dark' ? 'light' : 'dark'];
    for (let i = 0; i < cellsInRow; i += 1) {
      for (let j = 0; j < cellsInColumn; j += 1) {
        const cell = cells[j * cellsInRow + i];

        const value = revealed ? cell.answer : cell.value;

        if (value) {
          ctx.font = '42px Arial';
          ctx.fillText(
            value,
            i * cellWidth + cellWidth / 2,
            j * cellHeight + cellHeight / 2,
          );
        } else {
          ctx.font = '18px Arial';
          cell.corner.forEach((value, valueI) => {
            ctx.fillText(
              value,
              i * cellWidth + (cellWidth / 4) * (valueI % 2 === 0 ? 1 : 3),
              j * cellHeight + (cellHeight / 4) * (valueI < 2 ? 1 : 3),
            );
          });

          ctx.font = cell.middle.length > 4
            ? `${36 / (cell.middle.length / 2)}px Arial`
            : '18px Arial';
          ctx.fillText(
            cell.middle.join(''),
            i * cellWidth + (cellWidth / 2),
            j * cellHeight + (cellHeight / 2),
          );
        }
      }
    }

    if (highlightedCell) {
      ctx.fillStyle = colors.background[theme() === 'dark' ? 'light' : 'dark'];
      ctx.globalAlpha = 0.2;
      ctx.fillRect(
        highlightedCell.x * cellWidth,
        highlightedCell.y * cellHeight,
        cellWidth,
        cellHeight,
      );
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = colors.secondary[theme() === 'dark' ? 'light' : 'dark'];
    ctx.fillStyle = colors.background[theme() === 'dark' ? 'light' : 'dark'];
    selectedCells.forEach((cell) => {
      ctx.strokeRect(
        cell.x * cellWidth,
        cell.y * cellHeight,
        cellWidth,
        cellHeight,
      );
      ctx.globalAlpha = 0.2;
      ctx.fillRect(
        cell.x * cellWidth,
        cell.y * cellHeight,
        cellWidth,
        cellHeight,
      );
      ctx.globalAlpha = 1;
    });
  };

  const selectCell = (cell) => {
    if (selectedCells.find((c) => c.x === cell.x && c.y === cell.y)) {
      return;
    }

    selectedCells.push({ ...cell });
  };

  const checkBoundaries = (x, y) => {
    if (x < 0 || x > cellsInRow - 1 || y < 0 || y > cellsInColumn - 1) {
      return false;
    }

    return true;
  };

  const moveSelectedCell = (direction, shiftPressed, ctrlPressed) => {
    if (selectedCells.length === 0) {
      selectCell({ x: 0, y: 0 });
    }

    let currentCell = selectedCells[selectedCells.length - 1];

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
      selectedCells.length = 0;
      selectCell(currentCell);
    }
  };

  const handleMouseDown = (e) => {
    mouseDown = true;

    if (!e.ctrlKey) {
      selectedCells.length = 0;
    }

    selectCell(highlightedCell);
  };

  const handleMouseUp = () => {
    mouseDown = false;
  };

  const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellX = Math.floor(x / cellWidth);
    const cellY = Math.floor(y / cellHeight);

    highlightedCell = {
      x: cellX,
      y: cellY,
    };

    if (mouseDown) {
      selectCell(highlightedCell);
    }
  };

  const handleMouseLeave = () => {
    highlightedCell = null;
    mouseDown = false;
  };

  const handleMouseClick = (e) => {
    if (selectedCells.find((cell) => cell.x === highlightedCell.x && cell.y === highlightedCell.y)) {
      return;
    }

    if (e.ctrlKey) {
      selectedCells.push({ ...highlightedCell });
    } else {
      selectedCells.length = 0;
      selectedCells.push({ ...highlightedCell });
    }
  };

  const handleKeyboardDown = (e) => {
    const isLetter = e.keyCode >= 65 && e.keyCode <= 90;
    const isNumber = e.keyCode >= 48 && e.keyCode <= 57;

    if (isLetter || isNumber) {
      const symbol = String.fromCharCode(e.keyCode);

      if (e.shiftKey) {
        selectedCells.forEach((cell) => {
          cells[cell.y * cellsInRow + cell.x].value = symbol;
        });
      } else if (insertCorner()) {
        selectedCells.forEach((cell) => {
          const cellInGrid = cells[cell.y * cellsInRow + cell.x];

          if (cellInGrid.corner.includes(symbol)) {
            cellInGrid.corner = cellInGrid.corner.filter((c) => c !== symbol);
          } else {
            cellInGrid.corner.push(symbol);
            cellInGrid.corner.sort();
          }
        });
      } else {
        selectedCells.forEach((cell) => {
          const cellInGrid = cells[cell.y * cellsInRow + cell.x];

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
        selectedCells.forEach((cell) => {
          const cellInGrid = cells[cell.y * cellsInRow + cell.x];

          cellInGrid.value = null;
          cellInGrid.corner.length = 0;
          cellInGrid.middle.length = 0;
        });
        break;

      case 'ArrowUp':
        moveSelectedCell('up', e.shiftKey, e.ctrlKey);
        break;

      case 'ArrowDown':
        moveSelectedCell('down', e.shiftKey, e.ctrlKey);
        break;

      case 'ArrowLeft':
        moveSelectedCell('left', e.shiftKey, e.ctrlKey);
        break;

      case 'ArrowRight':
        moveSelectedCell('right', e.shiftKey, e.ctrlKey);
        break;

      case '/':
        revealed = !revealed;
        break;

      default:
        break;
    }
  };

  createEffect(() => {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    window.addEventListener('keydown', handleKeyboardDown);

    const ctx = canvas.getContext('2d');
    generateGrid();

    const gameLoop = () => {
      draw(ctx);

      window.requestAnimationFrame(gameLoop);
    };

    window.requestAnimationFrame(gameLoop);
  });

  onCleanup(() => {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('click', handleMouseClick);
    canvas.removeEventListener('mouseleave', handleMouseLeave);

    window.removeEventListener('keydown', handleKeyboardDown);
  });

  return (
    <canvas
      ref={canvas}
      width={width}
      height={height}
    />
  );
};

export default HomePage;
