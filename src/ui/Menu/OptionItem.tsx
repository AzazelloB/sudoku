import { Component, ComponentProps, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';
import { MenuItem } from '@ark-ui/solid/menu';
import {
  Checkbox,
  CheckboxLabel,
  CheckboxInput,
} from '@ark-ui/solid/checkbox';

interface OptionItemProps extends Omit<ComponentProps<typeof MenuItem>, 'onChange'> {
  value: ComponentProps<typeof Checkbox>['value'];
  checked: ComponentProps<typeof Checkbox>['checked'];
  onChange: ComponentProps<typeof Checkbox>['onChange'];
}

// ark-ui has MenuOptionItem component, but checkbox doesn't work bc of a bug
// https://github.com/chakra-ui/zag/issues/758
// and they don't hurry up to fix it
const OptionItem: Component<OptionItemProps> = (props) => {
  const [checkboxProps, menuItemProps] = splitProps(props, [
    'value',
    'checked',
    'onChange',
    'children',
  ]);

  return (
    <Checkbox
      {...checkboxProps}
    >
      {(state) => (
        <MenuItem
          {...menuItemProps}
          class={twMerge(
            'px-4 py-2 cursor-pointer',
            'hover:bg-bgfg-300 dark:hover:bg-bgfg-700 data-[focus]:bg-bgfg-300 dark:data-[focus]:bg-bgfg-700',
            'data-[disabled]:opacity-50 data-[disabled]:cursor-default data-[disabled]:hover:!bg-inherit',
            menuItemProps.class,
          )}
        >
          <div class="flex items-center">
            <span class={twMerge(
              'w-2 h-2 rounded-full mr-2',
              state().isChecked
                ? 'bg-bgfg-900 dark:bg-bgfg-100'
                : 'border border-bgfg-900 dark:border-bgfg-100',
            )} />
            <CheckboxLabel class="whitespace-nowrap">
              {checkboxProps.children}
            </CheckboxLabel>
            <CheckboxInput />
          </div>
        </MenuItem>
      )}
    </Checkbox>
  );
};

export default OptionItem;
