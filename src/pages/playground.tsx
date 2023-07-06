import { Component } from 'solid-js';

import animation from '~/components/Sudoku/nakedSingleAnimation.json';

import BoardOnDemand, { Animation } from '~/components/Sudoku/SequencedBoard';

const PlaygroundPage: Component = () => {
  return (
    <BoardOnDemand
      animation={animation as unknown as Animation}
      width={600}
      height={600}
    />
  );
};

export default PlaygroundPage;
