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
import { subscribe, unsubscribe } from '~/utils/pubSub';

import { initControls } from '~/components/Sudoku/controls';
import { Renderer } from '~/components/Sudoku/renderer';
import { initialHeight, initialWidth, scale } from '~/components/Sudoku/settings';
import { state } from '~/components/Sudoku/state';
import { selectCell } from '~/components/Sudoku/board';

interface BoardProps {
  paused: () => boolean;
  panel: Accessor<HTMLElement | null>;
  mode: Accessor<InsertionMode>;
  tool: Accessor<Tool>;
}

const Board: Component<BoardProps> = (props) => {
  const { theme } = useGlobalContext();

  let layer_1: HTMLCanvasElement;
  let layer_2: HTMLCanvasElement;
  let layer_3: HTMLCanvasElement;
  let layer_4: HTMLCanvasElement;
  
  const renderer = new Renderer();

  const [canvasWidth, setCanvasWidth] = createSignal(initialWidth);
  const [canvasHeight, setCanvasHeight] = createSignal(initialHeight);

  const drawStaticLayers = (
    layer_1_ctx: CanvasRenderingContext2D,
    layer_3_ctx: CanvasRenderingContext2D
  ) => {
    renderer.drawBackground(layer_1_ctx);
    renderer.drawBackground(layer_3_ctx);

    renderer.drawCellColors(layer_1_ctx);
    renderer.drawGrid(layer_1_ctx);

    renderer.drawSelection(layer_3_ctx);

    renderer.drawValues(layer_3_ctx);
  }

  onMount(() => {
    const layer_1_ctx = layer_1.getContext('2d')!;
    const layer_3_ctx = layer_3.getContext('2d')!;

    const onResize = () => {
      const { top, left } = layer_2.getBoundingClientRect();
      const padding = 24;

      const size = Math.min(
        window.innerWidth > 1024 ? window.innerWidth / 2 : window.innerWidth - (left * 2),
        window.innerHeight - top - padding,
      );

      setCanvasWidth(size);
      setCanvasHeight(size);

      renderer.resize(size * scale, size * scale);

      window.requestAnimationFrame(() => drawStaticLayers(layer_1_ctx, layer_3_ctx));
    };

    onResize();
    window.addEventListener('resize', onResize);

    onCleanup(() => {
      window.removeEventListener('resize', onResize);
    });
  });

  createEffect(() => {
    if (props.paused()) {
      return;
    }

    const layer_1_ctx = layer_1.getContext('2d')!;
    const layer_3_ctx = layer_3.getContext('2d')!;

    const updateStaticLayers = () => {
      renderer.pushToRenderQueue(() => {
        drawStaticLayers(layer_1_ctx, layer_3_ctx);
      });
    };

    const flyInCells = (cells: CellPosition[]) => {
      state.selectedCells.length = 0;
      
      renderer.pushFlyInCells(cells, () => {
        cells.forEach(selectCell);
      });
    };

    drawStaticLayers(layer_1_ctx, layer_3_ctx);
    subscribe('cells:changed', updateStaticLayers);
    subscribe('selectedCells:changed', updateStaticLayers);
    subscribe('revealed:changed', updateStaticLayers);
    subscribe('tip:added', flyInCells);

    onCleanup(() => {
      unsubscribe('cells:changed', updateStaticLayers);
      unsubscribe('selectedCells:changed', updateStaticLayers);
      unsubscribe('revealed:changed', updateStaticLayers);
      unsubscribe('tip:added', flyInCells);
    });
  });

  createEffect(() => {
    if (props.paused()) {
      return;
    }

    const layer_2_ctx = layer_2.getContext('2d')!;
    const layer_4_ctx = layer_4.getContext('2d')!;

    let prevTimeStamp = 0;

    let frame: number;

    const gameLoop = (timeStamp: number) => {
      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      renderer.drawBackground(layer_2_ctx);

      renderer.drawHighlightedCell(layer_2_ctx, dt);
  
      renderer.drawHighlightedRowColArea(layer_2_ctx, dt);

      renderer.drawFlyIn(layer_2_ctx, dt);
  
      renderer.drawBackground(layer_4_ctx);

      if (state.debug) {
        renderer.drawFPS(layer_4_ctx, dt);
      }

      if (state.showControls) {
        renderer.drawControlSchema(layer_4_ctx);
      }

      frame = window.requestAnimationFrame(gameLoop);
    };

    frame = window.requestAnimationFrame(gameLoop);

    onCleanup(() => {
      cancelAnimationFrame(frame);
    });
  });

  createEffect(() => {
    if (props.paused()) {
      return;
    }

    const cleanup = initControls({
      canvas: layer_2,
      panel: props.panel()!,
      mode: props.mode(),
      tool: props.tool(),
    });

    onCleanup(cleanup);
  });

  createEffect(() => {
    renderer.setTheme(theme());

    const layer_1_ctx = layer_1.getContext('2d')!;
    const layer_3_ctx = layer_3.getContext('2d')!;

    drawStaticLayers(layer_1_ctx, layer_3_ctx);
  });

  return (
    <div class="relative">
      <canvas
        ref={layer_1!}
        class="absolute inset-0 pointer-events-none z-10"
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth()}px`,
          height: `${canvasHeight()}px`,
        }}
      />
      <canvas
        ref={layer_2!}
        tabIndex={0}
        class={twMerge(
          'relative z-20 select-none',
          // TODO figure out how to show focus ring only when using tab
          'focus-visible:outline-none'
          // 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-4',
          // 'focus-visible:ring-white dark:focus-visible:ring-offset-background-dark',
        )}
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth()}px`,
          height: `${canvasHeight()}px`,
        }}
      />
      <canvas
        ref={layer_3!}
        class="absolute inset-0 pointer-events-none z-30"
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth()}px`,
          height: `${canvasHeight()}px`,
        }}
      />
      <canvas
        ref={layer_4!}
        class="absolute inset-0 pointer-events-none z-40"
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth()}px`,
          height: `${canvasHeight()}px`,
        }}
      />
    </div>
  );
};

export default Board;
