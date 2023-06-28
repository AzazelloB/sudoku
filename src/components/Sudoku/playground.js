import { cellsInColumn, cellsInRow } from '~/components/Sudoku/settings';
import { difficultyLevels } from '~/constants/difficulty';

const isValid = (cells, number, index) => {
  const col = index % cellsInRow;
  const row = Math.floor(index / cellsInRow);

  // check row
  const rowStart = row * cellsInRow;
  for (let i = rowStart; i < rowStart + cellsInRow; i++) {
    if (i === index) {
      continue;
    }

    if (cells[i] === number) {
      return false;
    }
  }

  // check col
  for (let i = col; i < cells.length; i += cellsInRow) {
    if (i === index) {
      continue;
    }

    if (cells[i] === number) {
      return false;
    }
  }

  // check sudoku area
  // assuming area is 3x3
  const areaStart = Math.floor(row / 3) * 3 * cellsInRow + Math.floor(col / 3) * 3;
  for (let i = areaStart; i < areaStart + 3; i++) {
    for (let j = 0; j < 3; j++) {
      const areaIndex = i + j * cellsInRow;

      if (areaIndex === index) {
        continue;
      }

      if (cells[areaIndex] === number) {
        return false;
      }
    }
  }

  return true;
};

const solve = (cells, i = 0) => {
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

  const avaliable = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (avaliable.length) {
    const [value] = avaliable.splice(
      Math.floor(Math.random() * avaliable.length),
      1,
    );

    if (isValid(cells, value, i)) {
      // eslint-disable-next-line no-param-reassign
      cells[i] = value;

      if (solve(cells, i + 1)) {
        return true;
      }
    }
  }

  // eslint-disable-next-line no-param-reassign
  cells[i] = null;
  return false;
};

const countSolutions = (cells, i = 0, count = 0) => {
  // stop at two since we use this function as a sudoku validator
  if (count >= 2) {
    return count;
  }

  if (i === cells.length) {
    return 1 + count;
  }

  if (cells[i] !== null) {
    return countSolutions(cells, i + 1, count);
  }

  const avaliable = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  while (avaliable.length) {
    const [value] = avaliable.splice(
      Math.floor(Math.random() * avaliable.length),
      1,
    );

    if (isValid(cells, value, i)) {
      // eslint-disable-next-line no-param-reassign
      cells[i] = value;

      // eslint-disable-next-line no-param-reassign
      count = countSolutions(cells, i + 1, count);
    }
  }

  // eslint-disable-next-line no-param-reassign
  cells[i] = null;
  return count;
};

const reveal = (cells) => {
  const indexes = [...cells.keys()];
  const masked = [...cells];

  for (let revealed = 0; revealed <= cells.length - 1 - difficultyLevels.normal;) {
    const [randomIndex] = indexes.splice(
      Math.floor(Math.random() * indexes.length),
      1,
    );

    const value = masked[randomIndex];

    if (masked[randomIndex] === null) {
      continue;
    }

    masked[randomIndex] = null;

    if (countSolutions([...masked]) === 1) {
      revealed++;
    } else {
      indexes.push(randomIndex);
      masked[randomIndex] = value;
    }
  }

  return masked;
};

export const doStuff = () => {
  const cells = new Array(cellsInRow * cellsInColumn).fill(null);

  // const cells = '.78..5..91..4.3..8..3.987.1..6324..7.......462.7.86....6.....1.3...49672924...385'
  //   .split('')
  //   .map((v) => (v === '.' ? null : parseInt(v, 10)));

  solve(cells);

  const solved = [...cells];

  const masked = reveal(cells);

  console.log('amount of revealed cells:', masked.filter(Boolean).length);

  console.log('solved', solved);
  console.log('masked', masked);

  console.log(masked.map((v) => (v === null ? '.' : v)).join(''));
  // let result = '';

  // for (let i = 0; i < masked.length; i++) {
  //   if (i % 9 === 0) {
  //     result += '\n';
  //   }

  //   result += `${masked[i] === null ? 0 : masked[i]},`;
  // }

  // console.log(result);
};
