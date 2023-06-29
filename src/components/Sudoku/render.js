import { colors } from '~/constants/theme';

import {
  cellsInColumn,
  cellsInRow,
  scale,
} from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

export const draw = (ctx, dt, theme) => {
  if (state.cells.length === 0) {
    return;
  }

  const { width, height } = ctx.canvas;

  const cellWidth = width / cellsInRow;
  const cellHeight = height / cellsInColumn;

  drawBackground(ctx, theme, width, height);

  drawCellColors(ctx, cellWidth, cellHeight);

  drawGrid(ctx, theme, width, height, cellWidth, cellHeight);

  drawValues(ctx, theme, width, cellWidth, cellHeight);

  drawHighlightedCell(ctx, dt, theme, cellWidth, cellHeight);

  drawHighlightedRowColArea(ctx, dt, theme, cellWidth, cellHeight);

  drawSelection(ctx, theme, cellWidth, cellHeight);
};

const drawBackground = (ctx, theme, width, height) => {
  ctx.fillStyle = colors.background[theme];
  ctx.fillRect(0, 0, width, height);
};

const drawCellColors = (ctx, cellWidth, cellHeight) => {
  for (let i = 0; i < cellsInRow; i += 1) {
    for (let j = 0; j < cellsInColumn; j += 1) {
      const cell = state.cells[j * cellsInRow + i];

      if (cell.colors.length === 0) {
        continue;
      }

      const path = new Path2D();
      path.rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
      ctx.save();
      ctx.clip(path);

      for (let k = 0; k < cell.colors.length; k += 1) {
        const color = cell.colors[k];
        ctx.fillStyle = color;

        const x = i * cellWidth + cellWidth / 2;
        const y = j * cellHeight + cellHeight / 2;
        const radius = Math.max(cellWidth, cellHeight);
        const startAngle = (k / cell.colors.length) * Math.PI * 2 + Math.PI / 3;
        const endAngle = ((k + 1) / cell.colors.length) * Math.PI * 2 + Math.PI / 3;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.lineTo(x, y);
        ctx.fill();
        ctx.closePath();
      }

      ctx.restore();
    }
  }
};

const drawGrid = (ctx, theme, width, height, cellWidth, cellHeight) => {
  ctx.strokeStyle = colors.background[theme === 'dark' ? 'light' : 'dark'];
  for (let i = 0; i < cellsInRow + 1; i += 1) {
    if (i % 3 === 0) {
      ctx.lineWidth = 3 * scale;
      ctx.globalAlpha = 1;
    } else {
      ctx.lineWidth = 1 * scale;
      ctx.globalAlpha = 0.4;
    }

    ctx.beginPath();
    ctx.moveTo(i * cellWidth, 0);
    ctx.lineTo(i * cellWidth, width);
    ctx.stroke();
    ctx.closePath();
  }

  for (let i = 0; i < cellsInColumn + 1; i += 1) {
    if (i % 3 === 0) {
      ctx.lineWidth = 3 * scale;
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1 * scale;
    }

    ctx.beginPath();
    ctx.moveTo(0, i * cellHeight);
    ctx.lineTo(height, i * cellHeight);
    ctx.stroke();
    ctx.closePath();
  }

  ctx.globalAlpha = 1;
};

const drawValues = (ctx, theme, width, cellWidth, cellHeight) => {
  if (theme === 'dark') {
    ctx.shadowColor = colors.background.dark;
    ctx.shadowBlur = 15 * scale;
  }

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

  ctx.shadowBlur = 0;
};

const hightlightedCellSpeed = 25;
const animatedHighlightedCell = {
  x: null,
  y: null,
};

const drawHighlightedCell = (ctx, dt, theme, cellWidth, cellHeight) => {
  if (state.highlightedCell) {
    animatedHighlightedCell.x += animatedHighlightedCell.x === null
      ? state.highlightedCell.x
      : (state.highlightedCell.x - animatedHighlightedCell.x) * hightlightedCellSpeed * dt;
    animatedHighlightedCell.y += animatedHighlightedCell.y === null
      ? state.highlightedCell.y
      : (state.highlightedCell.y - animatedHighlightedCell.y) * hightlightedCellSpeed * dt;

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

const animatedArea = {
  x: null,
  y: null,
};

const drawHighlightedRowColArea = (ctx, dt, theme, cellWidth, cellHeight) => {
  if (animatedHighlightedCell.x !== null && animatedHighlightedCell.y !== null) {
    animatedArea.x += animatedArea.x === null
      ? Math.floor(state.highlightedCell.x / 3) * 3
      : (Math.floor(state.highlightedCell.x / 3) * 3 - animatedArea.x) * hightlightedCellSpeed * dt;
    animatedArea.y += animatedArea.y === null
      ? Math.floor(state.highlightedCell.y / 3) * 3
      : (Math.floor(state.highlightedCell.y / 3) * 3 - animatedArea.y) * hightlightedCellSpeed * dt;

    ctx.fillStyle = colors.background[theme === 'dark' ? 'light' : 'dark'];
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < cellsInRow; i += 1) {
      ctx.fillRect(
        i * cellWidth,
        animatedHighlightedCell.y * cellHeight,
        cellWidth,
        cellHeight,
      );
    }

    for (let i = 0; i < cellsInColumn; i += 1) {
      ctx.fillRect(
        animatedHighlightedCell.x * cellWidth,
        i * cellHeight,
        cellWidth,
        cellHeight,
      );
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(
          (animatedArea.x + i) * cellWidth,
          (animatedArea.y + j) * cellHeight,
          cellWidth,
          cellHeight,
        );
      }
    }

    ctx.globalAlpha = 1;
  }
};

const drawSelection = (ctx, theme, cellWidth, cellHeight) => {
  const lineWidth = 5 * scale;

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
