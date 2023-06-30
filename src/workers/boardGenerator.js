/* eslint-disable no-param-reassign */
import { mask, solve } from '~/components/Sudoku/board';
import { cellsInColumn, cellsInRow } from '~/components/Sudoku/settings';

onmessage = ({ data: { difficulty } }) => {
  const solved = new Array(cellsInRow * cellsInColumn).fill();
  solve(solved);

  const masked = mask(solved, difficulty);

  const cells = [];

  for (let i = 0; i < solved.length; i += 1) {
    cells.push({
      value: null,
      answer: solved[i],
      revealed: masked[i] !== null,
      corner: [],
      middle: [],
      x: i % cellsInRow,
      y: Math.floor(i / cellsInRow),
      colors: [],
    });
  }

  postMessage(cells);
};
