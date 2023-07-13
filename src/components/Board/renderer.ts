/* eslint-disable prefer-destructuring */
import { colors } from '~/constants/theme';
import { lerp } from '~/utils/math';

import {
  cellsInColumn,
  cellsInRow,
  scale,
} from '~/components/Board/settings';

export class Renderer {
  #renderQueue: CallableFunction[] = [];

  #renderFrame = 0;

  static fontFamily = 'Mitr, Arial';

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
        {
          shortcut: 'Double Shift',
          description: 'Select similar cells',
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

  #theme?: Theme;

  #width = 0;

  #height = 0;

  #cellWidth = 0;

  #cellHeight = 0;

  static hightlightedCellSpeed = 25;

  animatedHighlightedCell: Point | null = null;

  animatedArea: Point | null = null;

  static flyInSpeed = 10;

  flyInCells: (CellPosition & Point)[] = [];

  flyInCallback: CallableFunction | null = null;

  resize(width: number, height: number) {
    const cellWidth = width / cellsInRow;
    const cellHeight = height / cellsInColumn;

    this.#width = width;
    this.#height = height;
    this.#cellWidth = cellWidth;
    this.#cellHeight = cellHeight;
  }

  setTheme(theme: Theme) {
    this.#theme = theme;
  }

  setCrop(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.scale(
      this.#width / width,
      this.#height / height,
    );

    ctx.translate(
      -x,
      -y,
    );
  }

  getAnimatedHighlightedCellPosition(): CellPosition | null {
    if (!this.animatedHighlightedCell) {
      return null;
    }

    const { x, y } = this.animatedHighlightedCell;

    return {
      col: Math.round(x / this.#cellWidth),
      row: Math.round(y / this.#cellHeight),
    };
  }

  pushToRenderQueue(fn: CallableFunction) {
    this.#renderQueue.push(fn);

    window.cancelAnimationFrame(this.#renderFrame);
    this.#renderFrame = window.requestAnimationFrame(this.#renderTheQueue);
  }

  // has to be arrow function to preserve context
  #renderTheQueue = () => {
    if (this.#renderQueue.length) {
      const fn = this.#renderQueue.pop();
      fn?.();
      this.#renderQueue.length = 0;
    }

    window.cancelAnimationFrame(this.#renderFrame);
  };

  #getPixel(value: number) {
    return value | 0;
  }

  #drawShadow(ctx: CanvasRenderingContext2D) {
    // TODO big performance hit
    ctx.shadowColor = colors.bgfg[900];
    ctx.shadowBlur = 25 * scale;
  }

  drawControlSchema(ctx: CanvasRenderingContext2D) {
    const boxX = Renderer.controlBoxPadding * scale;
    const boxY = Renderer.controlBoxPadding * scale;
    const boxWidth = this.#width - Renderer.controlBoxPadding * 2 * scale;
    const boxHeight = this.#width - Renderer.controlBoxPadding * 2 * scale;

    ctx.fillStyle = colors.bgfg[this.#theme === 'dark' ? 800 : 200];
    ctx.beginPath();
    ctx.roundRect(
      boxX,
      boxY,
      boxWidth,
      boxHeight,
      [20 * scale],
    );
    ctx.fill();
    ctx.closePath();

    const fontSize = this.#width / cellsInRow / 1.5;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.bgfg[this.#theme === 'dark' ? 100 : 800];
    ctx.font = `${fontSize}px ${Renderer.fontFamily}`;

    const titleY = boxY + fontSize / 2 + 15 * scale;

    ctx.fillText(
      'Controls',
      boxWidth / 2 - fontSize * 1.5,
      titleY,
    );

    const sectionFontSize = fontSize * 0.6;
    const shortcutFontSize = fontSize * 0.4;

    let y = titleY + sectionFontSize * 2;

    for (let i = 0; i < Renderer.controlSections.length; i += 1) {
      const section = Renderer.controlSections[i];

      ctx.textAlign = 'left';
      ctx.font = `${sectionFontSize}px ${Renderer.fontFamily}`;
      ctx.fillText(
        section.title,
        this.#getPixel(boxX + 20 * scale),
        this.#getPixel(y),
      );

      y += sectionFontSize + 10 * scale;

      for (let j = 0; j < section.controls.length; j += 1) {
        const control = section.controls[j];

        ctx.textAlign = 'left';
        ctx.font = `${shortcutFontSize}px ${Renderer.fontFamily}`;
        ctx.fillText(
          control.shortcut,
          this.#getPixel(boxX + 40 * scale),
          this.#getPixel(y),
        );

        ctx.textAlign = 'right';
        ctx.font = `${shortcutFontSize}px ${Renderer.fontFamily}`;
        ctx.fillText(
          control.description,
          boxWidth,
          this.#getPixel(y),
        );

        y += shortcutFontSize + 10 * scale;
      }

      y += sectionFontSize + 10 * scale;
    }
  }

  drawFPS(ctx: CanvasRenderingContext2D, fps: number) {
    ctx.fillStyle = colors.bgfg[800];
    const w = 55 * scale;
    const h = 17 * scale;
    ctx.fillRect(this.#width - w, 0, w, h);

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.bgfg[100];
    ctx.font = `${12 * scale}px ${Renderer.fontFamily}`;
    ctx.fillText(`FPS: ${Math.round(fps)}`, this.#width - 2 * scale, 10 * scale);
  }

  drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.#width, this.#height);
  }

  drawCellColors(ctx: CanvasRenderingContext2D, cells: Cell[]) {
    this.#drawShadow(ctx);

    for (let i = 0; i < cellsInRow; i += 1) {
      for (let j = 0; j < cellsInColumn; j += 1) {
        const cell = cells[j * cellsInRow + i];

        if (!cell || cell.colors.length === 0) {
          continue;
        }

        const path = new Path2D();
        path.rect(
          this.#getPixel(i * this.#cellWidth),
          this.#getPixel(j * this.#cellHeight),
          this.#getPixel(this.#cellWidth),
          this.#getPixel(this.#cellHeight),
        );
        ctx.save();
        ctx.clip(path);

        for (let k = 0; k < cell.colors.length; k += 1) {
          const colorIndex = cell.colors[k];

          if (this.#theme === 'dark') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ctx.fillStyle = colors.darkCell[colorIndex];
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ctx.fillStyle = colors.cell[colorIndex];
          }

          const x = this.#getPixel(i * this.#cellWidth + this.#cellWidth / 2);
          const y = this.#getPixel(j * this.#cellHeight + this.#cellHeight / 2);
          const radius = this.#getPixel(Math.max(this.#cellWidth, this.#cellHeight));
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

    ctx.shadowBlur = 0;
  }

  drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = colors.bgfg[this.#theme === 'dark' ? 100 : 900];
    const thickLineWidth = this.#width * 0.006;
    const thinLineWidth = this.#width * 0.002;

    for (let i = 0; i < cellsInRow + 1; i += 1) {
      if (i % 3 === 0) {
        ctx.lineWidth = this.#getPixel(thickLineWidth);
        ctx.globalAlpha = 1;
      } else {
        ctx.lineWidth = this.#getPixel(thinLineWidth);
        ctx.globalAlpha = 0.4;
      }

      ctx.beginPath();
      ctx.moveTo(this.#getPixel(i * this.#cellWidth), 0);
      ctx.lineTo(this.#getPixel(i * this.#cellWidth), this.#getPixel(this.#width));
      ctx.stroke();
      ctx.closePath();
    }

    for (let i = 0; i < cellsInColumn + 1; i += 1) {
      if (i % 3 === 0) {
        ctx.lineWidth = this.#getPixel(thickLineWidth);
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = this.#getPixel(thinLineWidth);
      }

      ctx.beginPath();
      ctx.moveTo(0, i * this.#cellHeight);
      ctx.lineTo(this.#height, i * this.#cellHeight);
      ctx.stroke();
      ctx.closePath();
    }

    ctx.globalAlpha = 1;
  }

  drawMeta(ctx: CanvasRenderingContext2D, meta: Meta) {
    if (meta.cages) {
      const cages = meta.cages;
      const padding = this.#width * 0.0115;

      if (this.#theme === 'dark') {
        ctx.strokeStyle = colors.bgfg[700];
      } else {
        ctx.strokeStyle = colors.bgfg[300];
      }
      ctx.lineWidth = this.#getPixel(this.#width * 0.005);
      ctx.setLineDash([padding * 2, padding * 2]);

      for (const cage of cages) {
        ctx.beginPath();

        for (let i = 0; i < cage.path.length; i += 1) {
          const cell = cage.path[i];

          const x = this.#getPixel(cell.col * this.#cellWidth);
          const y = this.#getPixel(cell.row * this.#cellHeight);

          ctx.moveTo(
            this.#getPixel(x + padding),
            this.#getPixel(y + padding),
          );

          if (cage.path.some((c) => c.col === cell.col && c.row === cell.row - 1)) {
            ctx.moveTo(
              this.#getPixel(x + this.#cellWidth - padding),
              this.#getPixel(y + padding),
            );
          } else {
            ctx.lineTo(
              this.#getPixel(x + this.#cellWidth - padding),
              this.#getPixel(y + padding),
            );
          }

          if (cage.path.some((c) => c.col === cell.col + 1 && c.row === cell.row)) {
            ctx.moveTo(
              this.#getPixel(x + this.#cellWidth - padding),
              this.#getPixel(y + this.#cellHeight - padding),
            );
          } else {
            ctx.lineTo(
              this.#getPixel(x + this.#cellWidth - padding),
              this.#getPixel(y + this.#cellHeight - padding),
            );
          }

          if (cage.path.some((c) => c.col === cell.col && c.row === cell.row + 1)) {
            ctx.moveTo(
              this.#getPixel(x + padding),
              this.#getPixel(y + this.#cellHeight - padding),
            );
          } else {
            ctx.lineTo(
              this.#getPixel(x + padding),
              this.#getPixel(y + this.#cellHeight - padding),
            );
          }

          if (cage.path.some((c) => c.col === cell.col - 1 && c.row === cell.row)) {
            ctx.moveTo(
              this.#getPixel(x + padding),
              this.#getPixel(y + padding),
            );
          } else {
            ctx.lineTo(
              this.#getPixel(x + padding),
              this.#getPixel(y + padding),
            );
          }
        }

        ctx.stroke();
        ctx.closePath();

        // find top left cell
        const path = [...cage.path];
        path.sort((a, b) => {
          if (a.row === b.row) {
            return a.col - b.col;
          }

          return a.row - b.row;
        });

        const x = this.#getPixel(path[0].col * this.#cellWidth + padding);
        const y = this.#getPixel(path[0].row * this.#cellHeight + padding);

        const fontSize = this.#getPixel(this.#width * 0.025);
        ctx.font = `${fontSize}px ${Renderer.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.#theme === 'dark') {
          ctx.fillStyle = colors.bgfg[700];
        } else {
          ctx.fillStyle = colors.bgfg[300];
        }
        ctx.beginPath();
        ctx.arc(
          x,
          y,
          this.#getPixel(fontSize * 0.9),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.closePath();

        if (this.#theme === 'dark') {
          ctx.fillStyle = colors.bgfg[100];
        } else {
          ctx.fillStyle = colors.bgfg[900];
        }
        ctx.fillText(
          cage.total.toString(),
          x,
          y,
        );
      }

      ctx.setLineDash([]);
    }
  }

  drawValues(ctx: CanvasRenderingContext2D, cells: Cell[], revealed = false) {
    this.#drawShadow(ctx);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = this.#width / cellsInRow / 1.5;
    for (let i = 0; i < cellsInRow; i += 1) {
      for (let j = 0; j < cellsInColumn; j += 1) {
        const cell = cells[j * cellsInRow + i];

        if (!cell) {
          continue;
        }

        if (revealed) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = colors.bgfg[this.#theme === 'dark' ? 100 : 900];
          ctx.globalAlpha = 0.2;
          ctx.font = `${fontSize}px ${Renderer.fontFamily}`;
          ctx.fillText(
            cell.answer.toString(),
            this.#getPixel(i * this.#cellWidth + this.#cellWidth / 2),
            this.#getPixel(j * this.#cellHeight + this.#cellHeight / 2),
          );
          ctx.globalAlpha = 1;
        }

        if (this.#theme === 'dark') {
          ctx.fillStyle = colors.secondary.DEFAULT;
        } else {
          ctx.fillStyle = colors.primary[600];
          ctx.shadowBlur = 0;
        }

        if (cell.revealed) {
          ctx.fillStyle = colors.bgfg[this.#theme === 'dark' ? 100 : 900];
          if (this.#theme === 'dark') {
            ctx.font = `${fontSize}px ${Renderer.fontFamily}`;
          } else {
            ctx.font = `500 ${fontSize}px ${Renderer.fontFamily}`;
          }
          ctx.fillText(
            cell.answer.toString(),
            this.#getPixel(i * this.#cellWidth + this.#cellWidth / 2),
            this.#getPixel(j * this.#cellHeight + this.#cellHeight / 2),
          );
          if (this.#theme === 'light') {
            ctx.strokeStyle = colors.bgfg[100];
            ctx.lineWidth = this.#getPixel(this.#width * 0.003);
            ctx.strokeText(
              cell.answer.toString(),
              this.#getPixel(i * this.#cellWidth + this.#cellWidth / 2),
              this.#getPixel(j * this.#cellHeight + this.#cellHeight / 2),
            );
          }
        } else if (cell.value) {
          ctx.font = `${fontSize}px ${Renderer.fontFamily}`;
          ctx.fillText(
            cell.value.toString(),
            this.#getPixel(i * this.#cellWidth + this.#cellWidth / 2),
            this.#getPixel(j * this.#cellHeight + this.#cellHeight / 2),
          );
        } else {
          ctx.font = `${fontSize / 2.4}px ${Renderer.fontFamily}`;
          cell.corner.forEach((value, valueI) => {
            ctx.fillText(
              value.toString(),
              this.#getPixel(i * this.#cellWidth + (this.#cellWidth / 4) * (valueI % 2 === 0 ? 1 : 3)),
              this.#getPixel(j * this.#cellHeight + (this.#cellHeight / 4) * (valueI < 2 ? 1 : 3)),
            );
          });

          ctx.font = cell.middle.length > 4
            ? `${fontSize / (cell.middle.length / 2)}px ${Renderer.fontFamily}`
            : `${fontSize / 2.4}px Mitr`;
          ctx.fillText(
            cell.middle.join(''),
            this.#getPixel(i * this.#cellWidth + (this.#cellWidth / 2)),
            this.#getPixel(j * this.#cellHeight + (this.#cellHeight / 2)),
          );
        }
      }
    }

    ctx.shadowBlur = 0;
  }

  drawHighlightedCell(ctx: CanvasRenderingContext2D, dt: number, highlightedCell: CellPosition | null) {
    if (highlightedCell) {
      const x = highlightedCell.col * this.#cellWidth;
      const y = highlightedCell.row * this.#cellHeight;

      if (this.animatedHighlightedCell === null) {
        this.animatedHighlightedCell = { x, y };
      } else {
        this.animatedHighlightedCell.x = lerp(this.animatedHighlightedCell.x, x, Renderer.hightlightedCellSpeed * dt);
        this.animatedHighlightedCell.y = lerp(this.animatedHighlightedCell.y, y, Renderer.hightlightedCellSpeed * dt);
      }

      ctx.fillStyle = colors.bgfg[this.#theme === 'dark' ? 100 : 700];
      ctx.globalAlpha = 0.2;
      ctx.fillRect(
        this.#getPixel(this.animatedHighlightedCell.x),
        this.#getPixel(this.animatedHighlightedCell.y),
        this.#getPixel(this.#cellWidth),
        this.#getPixel(this.#cellHeight),
      );
      ctx.globalAlpha = 1;
    } else {
      this.animatedHighlightedCell = null;
    }
  }

  drawHighlightedRowColArea(
    ctx: CanvasRenderingContext2D,
    dt: number,
    highlightedCell: CellPosition | null,
  ) {
    if (highlightedCell !== null && this.animatedHighlightedCell !== null) {
      const x = Math.floor(highlightedCell.col / 3) * 3;
      const y = Math.floor(highlightedCell.row / 3) * 3;

      if (this.animatedArea === null) {
        this.animatedArea = { x, y };
      } else {
        this.animatedArea.x = lerp(this.animatedArea.x, x, Renderer.hightlightedCellSpeed * dt);
        this.animatedArea.y = lerp(this.animatedArea.y, y, Renderer.hightlightedCellSpeed * dt);
      }

      ctx.fillStyle = colors.bgfg[this.#theme === 'dark' ? 100 : 800];
      ctx.globalAlpha = 0.1;

      for (let i = 0; i < cellsInRow; i += 1) {
        ctx.fillRect(
          this.#getPixel(i * this.#cellWidth),
          this.#getPixel(this.animatedHighlightedCell.y),
          this.#getPixel(this.#cellWidth),
          this.#getPixel(this.#cellHeight),
        );
      }

      for (let i = 0; i < cellsInColumn; i += 1) {
        ctx.fillRect(
          this.#getPixel(this.animatedHighlightedCell.x),
          this.#getPixel(i * this.#cellHeight),
          this.#getPixel(this.#cellWidth),
          this.#getPixel(this.#cellHeight),
        );
      }

      ctx.save();

      ctx.clearRect(
        this.#getPixel((this.animatedArea.x) * this.#cellWidth),
        this.#getPixel((this.animatedArea.y) * this.#cellHeight),
        this.#getPixel(this.#cellWidth * 3),
        this.#getPixel(this.#cellHeight * 3),
      );

      ctx.fillRect(
        this.#getPixel((this.animatedArea.x) * this.#cellWidth),
        this.#getPixel((this.animatedArea.y) * this.#cellHeight),
        this.#getPixel(this.#cellWidth * 3),
        this.#getPixel(this.#cellHeight * 3),
      );

      ctx.restore();

      ctx.globalAlpha = 1;
    } else {
      this.animatedArea = null;
    }
  }

  drawSelection(ctx: CanvasRenderingContext2D, selectedCells: CellPosition[]) {
    selectedCells.forEach((cell) => {
      this.drawSelectedCell(ctx, {
        x: cell.col * this.#cellWidth,
        y: cell.row * this.#cellHeight,
      });
    });
  }

  drawSelectedCell(ctx: CanvasRenderingContext2D, cell: Point) {
    this.#drawShadow(ctx);

    const lineWidth = this.#width * 0.01;

    if (this.#theme === 'dark') {
      ctx.strokeStyle = colors.secondary.DEFAULT;
    } else {
      ctx.strokeStyle = colors.secondary[300];
    }
    ctx.fillStyle = colors.bgfg[this.#theme === 'dark' ? 100 : 300];
    ctx.lineWidth = lineWidth;

    ctx.strokeRect(
      this.#getPixel(cell.x + lineWidth / 2),
      this.#getPixel(cell.y + lineWidth / 2),
      this.#getPixel(this.#cellWidth - lineWidth),
      this.#getPixel(this.#cellHeight - lineWidth),
    );
    ctx.globalAlpha = 0.2;
    ctx.fillRect(
      this.#getPixel(cell.x),
      this.#getPixel(cell.y),
      this.#getPixel(this.#cellWidth),
      this.#getPixel(this.#cellHeight),
    );
    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;
  }

  pushFlyInCells(cells: CellPosition[], callback: CallableFunction) {
    this.flyInCells = cells.map((cell) => ({
      ...cell,
      x: 0,
      y: 0,
    }));

    this.flyInCallback = callback;
  }

  drawFlyIn(ctx: CanvasRenderingContext2D, dt: number) {
    if (this.flyInCells.length > 0) {
      for (const cell of this.flyInCells) {
        this.drawSelectedCell(ctx, cell);

        cell.x = lerp(cell.x, cell.col * this.#cellWidth, Renderer.flyInSpeed * dt);
        cell.y = lerp(cell.y, cell.row * this.#cellHeight, Renderer.flyInSpeed * dt);
      }

      if (this.flyInCells.every(
        (cell) => Math.abs(cell.x - cell.col * this.#cellWidth) <= 0.1
               && Math.abs(cell.y - cell.row * this.#cellHeight) <= 0.1,
      )) {
        this.flyInCells.length = 0;
        this.flyInCallback?.();
        this.flyInCallback = null;
      }
    }
  }
}
