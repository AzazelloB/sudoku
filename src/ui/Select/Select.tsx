import {
  Accessor, Component, For,
} from 'solid-js';
import {
  HeadlessDisclosureChild,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from 'solid-headless';
import { twMerge } from 'tailwind-merge';

import ChevronDown from '~/ui/icons/ChevronDown';

type Value = string | number;

export interface Option {
  label: string;
  value: Value;
  disabled?: boolean;
}

interface SelectProps {
  class?: string;
  label: string;
  selected: Accessor<Value[]>;
  setSelected: (options: Value[]) => void;
  options: Option[];
}

// TODO this is select multiple. For single select refactor
const Select: Component<SelectProps> = (props) => {
  return (
    <Listbox
      defaultOpen={false}
      toggleable
      multiple
      value={props.selected()}
      onSelectChange={props.setSelected}
    >
      <div class={twMerge(
        'relative w-max',
        props.class,
      )}>
        <ListboxButton>
          {({ isOpen }) => (
            <div class="flex items-center space-x-2 rounded-md border border-bgfg-400 px-2.5 py-1.5">
              <span>{props.label}</span>

              <ChevronDown class={twMerge(
                'h-4 w-4 transition',
                isOpen() && 'rotate-180',
              )} />
            </div>
          )}
        </ListboxButton>

        <HeadlessDisclosureChild>
          {({ isOpen }) => (
            <Transition
              show={isOpen()}
              enter="transition duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <ListboxOptions
                class={twMerge(
                  'absolute z-50 mt-1 min-w-full rounded-md overflow-hidden bg-bgfg-200 shadow-lg dark:bg-bgfg-800',
                )}
              >
                <For each={props.options}>
                  {(option) => (
                    <ListboxOption
                      value={option.value}
                      disabled={option.disabled}
                      class={twMerge(
                        'cursor-pointer bg-bgfg-200 px-3 py-2 dark:bg-bgfg-800',
                        'hover:brightness-90 dark:hover:brightness-110',
                        option.disabled && 'opacity-50 cursor-default hover:brightness-100 dark:hover:brightness-100',
                      )}
                    >
                      {({ isSelected }) => (
                        <div class="flex items-center">
                          <span class={twMerge(
                            'w-2 h-2 rounded-full mr-2',
                            isSelected()
                              ? 'bg-bgfg-900 dark:bg-bgfg-100'
                              : 'border border-bgfg-900 dark:border-bgfg-100',
                          )} />
                          <span class="whitespace-nowrap">
                            {option.label}
                          </span>
                        </div>
                      )}
                    </ListboxOption>
                  )}
                </For>
              </ListboxOptions>
            </Transition>
          )}
        </HeadlessDisclosureChild>
      </div>
    </Listbox>
  );
};

export default Select;
