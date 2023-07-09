import { ParentComponent, Show } from 'solid-js';
import {
  PopoverOverlay,
  PopoverPanel,
  Transition,
  useHeadlessDisclosureProperties,
} from 'solid-headless';
import { twMerge } from 'tailwind-merge';

interface ContentProps {
  class?: string;
}

const Content: ParentComponent<ContentProps> = (props) => {
  const { isOpen } = useHeadlessDisclosureProperties();

  return (
    <>
      <Show when={isOpen()}>
        {/* TODO fix overlay, somehow solid-headless top Popover component breaks position fixed */}
        <PopoverOverlay class="fixed inset-0" />
      </Show>

      <Transition
        show={isOpen()}
        enter="transition duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel
          unmount
          class={twMerge(
            'absolute right-0 mt-1 z-50 w-max max-w-sm px-4 py-2',
            'bg-bgfg-200 dark:bg-bgfg-800 text-bgfg-800 dark:text-bgfg-100 rounded-md shadow-md',
            props.class,
          )}
        >
          {props.children}
        </PopoverPanel>
      </Transition>
    </>
  );
};

export default Content;
