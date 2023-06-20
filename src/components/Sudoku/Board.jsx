import { createEffect, onCleanup } from 'solid-js';

import { useGlobalContext } from '~/context/GlobalContext';

import { initControls } from '~/components/Sudoku/controls';
import { generateGrid } from '~/components/Sudoku/board';
import { draw } from '~/components/Sudoku/render';
import { height, width } from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';

const Board = (props) => {
  const { theme } = useGlobalContext();

  let canvas;

  createEffect(() => {
    // TODO fix the need to clear state because of hot reloading
    console.log(state);
    state.cells = [];
    const cleanup = initControls(canvas, props.mode());

    onCleanup(cleanup);

    generateGrid();

    const ctx = canvas.getContext('2d');

    const gameLoop = () => {
      draw(ctx, theme());

      window.requestAnimationFrame(gameLoop);
    };

    window.requestAnimationFrame(gameLoop);
  });

  return (
    <canvas
      ref={canvas}
      width={width}
      height={height}
    />
  );
};

export default Board;
