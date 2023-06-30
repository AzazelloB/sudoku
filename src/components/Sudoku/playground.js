/* eslint-disable no-param-reassign */
import { cellsInRow } from '~/components/Sudoku/settings';
import { difficultyLevels } from '~/constants/difficulty';
import BoardGenerator from '~/workers/boardGeneratorTest?worker';

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

const isValid = (cells, number, index) => {
  const col = index % cellsInRow;
  const row = Math.floor(index / cellsInRow);

  // check row and col
  for (let i = 0; i < cellsInRow; i++) {
    const rowIndex = row * cellsInRow + i;
    const colIndex = col + i * cellsInRow;

    if (rowIndex !== index && cells[rowIndex] === number) {
      return false;
    }

    if (colIndex !== index && cells[colIndex] === number) {
      return false;
    }
  }

  // check sudoku area
  // assuming area is 3x3
  const areaStartRow = Math.floor(row / 3) * 3;
  const areaStartCol = Math.floor(col / 3) * 3;
  const areaEndRow = areaStartRow + 3;
  const areaEndCol = areaStartCol + 3;

  for (let i = areaStartRow; i < areaEndRow; i++) {
    for (let j = areaStartCol; j < areaEndCol; j++) {
      const areaIndex = i * cellsInRow + j;

      if (areaIndex !== index && cells[areaIndex] === number) {
        return false;
      }
    }
  }

  return true;
};

export const solve = (cells, i = 0) => {
  if (i === cells.length) {
    return true;
  }

  if (cells[i] !== null) {
    if (isValid(cells, cells[i], i)) {
      if (solve(cells, i + 1)) {
        return true;
      }
    }

    return false;
  }

  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (available.length) {
    const [value] = available.splice(
      Math.floor(Math.random() * available.length),
      1,
    );

    if (isValid(cells, value, i)) {
      cells[i] = value;

      if (solve(cells, i + 1)) {
        return true;
      }
    }
  }

  cells[i] = null;
  return false;
};

let iter = 0;

const countSolutions = (cells, i = 0, count = 0) => {
  iter++;

  if (iter > 10_000_000) {
    console.log(count, cells);
    throw new Error('enough');
  }

  // stop at two since we use this function as a sudoku validator
  if (count > 1) {
    return count;
  }

  if (i === cells.length) {
    return 1 + count;
  }

  if (cells[i] !== null) {
    return countSolutions(cells, i + 1, count);
  }

  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (available.length) {
    const value = available.pop();

    if (isValid(cells, value, i)) {
      cells[i] = value;

      count = countSolutions(cells, i + 1, count);
    }
  }

  cells[i] = null;
  return count;
};

export const reveal = (cells) => {
  iter = 0;

  const indexes = [...cells.keys()];
  shuffleArray(indexes);
  const masked = cells.slice();

  const max = masked.length - 1 - difficultyLevels.hard;
  for (let revealed = 0; revealed <= max;) {
    const randomIndex = indexes.pop();

    const value = masked[randomIndex];

    masked[randomIndex] = null;

    if (countSolutions(masked.slice()) === 1) {
      // console.log(masked);
      console.log('revealed', revealed, 'of', max);
      revealed++;
    } else {
      masked[randomIndex] = value;
      indexes.unshift(randomIndex);
    }
  }

  return masked;
};

export const doStuff = () => {
  if (window.Worker) {
    const worker = new BoardGenerator();

    worker.postMessage({});

    worker.addEventListener('message', () => {
      // console.log(message.data);
    });
  }

  // const cells = new Array(cellsInRow * cellsInColumn).fill(null);

  // solve(cells);

  // // const solved = [...cells];

  // console.log('\n');
  // console.log('----------------------------------------');
  // console.log('\n');

  // console.time();
  // for (let i = 0; i < 1; i++) {
  //   reveal(cells);
  // }
  // console.timeEnd();
  // // (12963.27001953125 + 9250.694091796875 + 10774.684814453125) / 3
  // // average: 10996.2163086
  // // console.log('amount of revealed cells:', masked.filter(Boolean).length);

  // console.log('\n');
  // console.log('----------------------------------------');
  // console.log('\n');

  // console.log('solved', solved);
  // console.log('masked', masked);
  // console.log(masked.map((v) => (v === null ? '.' : v)).join(''));
  // let result = '';

  // for (let i = 0; i < masked.length; i++) {
  //   if (i % 9 === 0) {
  //     result += '\n';
  //   }
};
