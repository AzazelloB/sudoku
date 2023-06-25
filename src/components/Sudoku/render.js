import { colors } from '~/constants/theme';

import {
  cellsInColumn,
  cellsInRow,
} from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

export const draw = (ctx, dt, theme) => {
  const { width, height } = ctx.canvas;

  const cellWidth = width / cellsInRow;
  const cellHeight = height / cellsInColumn;

  drawGrid(ctx, theme, width, height, cellWidth, cellHeight);

  drawValues(ctx, theme, width, cellWidth, cellHeight);

  drawHighlightedCell(ctx, dt, theme, cellWidth, cellHeight);

  drawSelection(ctx, theme, cellWidth, cellHeight);
};

const drawGrid = (ctx, theme, width, height, cellWidth, cellHeight) => {
  ctx.fillStyle = colors.background[theme];
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = colors.background[theme === 'dark' ? 'light' : 'dark'];
  for (let i = 0; i < cellsInRow + 1; i += 1) {
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

  for (let i = 0; i < cellsInColumn + 1; i += 1) {
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
};

const drawValues = (ctx, theme, width, cellWidth, cellHeight) => {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = width / cellsInRow / 1.5;
  for (let i = 0; i < cellsInRow; i += 1) {
    for (let j = 0; j < cellsInColumn; j += 1) {
      const cell = state.cells[j * cellsInRow + i];

      const value = state.revealed ? cell.answer : cell.value;

      if (cell.revealed) {
        ctx.fillStyle = colors.background[theme === 'dark' ? 'light' : 'dark'];
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(
          cell.answer,
          i * cellWidth + cellWidth / 2,
          j * cellHeight + cellHeight / 2,
        );
      } else if (value) {
        ctx.fillStyle = colors.secondary[theme === 'dark' ? 'light' : 'dark'];
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(
          value,
          i * cellWidth + cellWidth / 2,
          j * cellHeight + cellHeight / 2,
        );
      } else {
        ctx.fillStyle = colors.secondary[theme === 'dark' ? 'light' : 'dark'];
        ctx.font = `${fontSize / 2.4}px Arial`;
        cell.corner.forEach((value, valueI) => {
          ctx.fillText(
            value,
            i * cellWidth + (cellWidth / 4) * (valueI % 2 === 0 ? 1 : 3),
            j * cellHeight + (cellHeight / 4) * (valueI < 2 ? 1 : 3),
          );
        });

        ctx.font = cell.middle.length > 4
          ? `${fontSize / (cell.middle.length / 2)}px Arial`
          : `${fontSize / 2.4}px Arial`;
        ctx.fillText(
          cell.middle.join(''),
          i * cellWidth + (cellWidth / 2),
          j * cellHeight + (cellHeight / 2),
        );
      }
    }
  }
};

const speed = 25;
const animatedHighlightedCell = {
  x: null,
  y: null,
};

const drawHighlightedCell = (ctx, dt, theme, cellWidth, cellHeight) => {
  if (state.highlightedCell) {
    animatedHighlightedCell.x += animatedHighlightedCell.x === null
      ? state.highlightedCell.x
      : (state.highlightedCell.x - animatedHighlightedCell.x) * speed * dt;
    animatedHighlightedCell.y += animatedHighlightedCell.y === null
      ? state.highlightedCell.y
      : (state.highlightedCell.y - animatedHighlightedCell.y) * speed * dt;

    ctx.fillStyle = colors.background[theme === 'dark' ? 'light' : 'dark'];
    ctx.globalAlpha = 0.2;
    ctx.fillRect(
      animatedHighlightedCell.x * cellWidth,
      animatedHighlightedCell.y * cellHeight,
      cellWidth,
      cellHeight,
    );
    ctx.globalAlpha = 1;
  } else {
    animatedHighlightedCell.x = null;
    animatedHighlightedCell.y = null;
  }
};

const drawSelection = (ctx, theme, cellWidth, cellHeight) => {
  const lineWidth = 5;

  ctx.strokeStyle = colors.secondary[theme === 'dark' ? 'light' : 'dark'];
  ctx.fillStyle = colors.background[theme === 'dark' ? 'light' : 'dark'];
  ctx.lineWidth = lineWidth;

  state.selectedCells.forEach((cell) => {
    ctx.strokeRect(
      cell.x * cellWidth + lineWidth / 2,
      cell.y * cellHeight + lineWidth / 2,
      cellWidth - lineWidth,
      cellHeight - lineWidth,
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
