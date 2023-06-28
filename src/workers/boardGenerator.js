/* eslint-disable no-param-reassign */
import { reveal, solve } from '~/components/Sudoku/board';
import { cellsInColumn, cellsInRow } from '~/components/Sudoku/settings';

onmessage = ({ data: { difficulty } }) => {
  const cells = [];

  for (let i = 0; i < cellsInRow * cellsInColumn; i += 1) {
    cells.push({
      value: null,
      answer: null,
      revealed: false,
      corner: [],
      middle: [],
      x: i % cellsInRow,
      y: Math.floor(i / cellsInRow),
      colors: [],
    });
  }

  solve(cells);

  const masked = reveal(cells, difficulty);

  for (let i = 0; i < cellsInRow * cellsInColumn; i += 1) {
    const cell = masked[i];

    if (cell.answer !== null) {
      cells[i].revealed = true;
    }
  }

  postMessage(cells);
};
