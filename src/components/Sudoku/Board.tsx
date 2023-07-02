import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { twMerge } from 'tailwind-merge';

import { useGlobalContext } from '~/context/GlobalContext';

import { initControls } from '~/components/Sudoku/controls';
import { Renderer } from '~/components/Sudoku/renderer';
import { initialHeight, initialWidth, scale } from '~/components/Sudoku/settings';

interface BoardProps {
  paused: () => boolean;
  panel: Accessor<HTMLElement | null>;
  mode: Accessor<InsertionMode>;
  tool: Accessor<Tool>;
}

const Board: Component<BoardProps> = (props) => {
  const { theme } = useGlobalContext();
  let canvas: HTMLCanvasElement;
  let renderer: Renderer;

  const [canvasWidth, setCanvasWidth] = createSignal(initialWidth);
  const [canvasHeight, setCanvasHeight] = createSignal(initialHeight);

  onMount(() => {
    renderer = renderer instanceof Renderer ? renderer : new Renderer(canvas, theme());

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

      renderer.resize(size * scale, size * scale);
      renderer.draw();
    };

    onResize();
    window.addEventListener('resize', onResize);

    onCleanup(() => {
      window.removeEventListener('resize', onResize);
    });
  });

  createEffect(() => {
    if (props.paused()) {
      renderer.draw();

      return;
    }

    let prevTimeStamp = 0;

    let frame: number;

    const gameLoop = (timeStamp: number) => {
      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      renderer.draw(dt);

      frame = window.requestAnimationFrame(gameLoop);
    };

    frame = window.requestAnimationFrame(gameLoop);
    onCleanup(() => {
      cancelAnimationFrame(frame);
    });

    const cleanup = initControls({
      canvas,
      panel: props.panel()!,
      mode: props.mode(),
      tool: props.tool(),
    });

    onCleanup(cleanup);
  });

  createEffect(() => {
    renderer.setTheme(theme());
  });

  return (
    <canvas
      ref={canvas!}
      tabIndex={0}
      class={twMerge(
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-4',
        'focus-visible:ring-white dark:focus-visible:ring-offset-background-dark',
      )}
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
