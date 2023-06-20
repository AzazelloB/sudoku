import { createSignal } from 'solid-js';

import Board from '~/components/Sudoku/Board';

const HomePage = () => {
  const [mode] = createSignal('normal');

  return (
    <Board
      mode={mode}
    />
  );
};

export default HomePage;
