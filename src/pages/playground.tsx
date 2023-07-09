import { Component, For } from 'solid-js';

const primary = [
  'bg-primary-100',
  'bg-primary-200',
  'bg-primary-300',
  'bg-primary-400',
  'bg-primary-500',
  'bg-primary-600',
  'bg-primary-700',
  'bg-primary-800',
  'bg-primary-900',
];

const secondary = [
  'bg-secondary-100',
  'bg-secondary-200',
  'bg-secondary-300',
  'bg-secondary-400',
  'bg-secondary-500',
  'bg-secondary-600',
  'bg-secondary-700',
  'bg-secondary-800',
  'bg-secondary-900',
];

const bgfg = [
  'bg-bgfg-100',
  'bg-bgfg-200',
  'bg-bgfg-300',
  'bg-bgfg-400',
  'bg-bgfg-500',
  'bg-bgfg-600',
  'bg-bgfg-700',
  'bg-bgfg-800',
  'bg-bgfg-900',
];

const PlaygroundPage: Component = () => {
  return (
    <div class="flex justify-between">
      <div class="flex">
      <For each={[0, 1, 2, 3, 4, 5, 6, 7, 8]}>
        {(i) => (
          <div class={`h-12 w-12 ${primary[i]}`}>
            <div class="flex h-full items-center justify-center text-white">{(i + 1) * 100}</div>
          </div>
        )}
      </For>
      </div>
      <div class="flex">
      <For each={[0, 1, 2, 3, 4, 5, 6, 7, 8]}>
        {(i) => (
          <div class={`h-12 w-12 ${secondary[i]}`}>
            <div class="flex h-full items-center justify-center text-white">{(i + 1) * 100}</div>
          </div>
        )}
      </For>
      </div>
     <div class="flex">
     <For each={[0, 1, 2, 3, 4, 5, 6, 7, 8]}>
        {(i) => (
          <div class={`h-12 w-12 ${bgfg[i]}`}>
            <div class="flex h-full items-center justify-center text-white">{(i + 1) * 100}</div>
          </div>
        )}
      </For>
     </div>
    </div>
  );
};

export default PlaygroundPage;
