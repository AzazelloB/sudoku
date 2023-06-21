import { createEffect, onCleanup } from 'solid-js';

import { useGlobalContext } from '~/context/GlobalContext';

import { initControls } from '~/components/Sudoku/controls';
import { generateGrid, revealCells } from '~/components/Sudoku/board';
import { draw } from '~/components/Sudoku/render';
import { height, width } from '~/components/Sudoku/settings';

const Board = (props) => {
  const { theme } = useGlobalContext();

  let canvas;

  createEffect(() => {
    const cleanup = initControls(canvas, props.mode());

    onCleanup(cleanup);

    generateGrid();
    revealCells(props.difficulty());

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
