import { ParentComponent } from 'solid-js';
import { TransitionProvider } from '~/context/TransitionContext';

import Child from '~/ui/Transition/Child';

interface TransitionComponent {
  Child: typeof Child;
}

interface TransitionProps {
  show: boolean;
}

const Transition: ParentComponent<TransitionProps> & TransitionComponent = (props) => {
  return (
    <TransitionProvider show={props.show}>
      {props.children}
    </TransitionProvider>
  );
};

Transition.Child = Child;

export default Transition;
