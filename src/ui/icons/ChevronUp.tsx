import { ComponentProps } from 'solid-js';

/* eslint-disable max-len */
const ChevronUp = (props: ComponentProps<any>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" {...props}>
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
};

export default ChevronUp;
