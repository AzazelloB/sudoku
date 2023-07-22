/* eslint-disable camelcase */
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

import { initControls } from '~/components/Board/controls';
import { Renderer } from '~/components/Board/renderer';
import { initialHeight, initialWidth, scale } from '~/components/Board/settings';
import { state } from '~/components/Board/state';
import { selectCell } from '~/components/Board/board';

const BUFFER_PADDING = 20;

interface BoardProps {
  paused: () => boolean;
  mode: Accessor<InsertionMode>;
  tool: Accessor<Tool>;
  clickOutsideExceptions: Accessor<HTMLElement | null>[];
}

const Board: Component<BoardProps> = (props) => {
  const { theme } = useGlobalContext();

  const [usingTab, setUsingTab] = createSignal(false);

  const keyboardFocus = (e: KeyboardEvent) => {
    if (e.code === 'Tab') {
      setUsingTab(true);
      document.removeEventListener('keydown', keyboardFocus, false);
    }
  };

  document.addEventListener('keydown', keyboardFocus, false);

  onCleanup(() => {
    document.removeEventListener('keydown', keyboardFocus, false);
  });

  let layer_1: HTMLCanvasElement;
  let layer_2: HTMLCanvasElement;
  let layer_3: HTMLCanvasElement;
  let layer_4: HTMLCanvasElement;
  let layer_5: HTMLCanvasElement;

  const renderer = new Renderer();

  const [canvasWidth, setCanvasWidth] = createSignal(initialWidth);
  const [canvasHeight, setCanvasHeight] = createSignal(initialHeight);

  const drawStaticLayers = (
    layer_1_ctx: CanvasRenderingContext2D,
    layer_4_ctx: CanvasRenderingContext2D,
  ) => {
    renderer.drawBackground(layer_1_ctx);
    renderer.drawBackground(layer_4_ctx);

    renderer.drawCellColors(layer_1_ctx, state.cells);
    renderer.drawGrid(layer_1_ctx);

    renderer.drawSelection(layer_4_ctx, state.selectedCells);
    renderer.drawValues(layer_4_ctx, state.cells, state.revealed);
  };

  const drawUnchangingLayers = (
    layer_3_ctx: CanvasRenderingContext2D,
  ) => {
    renderer.drawBackground(layer_3_ctx);
    renderer.drawMeta(layer_3_ctx, state.meta, BUFFER_PADDING * scale);
  };

  onMount(() => {
    const layer_1_ctx = layer_1.getContext('2d')!;
    const layer_3_ctx = layer_3.getContext('2d')!;
    const layer_4_ctx = layer_4.getContext('2d')!;

    const onResize = () => {
      const { top, left } = layer_2.getBoundingClientRect();
      const padding = 24;

      const size = Math.min(
        window.outerWidth > 1024 ? window.outerWidth / 2 : window.outerWidth - (left * 2),
        window.innerHeight - top - padding,
      );

      setCanvasWidth(size);
      setCanvasHeight(size);

      renderer.resize(size * scale, size * scale);

      window.requestAnimationFrame(() => {
        drawStaticLayers(layer_1_ctx, layer_4_ctx);
        drawUnchangingLayers(layer_3_ctx);
      });
    };

    onResize();
    window.addEventListener('resize', onResize);

    document.fonts.ready.then(() => {
      renderer.pushToRenderQueue(() => {
        drawStaticLayers(layer_1_ctx, layer_4_ctx);
      });
    });

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
    const layer_4_ctx = layer_4.getContext('2d')!;

    const updateUnchangingLayers = () => {
      drawUnchangingLayers(layer_3_ctx);
    };

    const updateStaticLayers = () => {
      renderer.pushToRenderQueue(() => {
        drawStaticLayers(layer_1_ctx, layer_4_ctx);
      });
    };

    const flyInCells = (cells: CellPosition[]) => {
      state.selectedCells.length = 0;

      renderer.pushFlyInCells(cells, () => {
        cells.forEach(selectCell);
      });
    };

    subscribe('game:restart', updateUnchangingLayers);
    subscribe('cells:changed', updateStaticLayers);
    subscribe('selectedCells:changed', updateStaticLayers);
    subscribe('revealed:changed', updateStaticLayers);
    subscribe('tip:added', flyInCells);

    onCleanup(() => {
      unsubscribe('game:restart', updateUnchangingLayers);
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
    const layer_4_ctx = layer_5.getContext('2d')!;

    let prevTimeStamp = 0;

    let frame: number;

    let frames = 0;
    let fps = 0;
    let lastFpsUpdate = 0;

    const gameLoop = (timeStamp: number) => {
      const dt = (timeStamp - prevTimeStamp) / 1000;
      prevTimeStamp = timeStamp;

      frames += 1;

      if (timeStamp > lastFpsUpdate + 1000) {
        fps = frames;
        frames = 0;
        lastFpsUpdate = timeStamp;
      }

      renderer.drawBackground(layer_2_ctx);

      renderer.drawHighlightedRowColArea(layer_2_ctx, dt, state.highlightedCell);

      renderer.drawHighlightedCell(layer_2_ctx, dt, state.highlightedCell);

      renderer.drawFlyIn(layer_2_ctx, dt);

      renderer.drawBackground(layer_4_ctx);

      if (state.debug) {
        renderer.drawFPS(layer_4_ctx, fps);
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
      mode: props.mode(),
      tool: props.tool(),
      clickOutsideExceptions: props.clickOutsideExceptions.map((ref) => ref()),
    });

    onCleanup(cleanup);
  });

  createEffect(() => {
    renderer.setTheme(theme());

    const layer_1_ctx = layer_1.getContext('2d')!;
    const layer_3_ctx = layer_4.getContext('2d')!;
    const layer_4_ctx = layer_3.getContext('2d')!;

    drawStaticLayers(layer_1_ctx, layer_3_ctx);
    drawUnchangingLayers(layer_4_ctx);
  });

  return (
    <div class="relative">
      <canvas
        ref={layer_1!}
        class="pointer-events-none absolute inset-0"
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
          'relative select-none',
          'focus-visible:outline-none',
          usingTab() && 'focus-visible:ring-4 focus-visible:ring-offset-4',
          usingTab() && 'focus-visible:ring-bgfg-900 focus-visible:ring-offset-bgfg-100',
          usingTab() && 'dark:focus-visible:ring-bgfg-100 dark:focus-visible:ring-offset-bgfg-900',
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
        class="pointer-events-none absolute inset-0"
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth() + BUFFER_PADDING * 2}px`,
          height: `${canvasHeight() + BUFFER_PADDING * 2}px`,
          top: `-${BUFFER_PADDING}px`,
          left: `-${BUFFER_PADDING}px`,
        }}
      />
      <canvas
        ref={layer_4!}
        class="pointer-events-none absolute inset-0"
        width={canvasWidth() * scale}
        height={canvasHeight() * scale}
        style={{
          width: `${canvasWidth()}px`,
          height: `${canvasHeight()}px`,
        }}
      />
      <canvas
        ref={layer_5!}
        class="pointer-events-none absolute inset-0"
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
