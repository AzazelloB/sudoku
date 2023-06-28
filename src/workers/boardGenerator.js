import { reveal, solve } from '~/components/Sudoku/playground';
import { cellsInColumn, cellsInRow } from '~/components/Sudoku/settings';

onmessage = () => {
  const cells = new Array(cellsInRow * cellsInColumn).fill(null);

  solve(cells);

  let masked;

  console.log('\n');
  console.log('----------------------------------------');
  console.log('\n');

  console.time();
  for (let i = 0; i < 1; i++) {
    masked = reveal(cells);
    // console.log(masked.map((v) => (v === null ? '.' : v)).join(''));
  }
  console.timeEnd();

  console.log('\n');
  console.log('----------------------------------------');
  console.log('\n');

  postMessage(masked);
};
