import { colors } from '~/constants/theme';

import {
  cellsInColumn,
  cellsInRow,
  scale,
} from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

export class Renderer {
  hightlightedCellSpeed = 25;

  animatedHighlightedCell = {
    x: null,
    y: null,
  };

  animatedArea = {
    x: null,
    y: null,
  };

  constructor(canvas, theme) {
    const ctx = canvas.getContext('2d');

    this.ctx = ctx;
    this.theme = theme;

    this.setup();
  }

  setup() {
    // create offscreen canvas
  }

  draw(dt) {
    this.updateDimensions();

    this.drawBackground();

    this.drawCellColors();

    this.drawGrid();

    this.drawValues();

    this.drawHighlightedCell(dt);

    this.drawHighlightedRowColArea(dt);

    this.drawSelection();
  }

  updateDimensions() {
    const { width, height } = this.ctx.canvas;

    const cellWidth = width / cellsInRow;
    const cellHeight = height / cellsInColumn;

    this.width = width;
    this.height = height;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
  }

  drawBackground() {
    this.ctx.fillStyle = colors.background[this.theme];
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawCellColors() {
    for (let i = 0; i < cellsInRow; i += 1) {
      for (let j = 0; j < cellsInColumn; j += 1) {
        const cell = state.cells[j * cellsInRow + i];

        if (cell.colors.length === 0) {
          continue;
        }

        const path = new Path2D();
        path.rect(i * this.cellWidth, j * this.cellHeight, this.cellWidth, this.cellHeight);
        this.ctx.save();
        this.ctx.clip(path);

        for (let k = 0; k < cell.colors.length; k += 1) {
          const color = cell.colors[k];
          this.ctx.fillStyle = color;

          const x = i * this.cellWidth + this.cellWidth / 2;
          const y = j * this.cellHeight + this.cellHeight / 2;
          const radius = Math.max(this.cellWidth, this.cellHeight);
          const startAngle = (k / cell.colors.length) * Math.PI * 2 + Math.PI / 3;
          const endAngle = ((k + 1) / cell.colors.length) * Math.PI * 2 + Math.PI / 3;

          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.arc(x, y, radius, startAngle, endAngle);
          this.ctx.lineTo(x, y);
          this.ctx.fill();
          this.ctx.closePath();
        }

        this.ctx.restore();
      }
    }
  }

  drawGrid() {
    this.ctx.strokeStyle = colors.background[this.theme === 'dark' ? 'light' : 'dark'];
    for (let i = 0; i < cellsInRow + 1; i += 1) {
      if (i % 3 === 0) {
        this.ctx.lineWidth = 3 * scale;
        this.ctx.globalAlpha = 1;
      } else {
        this.ctx.lineWidth = 1 * scale;
        this.ctx.globalAlpha = 0.4;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellWidth, 0);
      this.ctx.lineTo(i * this.cellWidth, this.width);
      this.ctx.stroke();
      this.ctx.closePath();
    }

    for (let i = 0; i < cellsInColumn + 1; i += 1) {
      if (i % 3 === 0) {
        this.ctx.lineWidth = 3 * scale;
        this.ctx.globalAlpha = 1;
      } else {
        this.ctx.globalAlpha = 0.4;
        this.ctx.lineWidth = 1 * scale;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellHeight);
      this.ctx.lineTo(this.height, i * this.cellHeight);
      this.ctx.stroke();
      this.ctx.closePath();
    }

    this.ctx.globalAlpha = 1;
  }

  drawValues() {
    if (this.theme === 'dark') {
      this.ctx.shadowColor = colors.background.dark;
      this.ctx.shadowBlur = 15 * scale;
    }

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const fontSize = this.width / cellsInRow / 1.5;
    for (let i = 0; i < cellsInRow; i += 1) {
      for (let j = 0; j < cellsInColumn; j += 1) {
        const cell = state.cells[j * cellsInRow + i];

        const value = state.revealed ? cell.answer : cell.value;

        if (cell.revealed) {
          this.ctx.fillStyle = colors.background[this.theme === 'dark' ? 'light' : 'dark'];
          this.ctx.font = `${fontSize}px Arial`;
          this.ctx.fillText(
            cell.answer,
            i * this.cellWidth + this.cellWidth / 2,
            j * this.cellHeight + this.cellHeight / 2,
          );
        } else if (value) {
          this.ctx.fillStyle = colors.secondary[this.theme === 'dark' ? 'light' : 'dark'];
          this.ctx.font = `${fontSize}px Arial`;
          this.ctx.fillText(
            value,
            i * this.cellWidth + this.cellWidth / 2,
            j * this.cellHeight + this.cellHeight / 2,
          );
        } else {
          this.ctx.fillStyle = colors.secondary[this.theme === 'dark' ? 'light' : 'dark'];
          this.ctx.font = `${fontSize / 2.4}px Arial`;
          cell.corner.forEach((value, valueI) => {
            this.ctx.fillText(
              value,
              i * this.cellWidth + (this.cellWidth / 4) * (valueI % 2 === 0 ? 1 : 3),
              j * this.cellHeight + (this.cellHeight / 4) * (valueI < 2 ? 1 : 3),
            );
          });

          this.ctx.font = cell.middle.length > 4
            ? `${fontSize / (cell.middle.length / 2)}px Arial`
            : `${fontSize / 2.4}px Arial`;
          this.ctx.fillText(
            cell.middle.join(''),
            i * this.cellWidth + (this.cellWidth / 2),
            j * this.cellHeight + (this.cellHeight / 2),
          );
        }
      }
    }

    this.ctx.shadowBlur = 0;
  }

  drawHighlightedCell(dt) {
    if (state.highlightedCell) {
      this.animatedHighlightedCell.x += this.animatedHighlightedCell.x === null
        ? state.highlightedCell.x
        : (state.highlightedCell.x - this.animatedHighlightedCell.x) * this.hightlightedCellSpeed * dt;
      this.animatedHighlightedCell.y += this.animatedHighlightedCell.y === null
        ? state.highlightedCell.y
        : (state.highlightedCell.y - this.animatedHighlightedCell.y) * this.hightlightedCellSpeed * dt;

      this.ctx.fillStyle = colors.background[this.theme === 'dark' ? 'light' : 'dark'];
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillRect(
        this.animatedHighlightedCell.x * this.cellWidth,
        this.animatedHighlightedCell.y * this.cellHeight,
        this.cellWidth,
        this.cellHeight,
      );
      this.ctx.globalAlpha = 1;
    } else {
      this.animatedHighlightedCell.x = null;
      this.animatedHighlightedCell.y = null;
    }
  }

  drawHighlightedRowColArea(dt) {
    if (this.animatedHighlightedCell.x !== null && this.animatedHighlightedCell.y !== null) {
      this.animatedArea.x += this.animatedArea.x === null
        ? Math.floor(state.highlightedCell.x / 3) * 3
        : (Math.floor(state.highlightedCell.x / 3) * 3 - this.animatedArea.x) * this.hightlightedCellSpeed * dt;
      this.animatedArea.y += this.animatedArea.y === null
        ? Math.floor(state.highlightedCell.y / 3) * 3
        : (Math.floor(state.highlightedCell.y / 3) * 3 - this.animatedArea.y) * this.hightlightedCellSpeed * dt;

      this.ctx.fillStyle = colors.background[this.theme === 'dark' ? 'light' : 'dark'];
      this.ctx.globalAlpha = 0.1;

      for (let i = 0; i < cellsInRow; i += 1) {
        this.ctx.fillRect(
          i * this.cellWidth,
          this.animatedHighlightedCell.y * this.cellHeight,
          this.cellWidth,
          this.cellHeight,
        );
      }

      for (let i = 0; i < cellsInColumn; i += 1) {
        this.ctx.fillRect(
          this.animatedHighlightedCell.x * this.cellWidth,
          i * this.cellHeight,
          this.cellWidth,
          this.cellHeight,
        );
      }

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          this.ctx.fillRect(
            (this.animatedArea.x + i) * this.cellWidth,
            (this.animatedArea.y + j) * this.cellHeight,
            this.cellWidth,
            this.cellHeight,
          );
        }
      }

      this.ctx.globalAlpha = 1;
    }
  }

  drawSelection() {
    const lineWidth = 5 * scale;

    this.ctx.strokeStyle = colors.secondary[this.theme === 'dark' ? 'light' : 'dark'];
    this.ctx.fillStyle = colors.background[this.theme === 'dark' ? 'light' : 'dark'];
    this.ctx.lineWidth = lineWidth;

    state.selectedCells.forEach((cell) => {
      this.ctx.strokeRect(
        cell.x * this.cellWidth + lineWidth / 2,
        cell.y * this.cellHeight + lineWidth / 2,
        this.cellWidth - lineWidth,
        this.cellHeight - lineWidth,
      );
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillRect(
        cell.x * this.cellWidth,
        cell.y * this.cellHeight,
        this.cellWidth,
        this.cellHeight,
      );
      this.ctx.globalAlpha = 1;
    });
  }
}
