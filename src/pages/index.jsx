import { createEffect, createSignal, onCleanup } from 'solid-js';

import { colors } from '~/constants/theme';
import { useGlobalContext } from '~/context/GlobalContext';

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

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
  const selectedCells = [];
  const cells = [];

  const updateAvaliable = (cell, value) => {
    // remove value from avaliable of cells in same row
    for (let i = 0; i < cellsInRow; i += 1) {
      const cellInRow = cells[i + cell.y * cellsInRow];
      if (cellInRow.avaliable.includes(value)) {
        cellInRow.avaliable.splice(cellInRow.avaliable.indexOf(value), 1);
      }
    }

    // remove value from avaliable of cells in same column
    for (let i = 0; i < cellsInColumn; i += 1) {
      const cellInColumn = cells[cell.x + i * cellsInRow];
      if (cellInColumn.avaliable.includes(value)) {
        cellInColumn.avaliable.splice(cellInColumn.avaliable.indexOf(value), 1);
      }
    }

    // remove value from avaliable of cells in same square
    const squareX = Math.floor(cell.x / 3);
    const squareY = Math.floor(cell.y / 3);
    for (let i = 0; i < 3; i += 1) {
      const cellInSquare = cells[
        (i + squareX * 3) + (squareY * 3) * cellsInRow
      ];
      if (cellInSquare.avaliable.includes(value)) {
        cellInSquare.avaliable.splice(cellInSquare.avaliable.indexOf(value), 1);
      }
    }
  };

  const generateGrid = async () => {
    for (let i = 0; i < cellsInRow * cellsInColumn; i += 1) {
      cells.push({
        value: null,
        corner: [],
        middle: [],
        avaliable: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        x: i % cellsInRow,
        y: Math.floor(i / cellsInRow),
      });
    }

    for (let i = 0; i < cellsInRow * cellsInColumn; i += 1) {
      const cell = cells[i];

      const randomIndex = Math.floor(Math.random() * cell.avaliable.length);
      const value = cell.avaliable[randomIndex];
      cell.avaliable.splice(randomIndex, 1);
      cell.value = value;

      // eslint-disable-next-line no-await-in-loop
      await sleep(150);

      updateAvaliable(cell, value);
    }
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

        if (cell.value) {
          ctx.font = '42px Arial';
          ctx.fillText(
            cell.value,
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

  const highlightCell = () => {
    if (!highlightedCell) {
      if (selectedCells.length > 0) {
        highlightedCell = {
          ...selectedCells[selectedCells.length - 1],
        };
      } else {
        highlightedCell = { x: 0, y: 0 };
      }
    }
  };

  const moveHighlightedCell = (direction, shiftPressed, ctrlPressed) => {
    if (shiftPressed) {
      selectCell(highlightedCell);
    } else {
      selectedCells.length = 0;
    }

    highlightCell();

    let dx = 0;
    let dy = 0;

    switch (direction) {
      case 'up':
        if (ctrlPressed) {
          if (highlightedCell.y % 3 === 0) {
            dy = -3;
          } else {
            dy = -highlightedCell.y % 3;
          }
        } else {
          dy = -1;
        }
        break;

      case 'down':
        if (ctrlPressed) {
          if (highlightedCell.y % 3 === 2) {
            dy = 3;
          } else {
            dy = 3 - (highlightedCell.y % 3) - 1;
          }
        } else {
          dy = 1;
        }
        break;

      case 'left':
        if (ctrlPressed) {
          if (highlightedCell.x % 3 === 0) {
            dx = -3;
          } else {
            dx = -highlightedCell.x % 3;
          }
        } else {
          dx = -1;
        }
        break;

      case 'right':
        if (ctrlPressed) {
          if (highlightedCell.x % 3 === 2) {
            dx = 3;
          } else {
            dx = 3 - (highlightedCell.x % 3) - 1;
          }
        } else {
          dx = 1;
        }
        break;

      default:
        break;
    }

    if (checkBoundaries(highlightedCell.x + dx, highlightedCell.y + dy)) {
      highlightedCell.x += dx;
      highlightedCell.y += dy;
    }

    if (shiftPressed) {
      selectCell(highlightedCell);
    } else {
      selectedCells.length = 0;
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
        moveHighlightedCell('up', e.shiftKey, e.ctrlKey);
        break;

      case 'ArrowDown':
        moveHighlightedCell('down', e.shiftKey, e.ctrlKey);
        break;

      case 'ArrowLeft':
        moveHighlightedCell('left', e.shiftKey, e.ctrlKey);
        break;

      case 'ArrowRight':
        moveHighlightedCell('right', e.shiftKey, e.ctrlKey);
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
