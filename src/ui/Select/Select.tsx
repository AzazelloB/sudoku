import {
  Accessor, Component, For, Setter, Show,
} from 'solid-js';
import {
  Listbox, ListboxButton, ListboxOption, ListboxOptions, useHeadlessSelectProperties,
} from 'solid-headless';

export interface Option {
  label: string;
  value: number | string;
  disabled?: boolean;
}

interface SelectProps {
  class?: string;
  selected: Accessor<Option[]>;
  setSelected: (options: Option[]) => void;
  options: Option[];
}

// TODO this is select multiple. For single select refactor
const Select: Component<SelectProps> = (props) => {
  return (
    <Listbox
      defaultOpen={false}
      multiple
      value={props.selected()}
      onSelectChange={props.setSelected}
      onDisclosureChange={(open) => console.log(open)}
    >
      <ListboxButton>btn</ListboxButton>

      <ListboxOptions>
        <For each={props.options}>
          {(option) => (
            <ListboxOption
              value={option}
              disabled={option.disabled}
            >
              {({ isSelected }) => (
                <span class={`${isSelected() ? 'text-red-400' : ''}`}>
                  {isSelected() ? '✅' : '❌'}
                  {option.label}
                </span>
              )}
            </ListboxOption>
          )}
        </For>
      </ListboxOptions>
    </Listbox>
  );
};

export default Select;
