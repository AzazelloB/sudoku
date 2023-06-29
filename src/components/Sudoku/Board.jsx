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

  const drawCanvas = (dt = 1) => {
    const ctx = canvas.getContext('2d');

    draw(ctx, dt, theme());
  };

  const onResize = () => {
    const { top, left } = canvas.getBoundingClientRect();
    const padding = 24;

    const size = Math.min(
      window.innerWidth > 1024 ? window.innerWidth / 2 : window.innerWidth - (left * 2),
      window.innerHeight - top - padding,
    );

    // TODO this somehow makes canvas go blank if on pause
    setCanvasWidth(size);
    setCanvasHeight(size);

    drawCanvas();
  };

  createEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);

    onCleanup(() => {
      window.removeEventListener('resize', onResize);
    });

    if (props.paused()) {
      drawCanvas();

      return;
    }

    let prevTimeStamp = 0;

    let frame;

    const gameLoop = (timeStamp) => {
      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      drawCanvas(dt);

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
