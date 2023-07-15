import {
  ParentComponent, Show, createEffect, createSignal,
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
  unmount?: boolean;
  appear?: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  entered?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  beforeEnter?: () => void;
  afterEnter?: () => void;
  beforeLeave?: () => void;
  afterLeave?: () => void;
}

const Child: ParentComponent<ChildProps> = (props) => {
  const { show } = useTransitionContext();

  const [visible, setVisisble] = createSignal(show());

  const [ref, setRef] = createSignal<HTMLElement>();

  let initial = true;

  function transition(element: HTMLElement, shouldEnter: boolean): void {
    if (shouldEnter) {
      if (initial) {
        const enter = getClassList(props.enter);
        const enterFrom = getClassList(props.enterFrom);
        const enterTo = getClassList(props.enterTo);
        const entered = getClassList(props.entered);

        const endTransition = () => {
          removeClassList(element, enter);
          removeClassList(element, enterTo);
          addClassList(element, entered);
          props.afterEnter?.();
        };

        props.beforeEnter?.();
        addClassList(element, enter);
        addClassList(element, enterFrom);

        requestAnimationFrame(() => {
          removeClassList(element, enterFrom);
          addClassList(element, enterTo);
          element.addEventListener('transitionend', endTransition, { once: true });
          element.addEventListener('animationend', endTransition, { once: true });
        });
      }
    } else {
      const leave = getClassList(props.leave);
      const leaveFrom = getClassList(props.leaveFrom);
      const leaveTo = getClassList(props.leaveTo);
      const entered = getClassList(props.entered);
      props.beforeLeave?.();
      removeClassList(element, entered);
      addClassList(element, leave);
      addClassList(element, leaveFrom);
      requestAnimationFrame(() => {
        removeClassList(element, leaveFrom);
        addClassList(element, leaveTo);
      });
      const endTransition = () => {
        removeClassList(element, leave);
        removeClassList(element, leaveTo);
        setVisisble(false);
        props.afterLeave?.();
      };
      element.addEventListener('transitionend', endTransition, { once: true });
      element.addEventListener('animationend', endTransition, { once: true });
    }
  }

  createEffect(() => {
    const shouldShow = show();

    if (shouldShow) {
      setVisisble(true);
    }

    const internalRef = ref();
    if (internalRef instanceof HTMLElement) {
      transition(internalRef, shouldShow);
    } else {
      // Ref is missing, reset initial
      initial = true;
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
