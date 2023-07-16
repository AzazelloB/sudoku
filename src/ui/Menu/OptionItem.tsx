import { Component, ComponentProps } from 'solid-js';
import {
  MenuOptionItem,
} from '@ark-ui/solid/menu';
import { twMerge } from 'tailwind-merge';

type OptionItemProps = ComponentProps<typeof MenuOptionItem>;

const OptionItem: Component<OptionItemProps> = (props) => {
  return (
    <MenuOptionItem
      {...props}
      class={twMerge(
        'px-4 py-2 cursor-pointer',
        'hover:bg-bgfg-300 dark:hover:bg-bgfg-700 data-[focus]:bg-bgfg-300 dark:data-[focus]:bg-bgfg-700',
        'data-[disabled]:opacity-50 data-[disabled]:cursor-default data-[disabled]:hover:!bg-inherit',
        props.class,
      )}
    />
  );
};

export default OptionItem;
