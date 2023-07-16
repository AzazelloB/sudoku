import {
  ParentComponent,
  Show,
  createEffect,
  createSignal,
  onCleanup,
} from 'solid-js';

import { useTransitionContext } from '~/context/TransitionContext';

function getClassList(classes?: string): string[] {
  return classes ? classes.split(' ') : [];
}

function addClassList(ref: HTMLElement, classes: string[]) {
  const filtered = classes.filter((value) => value);
  if (filtered.length) {
    ref.classList.add(...filtered);
  }
}
function removeClassList(ref: HTMLElement, classes: string[]) {
  const filtered = classes.filter((value) => value);
  if (filtered.length) {
    ref.classList.remove(...filtered);
  }
}

interface ChildProps {
  class?: string;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
}

const Child: ParentComponent<ChildProps> = (props) => {
  const { show } = useTransitionContext();

  const [visible, setVisible] = createSignal(show());

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);
  let timeout: NodeJS.Timeout;

  const transition = (element: HTMLElement, shouldEnter: boolean) => {
    if (shouldEnter) {
      const enter = getClassList(props.enter);
      const enterFrom = getClassList(props.enterFrom);
      const enterTo = getClassList(props.enterTo);

      addClassList(element, enterFrom);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        addClassList(element, enter);
        removeClassList(element, enterFrom);
        addClassList(element, enterTo);
      }, 10);

      const endTransition = () => {
        removeClassList(element, enter);
        removeClassList(element, enterTo);
      };

      element.addEventListener('transitionend', endTransition, { once: true });
      element.addEventListener('animationend', endTransition, { once: true });

      onCleanup(() => {
        element.removeEventListener('transitionend', endTransition);
        element.removeEventListener('animationend', endTransition);
      });
    } else {
      const leave = getClassList(props.leave);
      const leaveFrom = getClassList(props.leaveFrom);
      const leaveTo = getClassList(props.leaveTo);

      addClassList(element, leave);
      addClassList(element, leaveFrom);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        removeClassList(element, leaveFrom);
        addClassList(element, leaveTo);
      }, 10);

      const endTransition = () => {
        removeClassList(element, leave);
        removeClassList(element, leaveTo);
        setVisible(false);
      };

      element.addEventListener('transitionend', endTransition, { once: true });
      element.addEventListener('animationend', endTransition, { once: true });

      onCleanup(() => {
        element.removeEventListener('transitionend', endTransition);
        element.removeEventListener('animationend', endTransition);
      });
    }
  };

  createEffect(() => {
    const shouldEnter = show();
    const element = ref();

    if (shouldEnter) {
      setVisible(true);
    }

    if (element instanceof HTMLElement) {
      transition(element, shouldEnter);
    }
  });

  return (
    <Show when={visible()}>
      <div
        ref={setRef}
        class={props.class}
      >
        {props.children}
      </div>
    </Show>
  );
};

export default Child;
