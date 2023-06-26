import { createEffect, onCleanup, onMount } from 'solid-js';

import { useGlobalContext } from '~/context/GlobalContext';

import { initControls } from '~/components/Sudoku/controls';
import { generateGrid, revealCells } from '~/components/Sudoku/board';
import { draw } from '~/components/Sudoku/render';
import { initialHeight, initialWidth } from '~/components/Sudoku/settings';
import { clearHistory, saveSnapshot } from '~/components/Sudoku/history';
import { state } from '~/components/Sudoku/state';

const Board = (props) => {
  const { theme, cells, setCells } = useGlobalContext();
  let canvas;

  onMount(() => {
    if (cells().length === 0) {
      generateGrid();
      revealCells(props.difficulty());
      setCells(state.cells);
    } else {
      state.cells = cells();
    }

    clearHistory();
    saveSnapshot();
  });

  const onResize = () => {
    const { top } = canvas.getBoundingClientRect();
    const padding = 24;

    const min = Math.min(window.innerWidth / 2, window.innerHeight - top - padding);

    canvas.width = min;
    canvas.height = min;
  };

  createEffect(() => {
    const ctx = canvas.getContext('2d');

    onResize();
    window.addEventListener('resize', onResize);

    onCleanup(() => {
      window.removeEventListener('resize', onResize);
    });

    if (props.paused()) {
      draw(ctx, theme());

      return;
    }

    let prevTimeStamp = 0;

    const gameLoop = (timeStamp) => {
      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      draw(ctx, dt, theme());

      window.requestAnimationFrame(gameLoop);
    };

    window.requestAnimationFrame(gameLoop);

    const cleanup = initControls({
      canvas,
      panel: props.panel(),
      mode: props.mode(),
      setMode: props.setMode,
      tool: props.tool(),
      setTool: props.setTool,
    });

    onCleanup(cleanup);
  });

  return (
    <canvas
      ref={canvas}
      width={initialWidth}
      height={initialHeight}
    />
  );
};

export default Board;
