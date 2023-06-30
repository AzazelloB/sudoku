import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';

import { useGlobalContext } from '~/context/GlobalContext';

import { initControls } from '~/components/Sudoku/controls';
import { Renderer } from '~/components/Sudoku/renderer';
import { initialHeight, initialWidth, scale } from '~/components/Sudoku/settings';

const Board = (props) => {
  const { theme } = useGlobalContext();
  let canvas;
  let renderer;

  const [canvasWidth, setCanvasWidth] = createSignal(initialWidth);
  const [canvasHeight, setCanvasHeight] = createSignal(initialHeight);
  const [fps, setFPS] = createSignal(0);

  onMount(() => {
    renderer = renderer instanceof Renderer ? renderer : new Renderer(canvas, theme());
  });

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

    renderer.draw(1);
  };

  createEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);

    onCleanup(() => {
      window.removeEventListener('resize', onResize);
    });

    if (props.paused()) {
      renderer.draw(1);

      return;
    }

    let start = null;
    let prevTimeStamp = 0;

    let frame;

    const gameLoop = (timeStamp) => {
      if (!start) {
        start = timeStamp;
      }

      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      if (start + 1000 < timeStamp) {
        start = timeStamp;
        setFPS((1 / dt).toFixed(0));
      }

      renderer.draw(dt);

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
    <>
    <div>FPS: {fps()}</div>
    <canvas
      ref={canvas}
      width={canvasWidth() * scale}
      height={canvasHeight() * scale}
      style={{
        width: `${canvasWidth()}px`,
        height: `${canvasHeight()}px`,
      }}
    />
    </>
  );
};

export default Board;
