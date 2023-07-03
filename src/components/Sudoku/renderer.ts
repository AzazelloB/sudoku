import { colors } from '~/constants/theme';
import { lerp } from '~/utils/math';

import {
  cellsInColumn,
  cellsInRow,
  scale,
} from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

export class Renderer {
  static controlBoxPadding = 15;

  static controlSections = [
    {
      title: 'Movement',
      controls: [
        {
          shortcut: '⬆',
          description: 'Move one cell up',
        },
        {
          shortcut: '➡',
          description: 'Move one cell right',
        },
        {
          shortcut: '⬇',
          description: 'Move one cell down',
        },
        {
          shortcut: '⬅',
          description: 'Move one cell left',
        },
        {
          shortcut: 'Ctrl + ⬆➡⬇⬅',
          description: 'Move to the end of the row/column',
        },
      ],
    },
    {
      title: 'Selection',
      controls: [
        {
          shortcut: 'Shift + ⬆➡⬇⬅',
          description: 'Select multiple cells',
        },
      ],
    },
    {
      title: 'Number insertion',
      controls: [
        {
          shortcut: '<number>',
          description: 'Add note in the middle of the cell',
        },
        {
          shortcut: 'Alt + <number>',
          description: 'Add note in the corenr of the cell',
        },
        {
          shortcut: 'Shift + <number>',
          description: 'Insert number',
        },
      ],
    },
  ];

  static hightlightedCellSpeed = 25;

  ctx: CanvasRenderingContext2D;

  theme: Theme;

  width!: number;

  height!: number;

  cellWidth!: number;

  cellHeight!: number;

  animatedHighlightedCell: Point | null = null;

  animatedArea: Point | null = null;

  constructor(canvas: HTMLCanvasElement, theme: Theme) {
    const ctx = canvas.getContext('2d');

    this.ctx = ctx!;
    this.theme = theme;

    this.resize(canvas.width, canvas.height);
    this.setup();
  }

  setup() {
    // create offscreen canvas
  }

  draw(dt: number = 1) {
    // TODO maybe introduce pause to renderer and not check for cells.length
    if (state.cells.length === 0) {
      return;
    }

    if (state.showControls) {
      this.drawControlSchema();
    } else {
      this.drawBackground();
      
      this.drawCellColors();
      
      this.drawGrid();

      this.drawHighlightedCell(dt);

      this.drawHighlightedRowColArea(dt);

      this.drawSelection();

      this.drawValues();
    }

    if (state.debug) {
      this.drawFPS(dt);
    }
  }

  resize(width: number, height: number) {
    const cellWidth = width / cellsInRow | 0;
    const cellHeight = height / cellsInColumn | 0;

    this.width = width;
    this.height = height;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
  }

  setTheme(theme: Theme) {
    this.theme = theme;
  }

  drawControlSchema() {
    const boxX = Renderer.controlBoxPadding * scale;
    const boxY = Renderer.controlBoxPadding * scale;
    const boxWidth = this.width - Renderer.controlBoxPadding * 2 * scale;
    const boxHeight = this.width - Renderer.controlBoxPadding * 2 * scale;

    this.ctx.fillStyle = colors.background['dark-accent'];
    this.ctx.roundRect(
      boxX,
      boxY,
      boxWidth,
      boxHeight,
      [20 * scale],
    );
    this.ctx.fill();

    const fontSize = this.width / cellsInRow / 1.5;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${fontSize}px Arial`;

    const titleY = boxY + fontSize / 2 + 20 * scale;

    this.ctx.fillText(
      'Controls',
      boxWidth / 2 - fontSize * 1.5,
      titleY,
    );

    const sectionFontSize = fontSize * 0.6;
    const shortcutFontSize = fontSize * 0.4;

    let y = titleY + sectionFontSize * 2;

    for (let i = 0; i < Renderer.controlSections.length; i += 1) {
      const section = Renderer.controlSections[i];

      this.ctx.textAlign = 'left';
      this.ctx.font = `${sectionFontSize}px Arial`;
      this.ctx.fillText(
        section.title,
        boxX + 20 * scale,
        y | 0,
      );

      y += sectionFontSize + 10 * scale;

      for (let j = 0; j < section.controls.length; j += 1) {
        const control = section.controls[j];

        this.ctx.textAlign = 'left';
        this.ctx.font = `${shortcutFontSize}px Arial`;
        this.ctx.fillText(
          control.shortcut,
          boxX + 40 * scale,
          y | 0,
        );

        this.ctx.textAlign = 'right';
        this.ctx.font = `${shortcutFontSize}px Arial`;
        this.ctx.fillText(
          control.description,
          boxWidth,
          y | 0,
        );

        y += shortcutFontSize + 10 * scale;
      }

      y += sectionFontSize + 10 * scale;
    }
  }

  drawFPS(dt: number) {
    this.ctx.fillStyle = colors.background['dark-accent'];
    this.ctx.fillRect(0, 0, 55 * scale, 17 * scale);

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = colors.background.light;
    this.ctx.font = `${12 * scale}px Arial`;
    this.ctx.fillText(`FPS: ${Math.round(1 / dt)}`, 2 * scale, 10 * scale);
  }

  drawBackground() {
    this.ctx.clearRect(0, 0, this.width, this.height);
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
      // TODO big performance hit
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
            cell.answer.toString(),
            i * this.cellWidth + this.cellWidth / 2 | 0,
            j * this.cellHeight + this.cellHeight / 2 | 0,
          );
        } else if (value) {
          this.ctx.fillStyle = colors.secondary[this.theme === 'dark' ? 'light' : 'dark'];
          this.ctx.font = `${fontSize}px Arial`;
          this.ctx.fillText(
            value.toString(),
            i * this.cellWidth + this.cellWidth / 2 | 0,
            j * this.cellHeight + this.cellHeight / 2 | 0,
          );
        } else {
          this.ctx.fillStyle = colors.secondary[this.theme === 'dark' ? 'light' : 'dark'];
          this.ctx.font = `${fontSize / 2.4}px Arial`;
          cell.corner.forEach((value, valueI) => {
            this.ctx.fillText(
              value.toString(),
              i * this.cellWidth + (this.cellWidth / 4) * (valueI % 2 === 0 ? 1 : 3) | 0,
              j * this.cellHeight + (this.cellHeight / 4) * (valueI < 2 ? 1 : 3) | 0,
            );
          });

          this.ctx.font = cell.middle.length > 4
            ? `${fontSize / (cell.middle.length / 2)}px Arial`
            : `${fontSize / 2.4}px Arial`;
          this.ctx.fillText(
            cell.middle.join(''),
            i * this.cellWidth + (this.cellWidth / 2) | 0,
            j * this.cellHeight + (this.cellHeight / 2) | 0,
          );
        }
      }
    }

    // this.ctx.shadowBlur = 0;
  }

  drawHighlightedCell(dt:number) {
    if (state.highlightedCell) {
      const x = state.highlightedCell.col * this.cellWidth;
      const y = state.highlightedCell.row * this.cellHeight;

      if (this.animatedHighlightedCell === null) {
        this.animatedHighlightedCell = { x, y };
      } else {
        this.animatedHighlightedCell.x = lerp(this.animatedHighlightedCell.x, x, Renderer.hightlightedCellSpeed * dt);
        this.animatedHighlightedCell.y = lerp(this.animatedHighlightedCell.y, y, Renderer.hightlightedCellSpeed * dt);
      }

      this.ctx.fillStyle = colors.background[this.theme === 'dark' ? 'light' : 'dark'];
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillRect(
        this.animatedHighlightedCell.x | 0,
        this.animatedHighlightedCell.y | 0,
        this.cellWidth,
        this.cellHeight,
      );
      this.ctx.globalAlpha = 1;
    } else {
      this.animatedHighlightedCell = null;
    }
  }

  drawHighlightedRowColArea(dt: number) {
    if (state.highlightedCell !== null && this.animatedHighlightedCell !== null) {
      const x = Math.floor(state.highlightedCell.col / 3) * 3;
      const y = Math.floor(state.highlightedCell.row / 3) * 3;
      
      if (this.animatedArea === null) {
        this.animatedArea = { x, y };
      } else {
        this.animatedArea.x = lerp(this.animatedArea.x, x, Renderer.hightlightedCellSpeed * dt);
        this.animatedArea.y = lerp(this.animatedArea.y, y, Renderer.hightlightedCellSpeed * dt);
      }

      this.ctx.fillStyle = colors.background[this.theme === 'dark' ? 'light' : 'dark'];
      this.ctx.globalAlpha = 0.1;

      for (let i = 0; i < cellsInRow; i += 1) {
        this.ctx.fillRect(
          i * this.cellWidth,
          this.animatedHighlightedCell.y | 0,
          this.cellWidth,
          this.cellHeight,
        );
      }

      for (let i = 0; i < cellsInColumn; i += 1) {
        this.ctx.fillRect(
          this.animatedHighlightedCell.x | 0,
          i * this.cellHeight,
          this.cellWidth,
          this.cellHeight,
        );
      }

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          this.ctx.fillRect(
            (this.animatedArea.x + i) * this.cellWidth | 0,
            (this.animatedArea.y + j) * this.cellHeight | 0,
            this.cellWidth,
            this.cellHeight,
          );
        }
      }

      this.ctx.globalAlpha = 1;
    } else {
      this.animatedArea = null;
    }
  }

  drawSelection() {
    const lineWidth = 5 * scale;

    this.ctx.strokeStyle = colors.secondary[this.theme === 'dark' ? 'light' : 'dark'];
    this.ctx.fillStyle = colors.background[this.theme === 'dark' ? 'light' : 'dark'];
    this.ctx.lineWidth = lineWidth;

    state.selectedCells.forEach((cell) => {
      this.ctx.strokeRect(
        cell.col * this.cellWidth + lineWidth / 2,
        cell.row * this.cellHeight + lineWidth / 2,
        this.cellWidth - lineWidth,
        this.cellHeight - lineWidth,
      );
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillRect(
        cell.col * this.cellWidth,
        cell.row * this.cellHeight,
        this.cellWidth,
        this.cellHeight,
      );
      this.ctx.globalAlpha = 1;
    });
  }
}
