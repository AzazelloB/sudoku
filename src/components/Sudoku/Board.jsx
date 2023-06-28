import {
  createEffect,
  createSignal,
  onCleanup,
} from 'solid-js';

import { useGlobalContext } from '~/context/GlobalContext';

import { initControls } from '~/components/Sudoku/controls';
import { draw } from '~/components/Sudoku/render';
import { initialHeight, initialWidth, scale } from '~/components/Sudoku/settings';

const Board = (props) => {
  const { theme } = useGlobalContext();
  let canvas;

  const [canvasWidth, setCanvasWidth] = createSignal(initialWidth);
  const [canvasHeight, setCanvasHeight] = createSignal(initialHeight);

  const onResize = () => {
    const { top } = canvas.getBoundingClientRect();
    const padding = 24;

    const size = Math.min(window.innerWidth / 2, window.innerHeight - top - padding);

    // TODO if the game is on pause, this makes the canvas disappear
    setCanvasWidth(size);
    setCanvasHeight(size);
  };

  createEffect(() => {
    const ctx = canvas.getContext('2d');

    onResize();
    window.addEventListener('resize', onResize);

    onCleanup(() => {
      window.removeEventListener('resize', onResize);
    });

    if (props.paused()) {
      draw(ctx, 1, theme());

      return;
    }

    let prevTimeStamp = 0;

    let frame;

    const gameLoop = (timeStamp) => {
      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      draw(ctx, dt, theme());

      frame = window.requestAnimationFrame(gameLoop);
    };

    frame = window.requestAnimationFrame(gameLoop);
    onCleanup(() => {
      cancelAnimationFrame(frame);
    });

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
      width={canvasWidth() * scale}
      height={canvasHeight() * scale}
      style={{
        width: `${canvasWidth()}px`,
        height: `${canvasHeight()}px`,
      }}
    />
  );
};

export default Board;
