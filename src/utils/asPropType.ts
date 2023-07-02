import SolidJS from 'solid-js';

export type AsProp<
  T extends SolidJS.Component,
  // eslint-disable-next-line @typescript-eslint/ban-types
  ComponentProps = {},
  Exceptions extends string = ''
> = {
as?: T,
} & ComponentProps & Omit<SolidJS.ComponentProps<T>, keyof ComponentProps | Exceptions>
