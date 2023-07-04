import { useHeadlessDisclosureProperties } from 'solid-headless';
import { ParentComponent, createSignal } from 'solid-js';

import useClickOutside from '~/hooks/useClickOutside';

const PopoverInContext: ParentComponent = (props) => {
  const { setState } = useHeadlessDisclosureProperties();

  const [ref, setRef] = createSignal<HTMLElement | null>(null);

  // TODO remove if PopoverOverlay is fixed
  useClickOutside(ref, () => {
    setState(false);
  });

  return (
    <div ref={setRef}>
      {props.children}
    </div>
  );
};

export default PopoverInContext;
