import { colors } from '~/constants/theme';

import {
  cellHeight,
  cellWidth,
  cellsInColumn,
  cellsInRow,
  height,
  width,
} from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

export const draw = (ctx, theme) => {
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

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < cellsInRow; i += 1) {
    for (let j = 0; j < cellsInColumn; j += 1) {
      const cell = state.cells[j * cellsInRow + i];

      const value = state.revealed ? cell.answer : cell.value;

      if (cell.revealed) {
        ctx.fillStyle = colors.background[theme === 'dark' ? 'light' : 'dark'];
        ctx.font = '42px Arial';
        ctx.fillText(
          cell.answer,
          i * cellWidth + cellWidth / 2,
          j * cellHeight + cellHeight / 2,
        );
      } else if (value) {
        ctx.fillStyle = colors.secondary[theme === 'dark' ? 'light' : 'dark'];
        ctx.font = '42px Arial';
        ctx.fillText(
          value,
          i * cellWidth + cellWidth / 2,
          j * cellHeight + cellHeight / 2,
        );
      } else {
        ctx.fillStyle = colors.secondary[theme === 'dark' ? 'light' : 'dark'];
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

  if (state.highlightedCell) {
    ctx.fillStyle = colors.background[theme === 'dark' ? 'light' : 'dark'];
    ctx.globalAlpha = 0.2;
    ctx.fillRect(
      state.highlightedCell.x * cellWidth,
      state.highlightedCell.y * cellHeight,
      cellWidth,
      cellHeight,
    );
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = colors.secondary[theme === 'dark' ? 'light' : 'dark'];
  ctx.fillStyle = colors.background[theme === 'dark' ? 'light' : 'dark'];
  state.selectedCells.forEach((cell) => {
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
