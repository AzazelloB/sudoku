import { createEffect, onCleanup } from 'solid-js';

import { useGlobalContext } from '~/context/GlobalContext';

import { initControls } from '~/components/Sudoku/controls';
import { generateGrid, revealCells } from '~/components/Sudoku/board';
import { draw } from '~/components/Sudoku/render';
import { height, width } from '~/components/Sudoku/settings';
import { clearHistory, saveSnapshot } from '~/components/Sudoku/history';
import { state } from '~/components/Sudoku/state';

const Board = (props) => {
  const { theme, cells, setCells } = useGlobalContext();

  let canvas;

  createEffect(() => {
    const cleanup = initControls(canvas, props.mode());

    onCleanup(cleanup);

    if (cells().length === 0) {
      generateGrid();
      revealCells(props.difficulty());
      setCells(state.cells);
    } else {
      state.cells = cells();
    }

    clearHistory();
    saveSnapshot();

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
